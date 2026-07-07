# auth

Kozmos authentication — an open-source, MCP-native alternative to Clerk. Turborepo monorepo (npm workspaces).

## Structure

```
apps/
  web/                     @kozmos-auth/web   — admin dashboard (Next.js 16, App Router, Tailwind v4)
packages/
  ui/                      @kozmos-auth/ui    — shared components + shadcn registry
  db/                      @kozmos-auth/db    — Drizzle ORM schema + Postgres client
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

## Using the UI components via shadcn

Once the registry is hosted, consumers can add components with:

```sh
npx shadcn add https://<your-host>/r/button.json
```

Inside this repo, run `npx shadcn add <component>` from `apps/web` — the CLI is configured
(via `components.json`) to install shared components into `packages/ui`.
