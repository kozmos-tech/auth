// Resolves the project a request belongs to from its Kozmos API key.
//
// Two key channels, mirroring the SDK:
//   - publishable key (`pk_live_…`) in the `x-kozmos-publishable-key` header —
//     browser-safe, sent by the client SDK.
//   - secret key (`sk_live_…`) as an `Authorization: Bearer` token — server-only,
//     sent by the SDK's `verifySession`.
// The header channel must carry a publishable key and the Bearer channel a
// secret key; a mismatch is rejected so a leaked secret can't be used from a
// browser and vice-versa.

import { db, schema } from "@kozmos-auth/db";
import { eq } from "drizzle-orm";

// Kept in sync with the SDK's PUBLISHABLE_KEY_HEADER constant (@kozmos-auth/auth).
const PUBLISHABLE_KEY_HEADER = "x-kozmos-publishable-key";
const BEARER_PREFIX = "Bearer ";

export interface Tenant {
  projectId: string;
  keyType: "publishable" | "secret";
}

export async function resolveTenant(req: Request): Promise<Tenant | null> {
  const pk = req.headers.get(PUBLISHABLE_KEY_HEADER)?.trim();
  const authorization = req.headers.get("authorization");

  let token: string | undefined;
  let channel: "publishable" | "secret" | undefined;

  if (pk) {
    token = pk;
    channel = "publishable";
  } else if (authorization?.startsWith(BEARER_PREFIX)) {
    token = authorization.slice(BEARER_PREFIX.length).trim();
    channel = "secret";
  }

  if (!token || !channel) return null;

  const [row] = await db
    .select({ projectId: schema.apiKey.projectId, type: schema.apiKey.type })
    .from(schema.apiKey)
    .where(eq(schema.apiKey.token, token))
    .limit(1);

  if (!row) return null;

  // The key's type must match the channel it arrived on.
  if (row.type !== channel) return null;

  return { projectId: row.projectId, keyType: channel };
}
