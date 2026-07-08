import Link from "next/link";
import { ArrowUpRight, FolderKanban, Plus, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkline } from "@/components/dashboard/chart";
import { EmptyState } from "@/components/dashboard/empty-state";
import { TopNav } from "@/components/dashboard/top-nav";
import { getProjects } from "@/lib/data";
import { requireOwner } from "@/lib/session";

export default async function ProjectsPage() {
  const owner = await requireOwner();
  const projects = await getProjects(owner.id);

  return (
    <>
      <TopNav crumbs={[{ label: "Projects" }]} />
      <main className="mx-auto max-w-6xl px-6 pt-6 pb-10">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage authentication for each of your applications.
            </p>
          </div>
          <Button size="sm">
            <Plus className="size-4" />
            New project
          </Button>
        </div>

        {projects.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              icon={<FolderKanban className="size-5" />}
              title="No projects yet"
              description="Create your first project to start authenticating users."
            />
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => {
            const delta = (project.growth.at(-1) ?? 0) - (project.growth[0] ?? 0);
            return (
              <Link
                key={project.id}
                href={`/app/projects/${project.id}`}
                prefetch
                className="group flex flex-col rounded-xl border border-border p-5 transition-colors hover:bg-muted/40"
              >
                <div className="flex items-center justify-between">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-sm font-semibold text-foreground">
                    {project.name[0]}
                  </span>
                  <ArrowUpRight className="size-4 text-muted-foreground/0 transition-colors group-hover:text-muted-foreground" />
                </div>
                <h2 className="mt-4 font-medium">{project.name}</h2>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {project.description}
                </p>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="size-3.5" />
                      {project.users.length} users
                    </span>
                    <span className="flex items-center gap-0.5 font-medium text-emerald-600 dark:text-emerald-400">
                      <ArrowUpRight className="size-3" />+{delta}
                    </span>
                  </div>
                  <Sparkline data={project.growth} className="mt-2" />
                </div>

                <div className="mt-3 flex items-center gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
                  <Badge>{project.environment}</Badge>
                </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
