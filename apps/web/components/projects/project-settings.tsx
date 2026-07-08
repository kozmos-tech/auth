"use client";

import { useState, useTransition, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { deleteProject, updateProject } from "@/lib/actions";
import type { Project } from "@/lib/data";

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

const initial = (project: Project) => ({
  name: project.name,
  environment: project.environment.toLowerCase(),
  description: project.description,
});

export function ProjectSettings({ project }: { project: Project }) {
  const [form, setForm] = useState(initial(project));
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const dirty =
    form.name !== project.name ||
    form.environment !== project.environment.toLowerCase() ||
    form.description !== project.description;

  function save() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateProject(project.id, form);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setSaved(true);
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end gap-2">
        {saved && !dirty && (
          <span className="mr-auto text-sm text-muted-foreground">
            Changes saved.
          </span>
        )}
        {error && <span className="mr-auto text-sm text-destructive">{error}</span>}
        <Button
          variant="ghost"
          size="sm"
          disabled={!dirty || pending}
          onClick={() => {
            setForm(initial(project));
            setError(null);
            setSaved(false);
          }}
        >
          Cancel
        </Button>
        <Button size="sm" disabled={!dirty || pending} onClick={save}>
          {pending ? "Saving…" : "Save changes"}
        </Button>
      </div>

      <Section
        title="General"
        description="Basic information about this project."
      >
        <Field label="Project name">
          <Input
            value={form.name}
            onChange={(e) => {
              setForm((f) => ({ ...f, name: e.target.value }));
              setSaved(false);
            }}
          />
        </Field>
        <Field label="Environment">
          <Select
            value={form.environment}
            onChange={(e) => {
              setForm((f) => ({ ...f, environment: e.target.value }));
              setSaved(false);
            }}
          >
            <option value="production">Production</option>
            <option value="development">Development</option>
          </Select>
        </Field>
        <Field label="Description">
          <Textarea
            value={form.description}
            onChange={(e) => {
              setForm((f) => ({ ...f, description: e.target.value }));
              setSaved(false);
            }}
          />
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
          <ConfirmDialog
            title="Delete project"
            description={`This permanently removes ${project.name}, its users, sessions, and API keys. This cannot be undone.`}
            confirmLabel="Delete project"
            onConfirm={() => deleteProject(project.id)}
            trigger={(open) => (
              <Button
                variant="outline"
                size="sm"
                onClick={open}
                className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                Delete
              </Button>
            )}
          />
        </div>
      </Section>
    </div>
  );
}
