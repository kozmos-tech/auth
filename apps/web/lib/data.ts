import { db, schema } from "@kozmos-auth/db";
import { and, eq, inArray } from "drizzle-orm";

// ---------------------------------------------------------------------------
// UI types
// The dashboard renders these shapes. They are a presentation view over the
// database rows — the query layer below maps real DB records onto them.
// ---------------------------------------------------------------------------

export type UserStatus = "active" | "invited" | "suspended";

export interface DashboardUser {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  role: "Owner" | "Admin" | "Member";
  provider: "Email" | "Google" | "GitHub";
  createdAt: string;
  lastActive: string;
}

export interface ApiKey {
  id: string;
  name: string;
  type: "Publishable" | "Secret";
  token: string;
  created: string;
  lastUsed: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  environment: "Production" | "Development";
  users: DashboardUser[];
  // Cumulative user count over the last 8 weeks — drives the growth charts.
  growth: number[];
  apiKeys: ApiKey[];
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function formatDate(date: Date): string {
  return dateFmt.format(date);
}

function timeAgo(date: Date | null): string {
  if (!date) return "Never";
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months === 1 ? "" : "s"} ago`;
}

function toStatus(value: string): UserStatus {
  return value === "invited" || value === "suspended" ? value : "active";
}

function toRole(value: string): DashboardUser["role"] {
  if (value === "owner") return "Owner";
  if (value === "admin") return "Admin";
  return "Member";
}

function toProvider(providerId: string | undefined): DashboardUser["provider"] {
  if (providerId === "google") return "Google";
  if (providerId === "github") return "GitHub";
  return "Email";
}

function toEnvironment(value: string): Project["environment"] {
  return value === "development" ? "Development" : "Production";
}

function toKeyType(value: string): ApiKey["type"] {
  return value === "publishable" ? "Publishable" : "Secret";
}

// Build 8 weekly cumulative user counts ending at "now".
function buildGrowth(createdAts: Date[]): number[] {
  const now = Date.now();
  const week = 7 * 24 * 60 * 60 * 1000;
  return Array.from({ length: 8 }, (_, i) => {
    const cutoff = now - (7 - i) * week + week; // end of bucket i
    return createdAts.filter((d) => d.getTime() <= cutoff).length;
  });
}

// ---------------------------------------------------------------------------
// Queries — every function is scoped to the signed-in platform owner, so a
// client can only ever read their own projects and end-users.
// ---------------------------------------------------------------------------

type ProjectRow = typeof schema.project.$inferSelect;

async function buildProject(row: ProjectRow): Promise<Project> {
  const [users, keys] = await Promise.all([
    db.select().from(schema.user).where(eq(schema.user.projectId, row.id)),
    db.select().from(schema.apiKey).where(eq(schema.apiKey.projectId, row.id)),
  ]);

  const userIds = users.map((u) => u.id);
  const [accounts, sessions] =
    userIds.length === 0
      ? [[], []]
      : await Promise.all([
          db
            .select()
            .from(schema.account)
            .where(inArray(schema.account.userId, userIds)),
          db
            .select()
            .from(schema.session)
            .where(inArray(schema.session.userId, userIds)),
        ]);

  const providerByUser = new Map<string, string>();
  for (const acc of accounts) {
    if (!providerByUser.has(acc.userId)) {
      providerByUser.set(acc.userId, acc.providerId);
    }
  }

  const lastActiveByUser = new Map<string, Date>();
  for (const s of sessions) {
    const seen = lastActiveByUser.get(s.userId);
    if (!seen || s.createdAt > seen) lastActiveByUser.set(s.userId, s.createdAt);
  }

  const dashboardUsers: DashboardUser[] = users
    .map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      status: toStatus(u.status),
      role: toRole(u.role),
      provider: toProvider(providerByUser.get(u.id)),
      createdAt: formatDate(u.createdAt),
      lastActive: timeAgo(lastActiveByUser.get(u.id) ?? null),
      _createdAt: u.createdAt,
    }))
    .sort((a, b) => a._createdAt.getTime() - b._createdAt.getTime())
    .map(({ _createdAt, ...rest }) => rest);

  const apiKeys: ApiKey[] = keys
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .map((k) => ({
      id: k.id,
      name: k.name,
      type: toKeyType(k.type),
      token: k.token,
      created: formatDate(k.createdAt),
      lastUsed: timeAgo(k.lastUsedAt),
    }));

  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    environment: toEnvironment(row.environment),
    users: dashboardUsers,
    growth: buildGrowth(users.map((u) => u.createdAt)),
    apiKeys,
  };
}

export async function getProjects(ownerId: string): Promise<Project[]> {
  const rows = await db
    .select()
    .from(schema.project)
    .where(eq(schema.project.ownerId, ownerId));
  const built = await Promise.all(rows.map(buildProject));
  return built.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getProject(
  ownerId: string,
  projectId: string,
): Promise<Project | undefined> {
  const [row] = await db
    .select()
    .from(schema.project)
    .where(
      and(eq(schema.project.id, projectId), eq(schema.project.ownerId, ownerId)),
    );
  if (!row) return undefined;
  return buildProject(row);
}

export async function getUser(
  ownerId: string,
  projectId: string,
  userId: string,
): Promise<{ project: Project; user: DashboardUser } | undefined> {
  const project = await getProject(ownerId, projectId);
  const user = project?.users.find((candidate) => candidate.id === userId);
  if (!project || !user) return undefined;
  return { project, user };
}
