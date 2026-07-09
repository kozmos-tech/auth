// @kozmos-auth/auth/server — server-side session verification.
//
// Framework-neutral. Used from your backend (Next.js server components/route
// handlers, Hono, plain Node) to verify an end-user's session against the
// Kozmos backend. Authenticates with the project's secret key (`sk_live_…`) as
// a Bearer token and forwards the inbound session cookie.

import { createAuthClient } from "better-auth/client";
import type { BetterAuthClientOptions } from "better-auth/client";

import { resolveServerConfig } from "./config";
import type { KozmosServerOptions } from "./config";
import type { KozmosSession } from "./index";

/**
 * Creates a server client that carries the secret key on every request. Use it
 * for trusted server-to-server calls to the Kozmos backend.
 */
export function createServerClient(options: KozmosServerOptions = {}) {
  const config = resolveServerConfig(options);
  const clientOptions: BetterAuthClientOptions = {
    baseURL: config.apiUrl,
    basePath: config.basePath,
    fetchOptions: {
      auth: { type: "Bearer", token: config.secretKey },
    },
  };
  return createAuthClient(clientOptions);
}

/** Converts a `Headers`/record into a plain header record we can forward. */
function toHeaderRecord(
  headers: Headers | Record<string, string>,
): Record<string, string> {
  if (headers instanceof Headers) {
    const record: Record<string, string> = {};
    headers.forEach((value, key) => {
      record[key] = value;
    });
    return record;
  }
  return headers;
}

/**
 * Verifies the session for an incoming request. Pass the request's headers
 * (their session cookie is forwarded to the Kozmos backend). Returns the
 * `{ user, session }` pair, or `null` if there is no valid session.
 */
export async function verifySession(
  headers: Headers | Record<string, string>,
  options: KozmosServerOptions = {},
): Promise<KozmosSession | null> {
  const client = createServerClient(options);
  const result = await client.getSession({
    fetchOptions: { headers: toHeaderRecord(headers) },
  });

  if (!result || result.error || !result.data) return null;
  return result.data as unknown as KozmosSession;
}
