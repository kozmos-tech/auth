"use client";

// @kozmos-auth/auth/react — client SDK for React apps.
//
// Provides a configured Better Auth React client plus convenience bindings.
// Configure it one of two ways:
//   1. Zero-config: set NEXT_PUBLIC_KOZMOS_PUBLISHABLE_KEY / _API_URL and import
//      `signIn`, `signUp`, `signOut`, `useSession` directly.
//   2. Explicit: call `createKozmosClient({ publishableKey, apiUrl })`, or wrap
//      your tree in `<KozmosProvider>` and read the client with `useKozmosClient`.

import {
  createContext,
  createElement,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { createAuthClient } from "better-auth/react";

import { buildClientOptions } from "./index";
import type { CreateKozmosClientOptions } from "./index";

/**
 * Creates a Kozmos React client (session hook + auth actions), scoped to a
 * project. Adds a `signInWithGoogle` helper gated on the `google` flag.
 */
export function createKozmosClient(options: CreateKozmosClientOptions = {}) {
  const { clientOptions, config } = buildClientOptions(options);
  const client = createAuthClient(clientOptions);

  return Object.assign(client, {
    /**
     * Starts the Google OAuth flow. Throws if Google isn't enabled — pass
     * `google: true` (or set NEXT_PUBLIC_KOZMOS_GOOGLE=true) and enable Google
     * for your Kozmos project.
     */
    signInWithGoogle(params: { callbackURL?: string } = {}) {
      if (!config.google) {
        throw new Error(
          "[kozmos] Google sign-in is not enabled. Pass `google: true` to createKozmosClient and enable Google for your Kozmos project.",
        );
      }
      return client.signIn.social({
        provider: "google",
        callbackURL: params.callbackURL,
      });
    },
  });
}

export type KozmosReactClient = ReturnType<typeof createKozmosClient>;

// ---------------------------------------------------------------------------
// Zero-config default client
//
// Built lazily from environment variables on first use, so importing this
// module never throws when the keys aren't set (e.g. during tooling/tests).
// ---------------------------------------------------------------------------

let defaultClient: KozmosReactClient | null = null;

function getDefaultClient(): KozmosReactClient {
  if (!defaultClient) defaultClient = createKozmosClient();
  return defaultClient;
}

function lazyNamespace<K extends keyof KozmosReactClient>(
  key: K,
): KozmosReactClient[K] {
  return new Proxy({} as object, {
    get(_target, prop) {
      const namespace = getDefaultClient()[key] as Record<string | symbol, unknown>;
      return namespace[prop];
    },
  }) as KozmosReactClient[K];
}

/** `signIn.email(...)`, `signIn.social(...)` — bound to the default client. */
export const signIn = lazyNamespace("signIn");
/** `signUp.email(...)` — bound to the default client. */
export const signUp = lazyNamespace("signUp");

/** Signs the current end-user out. */
export function signOut(
  ...args: Parameters<KozmosReactClient["signOut"]>
): ReturnType<KozmosReactClient["signOut"]> {
  return getDefaultClient().signOut(...args);
}

/** Reactive session hook: `{ data, isPending, error, refetch }`. */
export function useSession(): ReturnType<KozmosReactClient["useSession"]> {
  return getDefaultClient().useSession();
}

/** Starts the Google OAuth flow using the default client. */
export function signInWithGoogle(
  params: { callbackURL?: string } = {},
): ReturnType<KozmosReactClient["signInWithGoogle"]> {
  return getDefaultClient().signInWithGoogle(params);
}

// ---------------------------------------------------------------------------
// Optional provider for explicit, prop-based configuration
// ---------------------------------------------------------------------------

const KozmosContext = createContext<KozmosReactClient | null>(null);

export interface KozmosProviderProps extends CreateKozmosClientOptions {
  /** Supply a pre-built client instead of config props. */
  client?: KozmosReactClient;
  children: ReactNode;
}

/**
 * Provides a configured Kozmos client to descendants. Pass config props
 * (`publishableKey`, `apiUrl`, `google`) or a pre-built `client`.
 */
export function KozmosProvider({
  client,
  children,
  ...options
}: KozmosProviderProps) {
  const value = useMemo(
    () => client ?? createKozmosClient(options),
    // Rebuild only when the identifying config changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [client, options.publishableKey, options.apiUrl, options.google],
  );
  return createElement(KozmosContext.Provider, { value }, children);
}

/** Reads the client supplied by the nearest `<KozmosProvider>`. */
export function useKozmosClient(): KozmosReactClient {
  const client = useContext(KozmosContext);
  if (!client) {
    throw new Error(
      "[kozmos] useKozmosClient must be used within a <KozmosProvider>.",
    );
  }
  return client;
}
