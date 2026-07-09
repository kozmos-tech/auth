// Configuration resolution for the Kozmos client SDK.
//
// The SDK is a thin, framework-agnostic client for a hosted Kozmos backend. It
// holds no database — it only needs to know which project it speaks for (the
// publishable/secret keys) and where the backend lives (the API URL). Values
// come from explicit options first, then environment variables.

import {
  DEFAULT_BASE_PATH,
  PUBLISHABLE_KEY_PREFIX,
  SECRET_KEY_PREFIX,
} from "./constants";

export interface KozmosClientOptions {
  /** Project publishable key (`pk_live_…`). Falls back to `NEXT_PUBLIC_KOZMOS_PUBLISHABLE_KEY`. */
  publishableKey?: string;
  /** Base URL of the Kozmos backend. Falls back to `NEXT_PUBLIC_KOZMOS_API_URL`. */
  apiUrl?: string;
  /** Path the auth API is mounted at. Defaults to `/api/auth`. */
  basePath?: string;
  /** Enable Google sign-in helpers. Falls back to `NEXT_PUBLIC_KOZMOS_GOOGLE`. */
  google?: boolean;
}

export interface KozmosServerOptions {
  /** Project secret key (`sk_live_…`). Falls back to `KOZMOS_SECRET_KEY`. */
  secretKey?: string;
  /** Base URL of the Kozmos backend. Falls back to `KOZMOS_API_URL`. */
  apiUrl?: string;
  /** Path the auth API is mounted at. Defaults to `/api/auth`. */
  basePath?: string;
}

export interface KozmosClientConfig {
  publishableKey: string;
  apiUrl: string;
  basePath: string;
  google: boolean;
}

export interface KozmosServerConfig {
  secretKey: string;
  apiUrl: string;
  basePath: string;
}

function readEnv(key: string): string | undefined {
  if (typeof process === "undefined" || !process.env) return undefined;
  const value = process.env[key];
  return value && value.length > 0 ? value : undefined;
}

function readEnvBool(key: string): boolean {
  const value = readEnv(key);
  return value === "true" || value === "1";
}

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

export function resolveClientConfig(
  options: KozmosClientOptions = {},
): KozmosClientConfig {
  const publishableKey =
    options.publishableKey ?? readEnv("NEXT_PUBLIC_KOZMOS_PUBLISHABLE_KEY");
  const apiUrl =
    options.apiUrl ??
    readEnv("NEXT_PUBLIC_KOZMOS_API_URL") ??
    readEnv("KOZMOS_API_URL");

  if (!publishableKey) {
    throw new Error(
      "[kozmos] Missing publishable key. Pass `publishableKey` or set NEXT_PUBLIC_KOZMOS_PUBLISHABLE_KEY.",
    );
  }
  if (!publishableKey.startsWith(PUBLISHABLE_KEY_PREFIX)) {
    throw new Error(
      `[kozmos] Invalid publishable key: expected it to start with "${PUBLISHABLE_KEY_PREFIX}".`,
    );
  }
  if (!apiUrl) {
    throw new Error(
      "[kozmos] Missing API URL. Pass `apiUrl` or set NEXT_PUBLIC_KOZMOS_API_URL.",
    );
  }

  return {
    publishableKey,
    apiUrl: stripTrailingSlash(apiUrl),
    basePath: options.basePath ?? DEFAULT_BASE_PATH,
    google: options.google ?? readEnvBool("NEXT_PUBLIC_KOZMOS_GOOGLE"),
  };
}

export function resolveServerConfig(
  options: KozmosServerOptions = {},
): KozmosServerConfig {
  const secretKey = options.secretKey ?? readEnv("KOZMOS_SECRET_KEY");
  const apiUrl =
    options.apiUrl ??
    readEnv("KOZMOS_API_URL") ??
    readEnv("NEXT_PUBLIC_KOZMOS_API_URL");

  if (!secretKey) {
    throw new Error(
      "[kozmos] Missing secret key. Pass `secretKey` or set KOZMOS_SECRET_KEY.",
    );
  }
  if (!secretKey.startsWith(SECRET_KEY_PREFIX)) {
    throw new Error(
      `[kozmos] Invalid secret key: expected it to start with "${SECRET_KEY_PREFIX}".`,
    );
  }
  if (!apiUrl) {
    throw new Error(
      "[kozmos] Missing API URL. Pass `apiUrl` or set KOZMOS_API_URL.",
    );
  }

  return {
    secretKey,
    apiUrl: stripTrailingSlash(apiUrl),
    basePath: options.basePath ?? DEFAULT_BASE_PATH,
  };
}
