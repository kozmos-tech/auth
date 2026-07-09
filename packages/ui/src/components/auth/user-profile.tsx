"use client";

import * as React from "react";

import { cn } from "@kozmos-auth/ui/lib/utils";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@kozmos-auth/ui/components/avatar";
import {
  Card,
  CardContent,
  CardHeader,
} from "@kozmos-auth/ui/components/card";
import { SignOutButton } from "@kozmos-auth/ui/components/auth/sign-out-button";
import {
  useKozmosSession,
  type KozmosClientProps,
} from "@kozmos-auth/ui/lib/kozmos-auth";

export interface UserProfileProps extends KozmosClientProps {
  /** Where to send the user after signing out. Defaults to `/`. */
  redirectTo?: string;
  /** Called after sign-out instead of navigating (e.g. router.push). */
  onSignedOut?: () => void;
  /** Hide the sign-out button. */
  hideSignOut?: boolean;
  /** Rendered when no user is signed in. Defaults to nothing. */
  fallback?: React.ReactNode;
  className?: string;
}

/** Two-letter initials from a name or email, for the avatar fallback. */
function initials(name: string, email: string): string {
  const source = name.trim() || email.trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

/**
 * Displays the current end-user (avatar, name, email, verified state) with a
 * sign-out button. Renders `fallback` when signed out.
 */
export function UserProfile({
  client,
  redirectTo = "/",
  onSignedOut,
  hideSignOut = false,
  fallback = null,
  className,
}: UserProfileProps) {
  const { data, isPending } = useKozmosSession(client);

  if (isPending) {
    return (
      <Card className={cn("w-full max-w-sm", className)}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="size-10 animate-pulse rounded-full bg-muted" />
            <div className="flex flex-col gap-2">
              <div className="h-4 w-28 animate-pulse rounded bg-muted" />
              <div className="h-3 w-40 animate-pulse rounded bg-muted" />
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  if (!data) return <>{fallback}</>;

  const { user } = data;
  const name = user.name ?? "";
  const email = user.email ?? "";

  return (
    <Card className={cn("w-full max-w-sm", className)}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar className="size-10">
            {user.image && <AvatarImage src={user.image} alt={name} />}
            <AvatarFallback>{initials(name, email)}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col">
            {name && (
              <span className="truncate font-medium leading-tight">{name}</span>
            )}
            <span className="truncate text-sm text-muted-foreground">
              {email}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-xs">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 font-medium",
              user.emailVerified
                ? "bg-secondary text-secondary-foreground"
                : "bg-muted text-muted-foreground",
            )}
          >
            {user.emailVerified ? "Email verified" : "Email unverified"}
          </span>
        </div>
        {!hideSignOut && (
          <SignOutButton
            client={client}
            variant="outline"
            redirectTo={redirectTo}
            onSignedOut={onSignedOut}
          />
        )}
      </CardContent>
    </Card>
  );
}
