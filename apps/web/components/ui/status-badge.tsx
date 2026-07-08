import { cn } from "@/lib/utils";
import type { UserStatus } from "@/lib/data";

const config: Record<UserStatus, { label: string; dot: string }> = {
  active: { label: "Active", dot: "bg-emerald-500" },
  invited: { label: "Invited", dot: "bg-amber-500" },
  suspended: { label: "Suspended", dot: "bg-muted-foreground" },
};

export function StatusBadge({
  status,
  className,
}: {
  status: UserStatus;
  className?: string;
}) {
  const { label, dot } = config[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium text-muted-foreground",
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", dot)} />
      {label}
    </span>
  );
}
