import { randomUUID } from "node:crypto";

import { eq } from "drizzle-orm";

import { db, schema } from "./index";

// Seeds demo projects + end-users owned by a platform account. Idempotent:
// re-running wipes this owner's projects (cascading to their users, sessions,
// accounts and API keys) and rebuilds them from scratch.
//
//   OWNER_EMAIL=you@example.com npm run db:seed

const OWNER_EMAIL = process.env.OWNER_EMAIL ?? "03medu@gmail.com";

const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (n: number) => new Date(Date.now() - n * DAY);

type Provider = "credential" | "google" | "github";

interface SeedUser {
  name: string;
  email: string;
  status: "active" | "invited" | "suspended";
  role: "owner" | "admin" | "member";
  provider: Provider;
  createdDaysAgo: number;
  // Days since last session, or null for a user who has never signed in.
  lastActiveDaysAgo: number | null;
}

interface SeedKey {
  name: string;
  type: "publishable" | "secret";
  token: string;
  createdDaysAgo: number;
  lastUsedDaysAgo: number | null;
}

interface SeedProject {
  slug: string;
  name: string;
  description: string;
  environment: "production" | "development";
  createdDaysAgo: number;
  users: SeedUser[];
  apiKeys: SeedKey[];
}

const PROJECTS: SeedProject[] = [
  {
    slug: "aurora",
    name: "Aurora",
    description: "Consumer app authentication and session management.",
    environment: "production",
    createdDaysAgo: 185,
    users: [
      { name: "Mara Whitfield", email: "mara@aurora.app", status: "active", role: "owner", provider: "google", createdDaysAgo: 60, lastActiveDaysAgo: 0.08 },
      { name: "Devon Ige", email: "devon@aurora.app", status: "active", role: "admin", provider: "credential", createdDaysAgo: 45, lastActiveDaysAgo: 1 },
      { name: "Priya Nair", email: "priya@aurora.app", status: "active", role: "member", provider: "github", createdDaysAgo: 30, lastActiveDaysAgo: 3 },
      { name: "Tom Halloran", email: "tom@aurora.app", status: "invited", role: "member", provider: "credential", createdDaysAgo: 5, lastActiveDaysAgo: null },
      { name: "Lena Ortiz", email: "lena@aurora.app", status: "suspended", role: "member", provider: "google", createdDaysAgo: 20, lastActiveDaysAgo: 21 },
    ],
    apiKeys: [
      { name: "Production", type: "publishable", token: "pk_live_a1b2c3d4e5f6g7h8", createdDaysAgo: 185, lastUsedDaysAgo: 0.08 },
      { name: "Production", type: "secret", token: "sk_live_9f8e7d6c5b4a3210", createdDaysAgo: 185, lastUsedDaysAgo: 0.08 },
      { name: "Server jobs", type: "secret", token: "sk_live_1122334455667788", createdDaysAgo: 146, lastUsedDaysAgo: 1 },
    ],
  },
  {
    slug: "beacon",
    name: "Beacon",
    description: "Internal tools and staff SSO.",
    environment: "production",
    createdDaysAgo: 240,
    users: [
      { name: "Sam Okafor", email: "sam@beacon.io", status: "active", role: "owner", provider: "github", createdDaysAgo: 80, lastActiveDaysAgo: 0.04 },
      { name: "Iris Chen", email: "iris@beacon.io", status: "active", role: "admin", provider: "google", createdDaysAgo: 70, lastActiveDaysAgo: 0.2 },
      { name: "Noah Berg", email: "noah@beacon.io", status: "active", role: "member", provider: "credential", createdDaysAgo: 40, lastActiveDaysAgo: 0.2 },
    ],
    apiKeys: [
      { name: "Production", type: "publishable", token: "pk_live_beacon0011223344", createdDaysAgo: 240, lastUsedDaysAgo: 0.04 },
      { name: "Production", type: "secret", token: "sk_live_beacon5566778899a", createdDaysAgo: 240, lastUsedDaysAgo: 0.04 },
    ],
  },
  {
    slug: "meridian",
    name: "Meridian",
    description: "MCP agent authorization sandbox.",
    environment: "development",
    createdDaysAgo: 66,
    users: [
      { name: "Kai Rivera", email: "kai@meridian.dev", status: "active", role: "owner", provider: "credential", createdDaysAgo: 50, lastActiveDaysAgo: 0.1 },
      { name: "Farah Aziz", email: "farah@meridian.dev", status: "invited", role: "member", provider: "credential", createdDaysAgo: 3, lastActiveDaysAgo: null },
    ],
    apiKeys: [
      { name: "Sandbox", type: "publishable", token: "pk_test_meridian99887766", createdDaysAgo: 66, lastUsedDaysAgo: 0.1 },
      { name: "Sandbox", type: "secret", token: "sk_test_meridian55443322", createdDaysAgo: 66, lastUsedDaysAgo: 0.1 },
    ],
  },
];

async function main() {
  const [owner] = await db
    .select()
    .from(schema.platformUser)
    .where(eq(schema.platformUser.email, OWNER_EMAIL));

  if (!owner) {
    throw new Error(
      `No platform account found for ${OWNER_EMAIL}. Sign up in the dashboard first, then re-run the seed.`,
    );
  }

  console.log(`Seeding projects for ${owner.email} (${owner.id})`);

  // Wipe this owner's existing projects; FK cascades clear the dependent rows.
  await db.delete(schema.project).where(eq(schema.project.ownerId, owner.id));

  for (const p of PROJECTS) {
    await db.insert(schema.project).values({
      id: p.slug,
      name: p.name,
      slug: p.slug,
      description: p.description,
      environment: p.environment,
      ownerId: owner.id,
      createdAt: daysAgo(p.createdDaysAgo),
      updatedAt: daysAgo(p.createdDaysAgo),
    });

    for (const u of p.users) {
      const userId = randomUUID();
      await db.insert(schema.user).values({
        id: userId,
        projectId: p.slug,
        name: u.name,
        email: u.email,
        emailVerified: u.status !== "invited",
        status: u.status,
        role: u.role,
        createdAt: daysAgo(u.createdDaysAgo),
        updatedAt: daysAgo(u.createdDaysAgo),
      });

      await db.insert(schema.account).values({
        id: randomUUID(),
        accountId: u.provider === "credential" ? u.email : randomUUID(),
        providerId: u.provider,
        projectId: p.slug,
        userId,
        createdAt: daysAgo(u.createdDaysAgo),
        updatedAt: daysAgo(u.createdDaysAgo),
      });

      if (u.lastActiveDaysAgo !== null) {
        await db.insert(schema.session).values({
          id: randomUUID(),
          token: randomUUID(),
          expiresAt: daysAgo(u.lastActiveDaysAgo - 30),
          projectId: p.slug,
          userId,
          createdAt: daysAgo(u.lastActiveDaysAgo),
          updatedAt: daysAgo(u.lastActiveDaysAgo),
        });
      }
    }

    for (const k of p.apiKeys) {
      await db.insert(schema.apiKey).values({
        id: randomUUID(),
        projectId: p.slug,
        name: k.name,
        type: k.type,
        token: k.token,
        lastUsedAt: k.lastUsedDaysAgo === null ? null : daysAgo(k.lastUsedDaysAgo),
        createdAt: daysAgo(k.createdDaysAgo),
        updatedAt: daysAgo(k.createdDaysAgo),
      });
    }

    console.log(`  ✓ ${p.name}: ${p.users.length} users, ${p.apiKeys.length} keys`);
  }

  console.log("Done.");
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
