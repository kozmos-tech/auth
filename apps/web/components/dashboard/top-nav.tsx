import { Fragment } from "react";
import Link from "next/link";
import { ChevronRight, LogOut } from "lucide-react";

import type { Crumb } from "@/components/dashboard/breadcrumbs";

export function TopNav({ crumbs = [] }: { crumbs?: Crumb[] }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-sm"
        >
          <Link href="/app" className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground">
              K
            </span>
            <span className="font-medium">Kozmos</span>
          </Link>
          {crumbs.map((crumb, index) => (
            <Fragment key={`${crumb.label}-${index}`}>
              <ChevronRight className="size-3.5 text-muted-foreground/40" />
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="rounded-md px-1.5 py-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="px-1.5 py-0.5 font-medium text-foreground">
                  {crumb.label}
                </span>
              )}
            </Fragment>
          ))}
        </nav>

        <button className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
          <LogOut className="size-4" />
          Log out
        </button>
      </div>
    </header>
  );
}
