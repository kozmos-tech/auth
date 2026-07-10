"use client";

import { useEffect, useState } from "react";

export interface DocNavItem {
  id: string;
  label: string;
}

/**
 * Sticky anchor nav with scrollspy. Highlights the section currently in view
 * using an IntersectionObserver over the rendered section headings.
 */
export function SideNav({ items }: { items: DocNavItem[] }) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      // Trigger when a heading is in the upper portion of the viewport.
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav className="flex flex-col gap-0.5 text-sm" aria-label="On this page">
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className={
            "rounded-md px-3 py-1.5 transition-colors " +
            (active === item.id
              ? "bg-accent font-medium text-foreground"
              : "text-muted-foreground hover:text-foreground")
          }
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}
