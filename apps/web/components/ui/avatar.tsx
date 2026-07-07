import { cn, initials } from "@/lib/utils";

export function Avatar({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex size-8 select-none items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground",
        className,
      )}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
