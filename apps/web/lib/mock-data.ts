// Static placeholder data for the admin dashboard UI.
// No persistence, no logic — purely to render the interface.

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

const person = (
  id: string,
  name: string,
  email: string,
  status: UserStatus,
  role: DashboardUser["role"],
  provider: DashboardUser["provider"],
  createdAt: string,
  lastActive: string,
): DashboardUser => ({
  id,
  name,
  email,
  status,
  role,
  provider,
  createdAt,
  lastActive,
});

const key = (
  id: string,
  name: string,
  type: ApiKey["type"],
  token: string,
  created: string,
  lastUsed: string,
): ApiKey => ({ id, name, type, token, created, lastUsed });

export const projects: Project[] = [
  {
    id: "aurora",
    name: "Aurora",
    description: "Consumer app authentication and session management.",
    environment: "Production",
    users: [
      person("u_1", "Mara Whitfield", "mara@aurora.app", "active", "Owner", "Google", "Jan 4, 2026", "2 hours ago"),
      person("u_2", "Devon Ige", "devon@aurora.app", "active", "Admin", "Email", "Jan 18, 2026", "Yesterday"),
      person("u_3", "Priya Nair", "priya@aurora.app", "active", "Member", "GitHub", "Feb 2, 2026", "3 days ago"),
      person("u_4", "Tom Halloran", "tom@aurora.app", "invited", "Member", "Email", "Jun 28, 2026", "Never"),
      person("u_5", "Lena Ortiz", "lena@aurora.app", "suspended", "Member", "Google", "Mar 11, 2026", "3 weeks ago"),
    ],
    growth: [1, 1, 2, 2, 3, 4, 4, 5],
    apiKeys: [
      key("k_1", "Production", "Publishable", "pk_live_a1b2c3d4e5f6g7h8", "Jan 4, 2026", "2 hours ago"),
      key("k_2", "Production", "Secret", "sk_live_9f8e7d6c5b4a3210", "Jan 4, 2026", "2 hours ago"),
      key("k_3", "Server jobs", "Secret", "sk_live_1122334455667788", "Feb 12, 2026", "Yesterday"),
    ],
  },
  {
    id: "beacon",
    name: "Beacon",
    description: "Internal tools and staff SSO.",
    environment: "Production",
    users: [
      person("u_6", "Sam Okafor", "sam@beacon.io", "active", "Owner", "GitHub", "Nov 9, 2025", "1 hour ago"),
      person("u_7", "Iris Chen", "iris@beacon.io", "active", "Admin", "Google", "Dec 1, 2025", "Today"),
      person("u_8", "Noah Berg", "noah@beacon.io", "active", "Member", "Email", "Jan 22, 2026", "5 hours ago"),
    ],
    growth: [1, 1, 1, 2, 2, 2, 3, 3],
    apiKeys: [
      key("k_4", "Production", "Publishable", "pk_live_beacon0011223344", "Nov 9, 2025", "1 hour ago"),
      key("k_5", "Production", "Secret", "sk_live_beacon5566778899a", "Nov 9, 2025", "1 hour ago"),
    ],
  },
  {
    id: "meridian",
    name: "Meridian",
    description: "MCP agent authorization sandbox.",
    environment: "Development",
    users: [
      person("u_9", "Kai Rivera", "kai@meridian.dev", "active", "Owner", "Email", "May 3, 2026", "Today"),
      person("u_10", "Farah Aziz", "farah@meridian.dev", "invited", "Member", "Email", "Jul 1, 2026", "Never"),
    ],
    growth: [0, 1, 1, 1, 1, 2, 2, 2],
    apiKeys: [
      key("k_6", "Sandbox", "Publishable", "pk_test_meridian99887766", "May 3, 2026", "Today"),
      key("k_7", "Sandbox", "Secret", "sk_test_meridian55443322", "May 3, 2026", "Today"),
    ],
  },
];

export function getProject(projectId: string): Project | undefined {
  return projects.find((project) => project.id === projectId);
}

export function getUser(
  projectId: string,
  userId: string,
): { project: Project; user: DashboardUser } | undefined {
  const project = getProject(projectId);
  const user = project?.users.find((candidate) => candidate.id === userId);
  if (!project || !user) return undefined;
  return { project, user };
}
