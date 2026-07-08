"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createProject } from "@/lib/actions";

export function NewProjectDialog() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createProject({
        name: String(formData.get("name") ?? ""),
        environment: String(formData.get("environment") ?? "production"),
        description: String(formData.get("description") ?? ""),
      });
      // A successful create redirects, so we only reach here on validation error.
      if (result && "error" in result) setError(result.error);
    });
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        New project
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New project"
        description="Create an isolated authentication tenant for one of your apps."
      >
        <form action={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Project name</label>
            <Input name="name" placeholder="Aurora" autoFocus required />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Environment</label>
            <Select name="environment" defaultValue="production">
              <option value="production">Production</option>
              <option value="development">Development</option>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              name="description"
              placeholder="What does this project authenticate?"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? "Creating…" : "Create project"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
