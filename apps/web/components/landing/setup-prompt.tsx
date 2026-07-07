"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

const PROMPT = "Hey Claude, help me set up kozmos-auth.dev/llms.txt";

export function SetupPrompt() {
  const [copied, setCopied] = useState(false);

  function copy() {
    void navigator.clipboard.writeText(PROMPT).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <button
      onClick={copy}
      className="group flex w-full items-center gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3.5 text-left transition-colors hover:bg-muted/70"
    >
      <span className="flex-1 font-mono text-sm text-foreground sm:text-[0.95rem]">
        {PROMPT}
      </span>
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors group-hover:text-foreground">
        {copied ? (
          <Check className="size-4 text-emerald-500" />
        ) : (
          <Copy className="size-4" />
        )}
      </span>
    </button>
  );
}
