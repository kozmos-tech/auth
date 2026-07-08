import { TopNav } from "@/components/dashboard/top-nav";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <TopNav crumbs={[{ label: "Projects", href: "/app" }]} />
      <main className="mx-auto max-w-6xl px-6 pt-5 pb-8">
        <div className="mb-8 space-y-2">
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-8 w-44" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-4 w-80" />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-4 border-b border-border pb-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-20" />
          ))}
        </div>

        {/* Users table */}
        <div className="space-y-4 pt-6">
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-full max-w-xs" />
            <Skeleton className="h-9 w-24" />
            <Skeleton className="ml-auto h-9 w-28" />
          </div>
          <div className="overflow-hidden rounded-lg border border-border">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-0"
              >
                <Skeleton className="size-9 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-56" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="hidden h-4 w-16 sm:block" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
