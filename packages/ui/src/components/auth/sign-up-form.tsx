"use client";

import * as React from "react";

import { cn } from "@kozmos-auth/ui/lib/utils";
import { Button } from "@kozmos-auth/ui/components/button";
import { Input } from "@kozmos-auth/ui/components/input";
import { Label } from "@kozmos-auth/ui/components/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@kozmos-auth/ui/components/card";
import {
  errorMessage,
  resolveActions,
  type KozmosClientProps,
} from "@kozmos-auth/ui/lib/kozmos-auth";

export interface SignUpFormProps extends KozmosClientProps {
  /** Show a "Continue with Google" button (Google must be enabled on the client). */
  google?: boolean;
  /** Where to send the user after a successful sign-up. Defaults to `/`. */
  callbackURL?: string;
  /** Called after a successful sign-up instead of navigating (e.g. router.push). */
  onSuccess?: () => void;
  /** Href of the sign-in page, shown as a footer link when provided. */
  signInUrl?: string;
  /** Minimum password length enforced client-side. Defaults to 8. */
  minPasswordLength?: number;
  title?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
}

/**
 * Email/password sign-up card for end-users of a Kozmos project. Works
 * zero-config with `NEXT_PUBLIC_KOZMOS_*` env vars, or pass a `client`.
 */
export function SignUpForm({
  client,
  google = false,
  callbackURL = "/",
  onSuccess,
  signInUrl,
  minPasswordLength = 8,
  title = "Create your account",
  description = "Enter your details to get started.",
  className,
}: SignUpFormProps) {
  const actions = resolveActions(client);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState<null | "email" | "google">(null);

  function done() {
    if (onSuccess) onSuccess();
    else window.location.href = callbackURL;
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setPending("email");
    const { error } = await actions.signUp.email({ name, email, password });
    if (error) {
      setError(errorMessage(error));
      setPending(null);
      return;
    }
    done();
  }

  async function onGoogle() {
    setError(null);
    setPending("google");
    try {
      await actions.signInWithGoogle({ callbackURL });
    } catch (err) {
      setError(errorMessage(err));
      setPending(null);
    }
  }

  return (
    <Card className={cn("w-full max-w-sm", className)}>
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="kozmos-name">Name</Label>
            <Input
              id="kozmos-name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ada Lovelace"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="kozmos-email">Email</Label>
            <Input
              id="kozmos-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="kozmos-password">Password</Label>
            <Input
              id="kozmos-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={minPasswordLength}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" disabled={pending !== null}>
            {pending === "email" ? "Creating account…" : "Create account"}
          </Button>
        </form>

        {google && (
          <>
            <Divider />
            <Button
              type="button"
              variant="outline"
              onClick={onGoogle}
              disabled={pending !== null}
            >
              {pending === "google" ? "Redirecting…" : "Continue with Google"}
            </Button>
          </>
        )}

        {signInUrl && (
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <a
              href={signInUrl}
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Sign in
            </a>
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      <span className="h-px flex-1 bg-border" />
      or
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
