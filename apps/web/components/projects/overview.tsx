import { ArrowUpRight, Users } from "lucide-react";

import { AreaChart } from "@/components/dashboard/chart";
import { Select } from "@/components/ui/select";
import type { Project } from "@/lib/mock-data";

export function Overview({ project }: { project: Project }) {
  const total = project.users.length;
  const active = project.users.filter((u) => u.status === "active").length;
  const invited = project.users.filter((u) => u.status === "invited").length;
  const suspended = project.users.filter((u) => u.status === "suspended").length;

  const stats = [
    { label: "Total users", value: total },
    { label: "Active", value: active },
    { label: "Invited", value: invited },
    { label: "Suspended", value: suspended },
  ];

  const growth = project.growth;
  const delta = (growth.at(-1) ?? 0) - (growth[0] ?? 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Users className="size-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">User growth</h3>
            </div>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <ArrowUpRight className="size-3.5 text-emerald-500" />
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                +{delta}
              </span>
              new users this period
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select defaultValue="90d" className="w-36">
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </Select>
            <Select defaultValue="all" className="w-36">
              <option value="all">All providers</option>
              <option value="email">Email</option>
              <option value="google">Google</option>
              <option value="github">GitHub</option>
            </Select>
          </div>
        </div>

        <AreaChart
          data={growth}
          labels={["8w", "7w", "6w", "5w", "4w", "3w", "2w", "now"]}
          className="mt-4"
        />
      </div>
    </div>
  );
}
