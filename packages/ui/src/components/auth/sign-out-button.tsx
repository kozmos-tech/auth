"use client";

import * as React from "react";

import { Button } from "@kozmos-auth/ui/components/button";
import {
  resolveActions,
  type KozmosClientProps,
} from "@kozmos-auth/ui/lib/kozmos-auth";

export interface SignOutButtonProps
  extends KozmosClientProps,
    Omit<React.ComponentProps<typeof Button>, "onClick"> {
  /** Where to send the user after signing out. Defaults to `/`. */
  redirectTo?: string;
  /** Called after sign-out instead of navigating (e.g. router.push). */
  onSignedOut?: () => void;
}

/** Signs the current end-user out, then navigates or calls `onSignedOut`. */
export function SignOutButton({
  client,
  redirectTo = "/",
  onSignedOut,
  children,
  disabled,
  ...props
}: SignOutButtonProps) {
  const { signOut } = resolveActions(client);
  const [pending, setPending] = React.useState(false);

  async function handleClick() {
    setPending(true);
    try {
      await signOut();
      if (onSignedOut) onSignedOut();
      else window.location.href = redirectTo;
    } catch {
      setPending(false);
    }
  }

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={disabled || pending}
      {...props}
    >
      {children ?? (pending ? "Signing out…" : "Sign out")}
    </Button>
  );
}
