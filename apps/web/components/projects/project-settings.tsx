import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Project } from "@/lib/mock-data";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-3 sm:gap-4">
      <div className="sm:pt-1.5">
        <label className="text-sm font-medium">{label}</label>
        {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      </div>
      <div className="sm:col-span-2">{children}</div>
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border p-5">
      <div className="mb-5">
        <h3 className="text-sm font-medium">{title}</h3>
        {description && (
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

export function ProjectSettings({ project }: { project: Project }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end gap-2">
        <Button variant="ghost" size="sm">
          Cancel
        </Button>
        <Button size="sm">Save changes</Button>
      </div>

      <Section
        title="General"
        description="Basic information about this project."
      >
        <Field label="Project name">
          <Input defaultValue={project.name} />
        </Field>
        <Field label="Environment">
          <Select defaultValue={project.environment}>
            <option value="Production">Production</option>
            <option value="Development">Development</option>
          </Select>
        </Field>
        <Field label="Description">
          <Textarea defaultValue={project.description} />
        </Field>
      </Section>

      <Section
        title="Danger zone"
        description="Irreversible and destructive actions."
      >
        <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <div>
            <p className="text-sm font-medium">Delete project</p>
            <p className="text-xs text-muted-foreground">
              Permanently remove {project.name} and all of its users.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            Delete
          </Button>
        </div>
      </Section>
    </div>
  );
}
