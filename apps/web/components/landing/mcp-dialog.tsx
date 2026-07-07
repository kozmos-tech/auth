"use client";

import { useEffect, useState } from "react";
import { Check, Copy, X } from "lucide-react";

const ENDPOINT = "https://kozmos-auth.dev/mcp";
const CONFIG = `{
  "mcpServers": {
    "kozmos": {
      "url": "https://kozmos-auth.dev/mcp"
    }
  }
}`;

export function McpDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="transition-colors hover:text-foreground"
      >
        MCP server
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-left shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold">Connect the MCP server</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add Kozmos to any MCP client to manage auth from your assistant.
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="-mr-1.5 -mt-1.5 flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <CopyField label="Endpoint" value={ENDPOINT} />
              <CopyField label="Config" value={CONFIG} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    void navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="group relative rounded-xl border border-border bg-muted/50">
        <pre className="overflow-x-auto px-3.5 py-3 font-mono text-xs text-foreground">
          {value}
        </pre>
        <button
          onClick={copy}
          className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-md bg-card/80 text-muted-foreground opacity-0 shadow-xs transition-all hover:text-foreground group-hover:opacity-100"
          aria-label={`Copy ${label.toLowerCase()}`}
        >
          {copied ? (
            <Check className="size-3.5 text-emerald-500" />
          ) : (
            <Copy className="size-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}
