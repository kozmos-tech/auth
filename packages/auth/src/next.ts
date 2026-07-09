// @kozmos-auth/auth/next — Next.js server helpers.
//
// Read the current end-user session in server components and route handlers,
// and protect routes with middleware. All of these run on the server and use
// the secret key; use `@kozmos-auth/auth/react` in client components.

import { headers as nextHeaders } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { verifySession } from "./server";
import type { KozmosServerOptions } from "./config";
import type { KozmosSession } from "./index";

/**
 * Resolves the current end-user session from the incoming request cookies.
 * Call from a server component, route handler, or server action.
 * Returns `{ user, session }` or `null`.
 */
export async function getSession(
  options: KozmosServerOptions = {},
): Promise<KozmosSession | null> {
  const requestHeaders = await nextHeaders();
  return verifySession(requestHeaders, options);
}

/** Alias for {@link getSession}. */
export const auth = getSession;

export interface KozmosMiddlewareOptions extends KozmosServerOptions {
  /** Where to send unauthenticated requests. Defaults to `/sign-in`. */
  signInUrl?: string;
  /**
   * Return `true` for requests that require a session. When omitted, every
   * matched request is protected (pair it with a `config.matcher`).
   */
  isProtected?: (request: NextRequest) => boolean;
}

/**
 * Builds a Next.js middleware that redirects unauthenticated requests to the
 * sign-in page. Wire it up in your `middleware.ts` and supply a `matcher`:
 *
 * ```ts
 * export default createKozmosMiddleware();
 * export const config = { matcher: ["/dashboard/:path*"] };
 * ```
 */
export function createKozmosMiddleware(options: KozmosMiddlewareOptions = {}) {
  const { signInUrl = "/sign-in", isProtected, ...serverOptions } = options;

  return async function middleware(request: NextRequest) {
    if (isProtected && !isProtected(request)) {
      return NextResponse.next();
    }

    const session = await verifySession(request.headers, serverOptions);
    if (!session) {
      const url = new URL(signInUrl, request.url);
      url.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  };
}
