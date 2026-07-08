import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

// Resolves the signed-in platform account, redirecting to sign-in if there is
// none. Returns the owner id used to scope every dashboard query.
export async function requireOwner() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");
  return session.user;
}
