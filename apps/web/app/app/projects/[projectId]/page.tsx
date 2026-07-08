import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { TopNav } from "@/components/dashboard/top-nav";
import { ProjectWorkspace } from "@/components/projects/project-workspace";
import { getProject } from "@/lib/data";
import { requireOwner } from "@/lib/session";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const owner = await requireOwner();
  const project = await getProject(owner.id, projectId);

  if (!project) notFound();

  return (
    <>
      <TopNav
        crumbs={[
          { label: "Projects", href: "/app" },
          { label: project.name },
        ]}
      />
      <main className="mx-auto max-w-6xl px-6 pt-5 pb-8">
        <div className="mb-8">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-semibold tracking-tight">
              {project.name}
            </h1>
            <Badge>{project.environment}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {project.description}
          </p>
        </div>

        <ProjectWorkspace project={project} />
      </main>
    </>
  );
}
