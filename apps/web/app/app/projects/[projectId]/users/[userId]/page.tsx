import { notFound } from "next/navigation";

import { TopNav } from "@/components/dashboard/top-nav";
import { UserDetail } from "@/components/users/user-detail";
import { getUser } from "@/lib/data";
import { requireOwner } from "@/lib/session";

export default async function UserPage({
  params,
}: {
  params: Promise<{ projectId: string; userId: string }>;
}) {
  const { projectId, userId } = await params;
  const owner = await requireOwner();
  const result = await getUser(owner.id, projectId, userId);

  if (!result) notFound();

  const { project, user } = result;

  return (
    <>
      <TopNav
        crumbs={[
          { label: "Projects", href: "/app" },
          { label: project.name, href: `/app/projects/${project.id}` },
          { label: user.name },
        ]}
      />
      <main className="mx-auto max-w-6xl px-6 pt-5 pb-8">
        <UserDetail project={project} user={user} />
      </main>
    </>
  );
}
