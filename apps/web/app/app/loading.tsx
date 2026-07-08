import { TopNav } from "@/components/dashboard/top-nav";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <TopNav crumbs={[{ label: "Projects" }]} />
      <main className="mx-auto max-w-6xl px-6 pt-6 pb-10">
        <div className="flex items-end justify-between">
          <div className="space-y-2">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-9 w-32" />
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col rounded-xl border border-border p-5"
            >
              <Skeleton className="size-9 rounded-lg" />
              <Skeleton className="mt-4 h-5 w-24" />
              <Skeleton className="mt-2 h-4 w-full" />
              <Skeleton className="mt-1.5 h-4 w-2/3" />
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3.5 w-16" />
                  <Skeleton className="h-3.5 w-8" />
                </div>
                <Skeleton className="h-8 w-full" />
              </div>
              <div className="mt-3 border-t border-border pt-3">
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
