"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

export function Switch({
  defaultChecked = false,
  "aria-label": ariaLabel,
}: {
  defaultChecked?: boolean;
  "aria-label"?: string;
}) {
  const [on, setOn] = useState(defaultChecked);
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={ariaLabel}
      onClick={() => setOn((v) => !v)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        on ? "bg-primary" : "bg-muted",
      )}
    >
      <span
        className={cn(
          "inline-block size-4 transform rounded-full bg-background shadow transition-transform",
          on ? "translate-x-4" : "translate-x-0.5",
        )}
      />
    </button>
  );
}
