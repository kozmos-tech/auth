"use client";

import { KeyRound, LayoutGrid, Settings, Users } from "lucide-react";

import { Tabs, type TabItem } from "@/components/dashboard/tabs";
import { Overview } from "@/components/projects/overview";
import { ApiKeys } from "@/components/projects/api-keys";
import { ProjectSettings } from "@/components/projects/project-settings";
import { UsersTable } from "@/components/projects/users-table";
import type { Project } from "@/lib/mock-data";

export function ProjectWorkspace({ project }: { project: Project }) {
  const tabs: TabItem[] = [
    {
      key: "overview",
      label: "Overview",
      icon: <LayoutGrid className="size-4" />,
      content: <Overview project={project} />,
    },
    {
      key: "users",
      label: "Users",
      icon: <Users className="size-4" />,
      content: <UsersTable project={project} />,
    },
    {
      key: "api-keys",
      label: "API keys",
      icon: <KeyRound className="size-4" />,
      content: <ApiKeys project={project} />,
    },
    {
      key: "settings",
      label: "Settings",
      icon: <Settings className="size-4" />,
      content: <ProjectSettings project={project} />,
    },
  ];

  return <Tabs tabs={tabs} defaultTab="users" />;
}
