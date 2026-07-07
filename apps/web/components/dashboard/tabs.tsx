"use client";

import { useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface TabItem {
  key: string;
  label: string;
  icon?: ReactNode;
  content: ReactNode;
}

export function Tabs({
  tabs,
  defaultTab,
}: {
  tabs: TabItem[];
  defaultTab?: string;
}) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.key);
  const current = tabs.find((tab) => tab.key === active) ?? tabs[0];

  return (
    <div>
      <div className="flex items-center gap-1 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={cn(
              "-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition-colors",
              active === tab.key
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
      <div className="pt-6">{current?.content}</div>
    </div>
  );
}
