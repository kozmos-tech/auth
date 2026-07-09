// @kozmos-auth/auth/hono — Hono middleware.
//
// Verifies the end-user session on each request and exposes it on the context.
// Type your app with `KozmosEnv` to get a typed `c.get("user")`.

import type { MiddlewareHandler } from "hono";

import { verifySession } from "./server";
import type { KozmosServerOptions } from "./config";
import type { KozmosSessionData, KozmosUser } from "./index";

/**
 * Context variables set by {@link kozmosAuth}. Use as
 * `new Hono<KozmosEnv>()` for typed `c.get("user")` / `c.get("session")`.
 */
export interface KozmosEnv {
  Variables: {
    user: KozmosUser | null;
    session: KozmosSessionData | null;
  };
}

export interface KozmosAuthOptions extends KozmosServerOptions {
  /** Respond with 401 when there is no valid session. Defaults to `false`. */
  required?: boolean;
}

/**
 * Hono middleware that resolves the current end-user session and sets
 * `c.set("user")` / `c.set("session")`. With `required: true`, unauthenticated
 * requests get a `401` instead of `null`.
 */
export function kozmosAuth(
  options: KozmosAuthOptions = {},
): MiddlewareHandler<KozmosEnv> {
  const { required = false, ...serverOptions } = options;

  return async function middleware(c, next) {
    const session = await verifySession(c.req.raw.headers, serverOptions);

    if (!session) {
      if (required) return c.json({ error: "Unauthorized" }, 401);
      c.set("user", null);
      c.set("session", null);
      return next();
    }

    c.set("user", session.user);
    c.set("session", session.session);
    return next();
  };
}
