import { db, schema } from "@kozmos-auth/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { mcp } from "better-auth/plugins";

// Auth for the Kozmos dashboard itself. This authenticates *platform* accounts
// (our clients who sign in to manage their projects), so it maps Better Auth's
// core models onto the platform* tables. The plain user/session/account tables
// are the project-scoped end-user pool and belong to each client's own app —
// not to this instance.
export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  user: { modelName: "platformUser" },
  session: { modelName: "platformSession" },
  account: { modelName: "platformAccount" },
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    mcp({
      loginPage: "/sign-in",
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
