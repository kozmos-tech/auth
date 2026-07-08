"use server";

import { randomUUID } from "node:crypto";

import { db, schema } from "@kozmos-auth/db";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireOwner } from "@/lib/session";

// ---------------------------------------------------------------------------
// Every action re-checks the signed-in platform owner and verifies the target
// row belongs to them before mutating, so a client can only ever change their
// own projects, users, and keys. Validation problems come back as
// { error } for the calling form to render; ownership failures throw.
// ---------------------------------------------------------------------------

type ActionResult = { ok: true } | { error: string };

async function assertProjectOwner(ownerId: string, projectId: string) {
  const [row] = await db
    .select()
    .from(schema.project)
    .where(
      and(eq(schema.project.id, projectId), eq(schema.project.ownerId, ownerId)),
    );
  if (!row) throw new Error("Project not found");
  return row;
}

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "project"
  );
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = base;
  let n = 2;
  // slug is globally unique in the schema — probe until we find a free one.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const [existing] = await db
      .select({ id: schema.project.id })
      .from(schema.project)
      .where(eq(schema.project.slug, slug));
    if (!existing) return slug;
    slug = `${base}-${n++}`;
  }
}

function normalizeEnvironment(value: string): "production" | "development" {
  return value.toLowerCase() === "development" ? "development" : "production";
}

function normalizeStatus(value: string): "active" | "invited" | "suspended" {
  return value === "invited" || value === "suspended" ? value : "active";
}

// Used by the invite feature, which is disabled for now.
// function normalizeRole(value: string): "owner" | "admin" | "member" {
//   return value === "owner" || value === "admin" ? value : "member";
// }

