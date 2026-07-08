import { TopNav } from "@/components/dashboard/top-nav";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <TopNav crumbs={[{ label: "Projects", href: "/app" }]} />
      <main className="mx-auto max-w-6xl px-6 pt-5 pb-8">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="size-14 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-56" />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-4 border-b border-border pb-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-20" />
            ))}
          </div>

          {/* Profile */}
          <div className="grid gap-6 pt-2 lg:grid-cols-3">
            <div className="space-y-4 rounded-xl border border-border p-5 lg:col-span-2">
              <Skeleton className="h-4 w-24" />
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
            <div className="space-y-4 rounded-xl border border-border p-5">
              <Skeleton className="h-4 w-20" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-28" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
