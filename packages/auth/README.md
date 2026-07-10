# @kozmos-auth/auth

Client SDK for [Kozmos](https://github.com/) — a hosted, MCP-native alternative to
Clerk. Install it in your own app to add authentication for **your** end-users:
email/password out of the box, Google optionally. Works in **Next.js** and **Hono**.

> **Status:** this SDK is published-ready but the hosted Kozmos end-user auth
> backend is still being built. The client is correct and stable, but it can't
> complete a real sign-in until the backend is live. Point `apiUrl` at your
> Kozmos backend when it's available.

## Install

```sh
npm install @kozmos-auth/auth
```

`react`, `next`, and `hono` are optional peer dependencies — install only what
your app already uses.

## Configure

Create a project in the Kozmos dashboard to get your keys, then set:

```sh
# Client (browser-safe)
NEXT_PUBLIC_KOZMOS_PUBLISHABLE_KEY="pk_live_..."
NEXT_PUBLIC_KOZMOS_API_URL="https://auth.kozmos.tech"
NEXT_PUBLIC_KOZMOS_GOOGLE="true"   # optional — enables Google sign-in helpers

# Server (never exposed to the browser)
KOZMOS_SECRET_KEY="sk_live_..."
KOZMOS_API_URL="https://auth.kozmos.tech"
```

Prefer explicit config? Pass the values to `createKozmosClient` /
`createServerClient` instead of using env vars.

## Next.js

Client component:

```tsx
"use client";
import { signIn, signUp, useSession, signInWithGoogle } from "@kozmos-auth/auth/react";

export function SignInForm() {
  const { data, isPending } = useSession();
  if (data) return <p>Signed in as {data.user.email}</p>;

  return (
    <>
      <button onClick={() => signIn.email({ email, password })}>Sign in</button>
      <button onClick={() => signInWithGoogle()}>Continue with Google</button>
    </>
  );
}
```

Server component / route handler:

```ts
import { getSession } from "@kozmos-auth/auth/next";

export default async function Page() {
  const session = await getSession();
  if (!session) return <p>Not signed in</p>;
  return <p>Hello {session.user.name}</p>;
}
```

Protect routes with middleware (`middleware.ts`):

```ts
import { createKozmosMiddleware } from "@kozmos-auth/auth/next";

export default createKozmosMiddleware({ signInUrl: "/sign-in" });
export const config = { matcher: ["/dashboard/:path*"] };
```

## Hono

```ts
import { Hono } from "hono";
import { kozmosAuth, type KozmosEnv } from "@kozmos-auth/auth/hono";

const app = new Hono<KozmosEnv>();
app.use(kozmosAuth());               // or kozmosAuth({ required: true }) to 401

app.get("/me", (c) => {
  const user = c.get("user");        // typed as KozmosUser | null
  return user ? c.json(user) : c.json({ error: "anon" }, 401);
});
```

## Entry points

| Import | Use in |
| --- | --- |
| `@kozmos-auth/auth` | Framework-agnostic core: `createKozmosClient`, types, config helpers |
| `@kozmos-auth/auth/react` (`/client`) | React: hooks, `signIn`/`signUp`/`signOut`, `KozmosProvider` |
| `@kozmos-auth/auth/server` | Server: `createServerClient`, `verifySession(headers)` |
| `@kozmos-auth/auth/next` | Next.js: `getSession`/`auth`, `createKozmosMiddleware` |
| `@kozmos-auth/auth/hono` | Hono: `kozmosAuth`, `KozmosEnv` |

## How it works

The SDK is built on [Better Auth](https://better-auth.com)'s client, so it speaks
the same HTTP protocol the Kozmos backend serves. Every request carries the
publishable key as an `x-kozmos-publishable-key` header (which scopes it to your
project); server-side session verification additionally sends the secret key as
`Authorization: Bearer sk_live_…`. The SDK holds no database.