function generateToken(type: "publishable" | "secret"): string {
  const rand = randomUUID().replace(/-/g, "");
  return `${type === "publishable" ? "pk" : "sk"}_live_${rand}`;
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export async function createProject(input: {
  name: string;
  environment: string;
  description: string;
}): Promise<ActionResult> {
  const owner = await requireOwner();
  const name = input.name.trim();
  if (!name) return { error: "Project name is required." };

  const slug = await uniqueSlug(slugify(name));

  await db.insert(schema.project).values({
    id: slug,
    name,
    slug,
    description: input.description.trim() || null,
    environment: normalizeEnvironment(input.environment),
    ownerId: owner.id,
  });

  revalidatePath("/app");
  redirect(`/app/projects/${slug}`);
}

export async function updateProject(
  projectId: string,
  input: { name: string; environment: string; description: string },
): Promise<ActionResult> {
  const owner = await requireOwner();
  await assertProjectOwner(owner.id, projectId);

  const name = input.name.trim();
  if (!name) return { error: "Project name is required." };

  await db
    .update(schema.project)
    .set({
      name,
      description: input.description.trim() || null,
      environment: normalizeEnvironment(input.environment),
      updatedAt: new Date(),
    })
    .where(eq(schema.project.id, projectId));

  revalidatePath("/app");
  revalidatePath(`/app/projects/${projectId}`);
  return { ok: true };
}

export async function deleteProject(projectId: string): Promise<void> {
  const owner = await requireOwner();
  await assertProjectOwner(owner.id, projectId);

  // Users, sessions, accounts, and API keys cascade via their FK constraints.
  await db.delete(schema.project).where(eq(schema.project.id, projectId));

  revalidatePath("/app");
  redirect("/app");
}

// ---------------------------------------------------------------------------
// End-users
// ---------------------------------------------------------------------------

// Invite feature is disabled until it can be fully implemented.
// export async function inviteUser(
//   projectId: string,
//   input: { name: string; email: string; role: string },
// ): Promise<ActionResult> {
//   const owner = await requireOwner();
//   await assertProjectOwner(owner.id, projectId);
//
//   const name = input.name.trim();
//   const email = input.email.trim().toLowerCase();
//   if (!name) return { error: "Name is required." };
//   if (!email) return { error: "Email is required." };
//
//   const [existing] = await db
//     .select({ id: schema.user.id })
//     .from(schema.user)
//     .where(
//       and(eq(schema.user.projectId, projectId), eq(schema.user.email, email)),
//     );
//   if (existing) return { error: "A user with that email already exists." };
//
//   const userId = randomUUID();
//   await db.insert(schema.user).values({
//     id: userId,
//     projectId,
//     name,
//     email,
//     status: "invited",
//     role: normalizeRole(input.role),
//   });
//   // Record the sign-in method so the dashboard shows "Email" rather than a blank.
//   await db.insert(schema.account).values({
//     id: randomUUID(),
//     accountId: email,
//     providerId: "credential",
//     projectId,
//     userId,
//   });
//
//   revalidatePath(`/app/projects/${projectId}`);
//   return { ok: true };
// }

export async function updateUser(
  projectId: string,
  userId: string,
  input: { name: string; email: string; status: string },
): Promise<ActionResult> {
  const owner = await requireOwner();
  await assertProjectOwner(owner.id, projectId);

  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  if (!name) return { error: "Name is required." };
  if (!email) return { error: "Email is required." };

  const [clash] = await db
    .select({ id: schema.user.id })
    .from(schema.user)
    .where(
      and(eq(schema.user.projectId, projectId), eq(schema.user.email, email)),
    );
  if (clash && clash.id !== userId) {
    return { error: "Another user already uses that email." };
  }

  await db
    .update(schema.user)
    .set({
      name,
      email,
      status: normalizeStatus(input.status),
      updatedAt: new Date(),
    })
    .where(and(eq(schema.user.id, userId), eq(schema.user.projectId, projectId)));

  revalidatePath(`/app/projects/${projectId}`);
  revalidatePath(`/app/projects/${projectId}/users/${userId}`);
  return { ok: true };
}

export async function setUserStatus(
  projectId: string,
  userId: string,
  status: string,
): Promise<ActionResult> {
  const owner = await requireOwner();
  await assertProjectOwner(owner.id, projectId);

  await db
    .update(schema.user)
    .set({ status: normalizeStatus(status), updatedAt: new Date() })
    .where(and(eq(schema.user.id, userId), eq(schema.user.projectId, projectId)));

  revalidatePath(`/app/projects/${projectId}`);
  revalidatePath(`/app/projects/${projectId}/users/${userId}`);
  return { ok: true };
}

export async function deleteUser(
  projectId: string,
  userId: string,
): Promise<void> {
  const owner = await requireOwner();
  await assertProjectOwner(owner.id, projectId);

  // Sessions and accounts cascade from the user row.
  await db
    .delete(schema.user)
    .where(and(eq(schema.user.id, userId), eq(schema.user.projectId, projectId)));

  revalidatePath(`/app/projects/${projectId}`);
  redirect(`/app/projects/${projectId}`);
}

// ---------------------------------------------------------------------------
// API keys
// ---------------------------------------------------------------------------

export async function createApiKey(
  projectId: string,
  input: { name: string; type: string },
): Promise<ActionResult> {
  const owner = await requireOwner();
  await assertProjectOwner(owner.id, projectId);

  const name = input.name.trim();
  if (!name) return { error: "Key name is required." };
  const type = input.type === "publishable" ? "publishable" : "secret";

  await db.insert(schema.apiKey).values({
    id: randomUUID(),
    projectId,
    name,
    type,
    token: generateToken(type),
  });

  revalidatePath(`/app/projects/${projectId}`);
  return { ok: true };
}

export async function deleteApiKey(
  projectId: string,
  keyId: string,
): Promise<ActionResult> {
  const owner = await requireOwner();
  await assertProjectOwner(owner.id, projectId);

  await db
    .delete(schema.apiKey)
    .where(
      and(eq(schema.apiKey.id, keyId), eq(schema.apiKey.projectId, projectId)),
    );

  revalidatePath(`/app/projects/${projectId}`);
  return { ok: true };
}
