// Shared plumbing for the Kozmos auth components.
//
// Every component works zero-config: it uses the default client from
// `@kozmos-auth/auth/react`, which reads NEXT_PUBLIC_KOZMOS_PUBLISHABLE_KEY /
// _API_URL from the environment. Pass an explicit `client` (built with
// `createKozmosClient`) to any component to override that.

import {
  signIn as defaultSignIn,
  signUp as defaultSignUp,
  signOut as defaultSignOut,
  signInWithGoogle as defaultSignInWithGoogle,
  useSession as useDefaultSession,
  type KozmosReactClient,
} from "@kozmos-auth/auth/react";

export type { KozmosReactClient };

/**
 * Reactive session state, from an explicit client or the default one. The
 * `client` is expected to be stable across renders (it's configuration), so the
 * branch here does not change hook order between renders.
 */
export function useKozmosSession(client?: KozmosReactClient) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return client ? client.useSession() : useDefaultSession();
}

/** Props shared by every component that talks to the Kozmos backend. */
export interface KozmosClientProps {
  /**
   * A client from `createKozmosClient(...)`. Omit to use the default,
   * environment-configured client.
   */
  client?: KozmosReactClient;
}

/** The auth actions, resolved from an explicit client or the default one. */
export function resolveActions(client?: KozmosReactClient) {
  if (client) {
    return {
      signIn: client.signIn,
      signUp: client.signUp,
      signOut: client.signOut.bind(client),
      signInWithGoogle: client.signInWithGoogle.bind(client),
    };
  }
  return {
    signIn: defaultSignIn,
    signUp: defaultSignUp,
    signOut: defaultSignOut,
    signInWithGoogle: defaultSignInWithGoogle,
  };
}

/** Pull a human-readable message out of whatever the SDK throws or returns. */
export function errorMessage(error: unknown): string {
  if (!error) return "Something went wrong. Please try again.";
  if (typeof error === "string") return error;
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.length > 0) return message;
  }
  return "Something went wrong. Please try again.";
}
