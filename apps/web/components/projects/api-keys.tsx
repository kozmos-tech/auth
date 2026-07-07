import { Copy, Plus, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ApiKey, Project } from "@/lib/mock-data";

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
        <Button size="sm">
          <Plus className="size-4" />
          Create key
        </Button>
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
              <tr
                key={apiKey.id}
                className="border-b border-border last:border-0"
              >
                <td className="px-4 py-3 font-medium">{apiKey.name}</td>
                <td className="px-4 py-3">
                  <Badge>{apiKey.type}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                      {apiKey.type === "Secret"
                        ? mask(apiKey.token)
                        : apiKey.token}
                    </code>
                    <button className="text-muted-foreground transition-colors hover:text-foreground">
                      <Copy className="size-3.5" />
                    </button>
                  </div>
                </td>
                <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                  {apiKey.lastUsed}
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="text-muted-foreground transition-colors hover:text-destructive">
                    <Trash2 className="size-4" />
                  </button>
                </td>
              </tr>
            ))}
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
