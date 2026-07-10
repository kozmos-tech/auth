"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CodeBlock({
  code,
  lang,
}: {
  code: string;
  /** Small label shown top-right (e.g. "tsx", "sh"). */
  lang?: string;
}) {
  const [copied, setCopied] = useState(false);

  function copy() {
    void navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-muted/40">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-2">
        <span className="font-mono text-xs text-muted-foreground">
          {lang ?? "code"}
        </span>
        <button
          onClick={copy}
          aria-label="Copy code"
          className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          {copied ? (
            <Check className="size-3.5 text-emerald-500" />
          ) : (
            <Copy className="size-3.5" />
          )}
        </button>
      </div>
      <pre className="overflow-x-auto px-4 py-3.5 text-sm leading-relaxed">
        <code className="font-mono text-foreground">{code}</code>
      </pre>
    </div>
  );
}
