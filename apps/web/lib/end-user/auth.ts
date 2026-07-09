import { db, schema } from "@kozmos-auth/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { tenantScopedAdapter } from "./scoped-adapter";
import { requireProjectId } from "./tenant-context";

// ============================================================================
// End-user auth — the hosted service the @kozmos-auth/auth SDK talks to.
//
// This is NOT the dashboard's own auth (that lives in ../auth.ts and owns the
// platform* tables). This instance authenticates each client's END-USERS: the
// project-scoped `user`/`session`/`account` pool. It is multi-tenant — one
// instance for every project — with per-request scoping supplied by the route
// handler (app/api/kozmos/auth/[...all]) via the tenant context.
//
// Mounted at /api/kozmos/auth so it never collides with the dashboard's
// /api/auth. The SDK targets this path by default (DEFAULT_BASE_PATH).
// ============================================================================

export const END_USER_BASE_PATH = "/api/kozmos/auth";

// Google is optional and configured centrally. It's only enabled when Kozmos-level
// OAuth credentials are present; the SDK's per-project `google` flag gates the
// button, this gates the provider. (Per-project Google credentials + tenant-aware
// social callbacks are a follow-up — the OAuth redirect can't carry the pk header.)
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const googleEnabled = Boolean(googleClientId && googleClientSecret);

// projectId is set from the request's tenant context, never from client input.
const withProjectId = <T extends Record<string, unknown>>(entity: T) => ({
  data: { ...entity, projectId: requireProjectId() },
});

export const endUserAuth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  basePath: END_USER_BASE_PATH,
  database: tenantScopedAdapter(
    drizzleAdapter(db, { provider: "pg", schema }),
  ),
  // Map onto the project-scoped end-user tables. projectId is declared so the
  // adapter persists it, but `input: false` keeps it out of the public API —
  // clients can never set or spoof which project a user belongs to.
  user: {
    modelName: "user",
    additionalFields: {
      projectId: { type: "string", required: false, input: false },
    },
  },
  session: {
    modelName: "session",
    additionalFields: {
      projectId: { type: "string", required: false, input: false },
    },
  },
  account: {
    modelName: "account",
    additionalFields: {
      projectId: { type: "string", required: false, input: false },
    },
  },
  verification: { modelName: "verification" },
  // The SDK runs on each customer's own origin (unknown ahead of time) and every
  // request is already gated by a valid project publishable key, so we trust the
  // calling origin. TODO: tighten to per-project allowed origins once stored.
  trustedOrigins: (request) => {
    const origin = request?.headers.get("origin");
    return origin ? [origin] : [];
  },
  emailAndPassword: {
    enabled: true,
  },
  ...(googleEnabled
    ? {
        socialProviders: {
          google: {
            clientId: googleClientId as string,
            clientSecret: googleClientSecret as string,
          },
        },
      }
    : {}),
  // Stamp projectId onto every new row before it's validated and written.
  databaseHooks: {
    user: { create: { before: async (user) => withProjectId(user) } },
    session: { create: { before: async (session) => withProjectId(session) } },
    account: { create: { before: async (account) => withProjectId(account) } },
  },
  advanced: {
    // The SDK runs in the customer's app on a different origin, so in production
    // the end-user session cookie must be cross-site (`SameSite=None; Secure`).
    // In dev we relax it — `Secure` cookies are dropped over http://localhost.
    defaultCookieAttributes:
      process.env.NODE_ENV === "production"
        ? { sameSite: "none", secure: true }
        : { sameSite: "lax", secure: false },
  },
});

export type EndUserSession = typeof endUserAuth.$Infer.Session;
