"use client";

import { useState } from "react";
import { Check, Copy, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CreateKeyDialog } from "@/components/projects/create-key-dialog";
import { deleteApiKey } from "@/lib/actions";
import type { ApiKey, Project } from "@/lib/data";

function mask(token: string) {
  const [prefix] = token.split(/(?<=_)/);
  return `${prefix ?? ""}${"•".repeat(16)}${token.slice(-4)}`;
}

export function ApiKeys({ project }: { project: Project }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">API keys</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Authenticate requests from your backend and clients.
          </p>
        </div>
        <CreateKeyDialog projectId={project.id} />
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-2.5 font-medium">Name</th>
              <th className="px-4 py-2.5 font-medium">Type</th>
              <th className="px-4 py-2.5 font-medium">Key</th>
              <th className="hidden px-4 py-2.5 font-medium sm:table-cell">
                Last used
              </th>
              <th className="px-4 py-2.5 font-medium" />
            </tr>
          </thead>
          <tbody>
            {project.apiKeys.map((apiKey: ApiKey) => (
              <KeyRow key={apiKey.id} projectId={project.id} apiKey={apiKey} />
            ))}
            {project.apiKeys.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-sm text-muted-foreground"
                >
                  No API keys yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">
        Secret keys are shown once at creation. Store them securely — they grant
        full API access.
      </p>
    </div>
  );
}

function KeyRow({ projectId, apiKey }: { projectId: string; apiKey: ApiKey }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    void navigator.clipboard.writeText(apiKey.token).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-4 py-3 font-medium">{apiKey.name}</td>
      <td className="px-4 py-3">
        <Badge>{apiKey.type}</Badge>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
            {apiKey.type === "Secret" ? mask(apiKey.token) : apiKey.token}
          </code>
          <button
            onClick={copy}
            className="text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Copy key"
          >
            {copied ? (
              <Check className="size-3.5 text-emerald-500" />
            ) : (
              <Copy className="size-3.5" />
            )}
          </button>
        </div>
      </td>
      <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
        {apiKey.lastUsed}
      </td>
      <td className="px-4 py-3 text-right">
        <ConfirmDialog
          title="Delete API key"
          description={`Requests using "${apiKey.name}" will immediately stop working. This cannot be undone.`}
          confirmLabel="Delete key"
          onConfirm={() => deleteApiKey(projectId, apiKey.id)}
          trigger={(open) => (
            <button
              onClick={open}
              className="text-muted-foreground transition-colors hover:text-destructive"
              aria-label="Delete key"
            >
              <Trash2 className="size-4" />
            </button>
          )}
        />
      </td>
    </tr>
  );
}
