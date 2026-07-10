# @kozmos-auth/ui

Prebuilt auth UI for [Kozmos](https://github.com/) — a hosted, MCP-native
alternative to Clerk. Drop-in **sign-in / sign-up / sign-out / profile**
components wired to the [`@kozmos-auth/auth`](../auth) SDK, plus a
framework-agnostic server-rendered HTML page. Get a working auth screen for your
end-users without hand-wiring Better Auth.

This is a [shadcn/ui](https://ui.shadcn.com) **registry** (new-york style,
neutral base color), not an npm package you install. You pull the components into
your own project with the shadcn CLI, and they land as **editable source you
own** — real files in your codebase you can restyle and rewrite, not a black box
dependency.

> **Status:** these components talk to the hosted Kozmos end-user backend, which
> is still being built. The UI is correct and stable, but a real sign-in can't
> complete until the backend is live. See [`@kozmos-auth/auth`](../auth) for the
> HTTP contract it assumes.

## What's in the box

| Registry item | What you get | Lands at |
| --- | --- | --- |
| `kozmos-auth` | `SignInForm`, `SignUpForm`, `SignOutButton`, `UserProfile`, `SignedIn`, `SignedOut`, `AuthLoading` + primitives (`button`, `input`, `label`, `card`, `avatar`) | `@/components/auth/*`, `@/components/ui/*` |
| `kozmos-auth-html` | `renderAuthPage()` → complete HTML string (Hono / Express / plain Node) | `@/lib/auth-page` |

The React components are all `"use client"` and depend only on the
`@kozmos-auth/auth/react` SDK (added for you on install). The HTML page has no
React dependency — it's a self-contained document with inline CSS and vanilla
`fetch`.

## Install

Install with the shadcn CLI. Your project needs **Tailwind CSS v4** and
**shadcn/ui** already set up — run `npx shadcn@latest init` first if it isn't.

```sh
# React components (forms, gates, profile) + primitives
npx shadcn@latest add https://auth.kozmos.tech/r/kozmos-auth.json

# Optional: the framework-agnostic HTML page for non-React servers
npx shadcn@latest add https://auth.kozmos.tech/r/kozmos-auth-html.json
```

This copies the source into your project, wires the Kozmos theme tokens into
your `globals.css`, and adds `@kozmos-auth/auth` to your dependencies. After
installing, import from **your own project paths** (`@/components/...`,
`@/lib/...`) — the examples below use those paths.

> **Inside this monorepo?** `apps/web` consumes the package directly as a
> workspace dependency (`@kozmos-auth/ui/components/auth/*`) instead of going
> through the registry. Outside apps always use the shadcn CLI above.

## Configure

The components get their configuration from the `@kozmos-auth/auth` SDK. The
simplest path is **zero-config**: set the public env vars and every component
uses the default client automatically.

```sh
NEXT_PUBLIC_KOZMOS_PUBLISHABLE_KEY="pk_live_..."
NEXT_PUBLIC_KOZMOS_API_URL="https://auth.kozmos.tech"
NEXT_PUBLIC_KOZMOS_GOOGLE="true"   # optional — enables the Google button
```

Prefer explicit config? Build a client with `createKozmosClient(...)` and pass
it to any component via the `client` prop (see [Using an explicit
client](#using-an-explicit-client)).

## React components

### `SignInForm` / `SignUpForm`

Email/password cards. Zero-config, or pass a `client`. Both render a "Continue
with Google" button when `google` is set (Google must also be enabled on the
client).

```tsx
"use client";
import { SignInForm } from "@/components/auth/sign-in-form";

export default function SignInPage() {
  return (
    <div className="grid min-h-svh place-items-center">
      <SignInForm google callbackURL="/dashboard" signUpUrl="/sign-up" />
    </div>
  );
}
```

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `google` | `boolean` | `false` | Show the Google button |
| `callbackURL` | `string` | `"/"` | Where to go after success |
| `onSuccess` | `() => void` | — | Called instead of navigating (e.g. `router.push`) |
| `signUpUrl` / `signInUrl` | `string` | — | Footer link to the other page |
| `minPasswordLength` | `number` | `8` | `SignUpForm` only |
| `title` / `description` | `ReactNode` | sensible defaults | Header text |
| `client` | `KozmosReactClient` | default client | Override the env-configured client |
| `className` | `string` | — | Merged onto the card |

By default a successful submit sets `window.location.href = callbackURL`. Pass
`onSuccess` to take over navigation (e.g. Next.js `router.push`).

### `SignOutButton`

Signs the current end-user out, then navigates (`redirectTo`, default `/`) or
calls `onSignedOut`. Accepts all `Button` props (`variant`, `size`, `children`, …).

```tsx
import { SignOutButton } from "@/components/auth/sign-out-button";

<SignOutButton variant="outline" redirectTo="/sign-in" />
```

### `UserProfile`

Card showing the signed-in end-user (avatar, name, email, verified badge) with a
sign-out button. Shows a skeleton while the session resolves and renders
`fallback` when signed out.

```tsx
import { UserProfile } from "@/components/auth/user-profile";

<UserProfile redirectTo="/sign-in" fallback={<p>Not signed in</p>} />
```

Props: `redirectTo`, `onSignedOut`, `hideSignOut`, `fallback`, `client`, `className`.

### Gates: `SignedIn` / `SignedOut` / `AuthLoading`

Conditionally render on session state — Clerk-style. Each renders its children
only in the matching state and `null` otherwise.

```tsx
import { SignedIn, SignedOut, AuthLoading } from "@/components/auth/auth-gate";

<AuthLoading><Spinner /></AuthLoading>
<SignedIn><UserProfile /></SignedIn>
<SignedOut><SignInForm signUpUrl="/sign-up" /></SignedOut>
```

### Using an explicit client

Every component accepts a `client` prop, so you can run multiple projects or
skip the env vars entirely. The client is configuration — build it once and keep
it stable across renders.

```tsx
"use client";
import { createKozmosClient } from "@kozmos-auth/auth/react";
import { SignInForm } from "@/components/auth/sign-in-form";

const client = createKozmosClient({
  publishableKey: "pk_live_...",
  apiUrl: "https://auth.kozmos.tech",
  google: true,
});

export function Login() {
  return <SignInForm client={client} google />;
}
```

## Server-rendered HTML (`renderAuthPage`)

For non-React servers (Hono, Express, plain Node), `renderAuthPage(opts)` returns
a complete, self-contained HTML document — inline CSS, theme-aware, vanilla
`fetch` straight to the backend with `credentials: "include"` and the
`x-kozmos-publishable-key` header. No build step, no client bundle. Install it
with `npx shadcn@latest add https://auth.kozmos.tech/r/kozmos-auth-html.json`.

```ts
import { Hono } from "hono";
import { renderAuthPage } from "@/lib/auth-page";

const app = new Hono();

app.get("/sign-in", (c) =>
  c.html(renderAuthPage({
    mode: "sign-in",
    apiUrl: "https://auth.kozmos.tech",
    publishableKey: "pk_live_...",
    redirectTo: "/",
    signUpPath: "/sign-up",
    google: true,
  })),
);

app.get("/sign-up", (c) =>
  c.html(renderAuthPage({ mode: "sign-up", apiUrl: "...", publishableKey: "pk_live_...", signInPath: "/sign-in" })),
);
```

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `mode` | `"sign-in" \| "sign-up"` | `"sign-in"` | Which form to render |
| `apiUrl` | `string` | — | **Required.** Base URL of the Kozmos backend |
| `publishableKey` | `string` | — | **Required.** `pk_live_…` |
| `basePath` | `string` | `/api/kozmos/auth` | Path the auth API is mounted at |
| `redirectTo` | `string` | `"/"` | Where to go after success |
| `signInPath` / `signUpPath` | `string` | — | Link to the other page |
| `google` | `boolean` | `false` | Show the Google button |
| `brand` | `string` | `"Kozmos"` | Header label |
| `title` | `string` | `"<action> · <brand>"` | Page `<title>` |

## Styling

Built on Tailwind v4 tokens (`bg-muted`, `text-destructive`, …). `shadcn add`
merges the Kozmos theme variables into your project's `globals.css` on install,
so the components inherit your app's light/dark theme with no extra import. The
React cards default to `w-full max-w-sm`; center them with your own layout (e.g.
a `grid place-items-center` wrapper) and pass `className` to adjust. The HTML
page ships its own scoped CSS and needs no Tailwind.

## Registry (maintainers)

`registry.json` defines the shadcn items; `npm run build:registry` (`shadcn
build`) emits `public/r/*.json`, which you host so consumers can `npx shadcn add`
them. Two items ship:

- **`kozmos-auth`** — all five auth components plus their primitives (`button`,
  `input`, `label`, `card`, `avatar`) and the shared `lib/kozmos-auth.ts`
  plumbing.
- **`kozmos-auth-html`** — the standalone `renderAuthPage()` HTML file for
  non-React servers.

After editing components or adding items, re-run `npm run build:registry` and
serve the refreshed `public/r/*.json` from your registry host.
