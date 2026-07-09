"use client";

import * as React from "react";

import {
  useKozmosSession,
  type KozmosClientProps,
} from "@kozmos-auth/ui/lib/kozmos-auth";

export interface AuthGateProps extends KozmosClientProps {
  children: React.ReactNode;
}

/** Renders its children only when an end-user is signed in. */
export function SignedIn({ client, children }: AuthGateProps) {
  const { data, isPending } = useKozmosSession(client);
  if (isPending || !data) return null;
  return <>{children}</>;
}

/** Renders its children only when no end-user is signed in. */
export function SignedOut({ client, children }: AuthGateProps) {
  const { data, isPending } = useKozmosSession(client);
  if (isPending || data) return null;
  return <>{children}</>;
}

/** Renders its children while the session is still being resolved. */
export function AuthLoading({ client, children }: AuthGateProps) {
  const { isPending } = useKozmosSession(client);
  if (!isPending) return null;
  return <>{children}</>;
}
