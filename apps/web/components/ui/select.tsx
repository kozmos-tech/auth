import type * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export function Select({
  className,
  children,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <div className="relative inline-flex w-full">
      <select
        className={cn(
          "h-9 w-full appearance-none rounded-md border border-border bg-background pl-3 pr-8 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}
