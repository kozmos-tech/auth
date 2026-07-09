// @kozmos-auth/auth — core (framework-agnostic) entry point.
//
// Kozmos is a hosted, MCP-native alternative to Clerk. This package is the
// client SDK a developer installs into their own app to add auth for their
// end-users. It talks to the hosted Kozmos backend over HTTP, scoped to a
// project by the publishable key. It holds no database.
//
// This core entry has no React/Next/Hono dependency — it exposes the vanilla
// client plus the shared config and types. Use `@kozmos-auth/auth/react` in the
// browser, `/next` in a Next.js app, or `/hono` in a Hono app.

import { createAuthClient } from "better-auth/client";
import type { BetterAuthClientOptions } from "better-auth/client";

import { resolveClientConfig } from "./config";
import type { KozmosClientConfig, KozmosClientOptions } from "./config";
import { PUBLISHABLE_KEY_HEADER } from "./constants";

export {
  PUBLISHABLE_KEY_HEADER,
  DEFAULT_BASE_PATH,
  PUBLISHABLE_KEY_PREFIX,
  SECRET_KEY_PREFIX,
} from "./constants";
export {
  resolveClientConfig,
  resolveServerConfig,
} from "./config";
export type {
  KozmosClientOptions,
  KozmosServerOptions,
  KozmosClientConfig,
  KozmosServerConfig,
} from "./config";

/** Fetch options accepted by the underlying Better Auth client. */
export type ClientFetchOptions = NonNullable<
  BetterAuthClientOptions["fetchOptions"]
>;

export interface CreateKozmosClientOptions extends KozmosClientOptions {
  /** Extra fetch options merged into every request (headers, hooks, etc.). */
  fetchOptions?: ClientFetchOptions;
}

/**
 * The end-user as returned by the Kozmos backend (standard Better Auth shape).
 */
export interface KozmosUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** A single active session for an end-user. */
export interface KozmosSessionData {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Result of resolving a session: the user and their session row. */
export interface KozmosSession {
  user: KozmosUser;
  session: KozmosSessionData;
}

/**
 * Builds the Better Auth client options for a project, injecting the publishable
 * key header on every request. Shared by the core and React clients.
 */
export function buildClientOptions(options: CreateKozmosClientOptions = {}): {
  config: KozmosClientConfig;
  clientOptions: BetterAuthClientOptions;
} {
  const config = resolveClientConfig(options);
  const { fetchOptions } = options;

  const clientOptions: BetterAuthClientOptions = {
    baseURL: config.apiUrl,
    basePath: config.basePath,
    fetchOptions: {
      ...fetchOptions,
      headers: {
        [PUBLISHABLE_KEY_HEADER]: config.publishableKey,
        ...(fetchOptions?.headers as Record<string, string> | undefined),
      },
    },
  };

  return { config, clientOptions };
}

/**
 * Creates a framework-agnostic Kozmos client. In React apps prefer
 * `createKozmosClient` from `@kozmos-auth/auth/react` for hooks.
 */
export function createKozmosClient(options: CreateKozmosClientOptions = {}) {
  const { clientOptions } = buildClientOptions(options);
  return createAuthClient(clientOptions);
}
