# auth

Kozmos authentication — an open-source, MCP-native alternative to Clerk. Turborepo monorepo (npm workspaces).

## Structure

```
apps/
  web/                     @kozmos-auth/web   — admin dashboard (Next.js 16, App Router, Tailwind v4)
packages/
  ui/                      @kozmos-auth/ui    — shared components + shadcn registry
  db/                      @kozmos-auth/db    — Drizzle ORM schema (multi-tenant) + Postgres client
  auth/                    @kozmos-auth/auth  — Better Auth config (email/password + MCP OAuth)
  mcp/                     @kozmos-auth/mcp   — MCP server (@modelcontextprotocol/sdk)
  typescript-config/       @kozmos-auth/typescript-config — shared tsconfig bases
```

## Getting started

```sh
npm install
npm run dev          # runs all workspaces via turbo (web on http://localhost:3000)
```

Copy the `.env.example` files in `packages/db` and `packages/auth` and fill in `DATABASE_URL`,
`BETTER_AUTH_SECRET`, and `BETTER_AUTH_URL`.

## Common tasks

```sh
npm run build            # build everything
npm run check-types      # typecheck all workspaces

# packages/db
npm run db:generate      # generate a migration from src/schema.ts
npm run db:push          # push schema to the database (needs DATABASE_URL)
npm run db:studio        # open Drizzle Studio

# packages/ui
npm run build:registry   # build the shadcn registry JSON into public/r/

# packages/mcp
npm run dev              # start the MCP server on stdio
```

## Data model

The schema (`packages/db/src/schema.ts`) is multi-tenant, split into three layers:

- **Platform** — `platformUser` / `platformSession` / `platformAccount`. Your clients
  (developers) who sign in to the Kozmos dashboard. Email is globally unique here: one
  dashboard account per email. This is what the Better Auth instance in `@kozmos-auth/auth`
  authenticates, and what the MCP OAuth tables (`oauthApplication`, `oauthAccessToken`,
  `oauthConsent`) grant AI assistants access to.
- **Tenant** — `project`. Each project is owned by a `platformUser` and is an isolated
  authentication tenant with its own pool of end-users.
- **End-user** — `user` / `session` / `account`. The people who sign in to your clients'
  apps. Every row is scoped to a `project`, and email is unique **per project**
  (`UNIQUE(projectId, email)`), never globally. The same email in two projects is two
  different accounts, and an account can never log in to a project it does not belong to.

> Note: end-user auth (the project-scoped `user`/`session`/`account` tables) still needs to
> be wired up in `@kozmos-auth/auth` — currently that package only authenticates platform
> accounts. That's the next step, not part of the db layer.

## Using the UI components via shadcn

Once the registry is hosted, consumers can add components with:

```sh
npx shadcn add https://<your-host>/r/button.json
```

Inside this repo, run `npx shadcn add <component>` from `apps/web` — the CLI is configured
(via `components.json`) to install shared components into `packages/ui`.
