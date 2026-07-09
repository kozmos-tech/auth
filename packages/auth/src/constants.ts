// Shared constants for the Kozmos client SDK.

/**
 * Header carrying the project's publishable key (`pk_live_…`) on every request.
 * The Kozmos backend uses it to resolve which project a request belongs to and
 * scope the end-user pool accordingly. Safe to expose in the browser.
 */
export const PUBLISHABLE_KEY_HEADER = "x-kozmos-publishable-key";

/**
 * Path the hosted Kozmos end-user auth API is mounted at. The backend serves it
 * from this path (kept distinct from the dashboard's own `/api/auth`). Override
 * via the `basePath` option only if you proxy it somewhere else.
 */
export const DEFAULT_BASE_PATH = "/api/kozmos/auth";

/** Prefix every publishable key starts with. */
export const PUBLISHABLE_KEY_PREFIX = "pk_";

/** Prefix every secret key starts with. */
export const SECRET_KEY_PREFIX = "sk_";
