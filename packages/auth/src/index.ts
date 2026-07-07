import { db, schema } from "@kozmos-auth/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { mcp } from "better-auth/plugins";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    mcp({
      loginPage: "/sign-in",
    }),
  ],
});

export type Auth = typeof auth;
export type Session = typeof auth.$Infer.Session;

// Re-exported so @kozmos-auth/mcp can guard requests with the same auth instance.
export { withMcpAuth } from "better-auth/plugins";
