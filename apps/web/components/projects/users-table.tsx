"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpDown, Plus, Search, SlidersHorizontal } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";
import type { DashboardUser, Project } from "@/lib/mock-data";

type SortKey = "name" | "role" | "lastActive";

const PAGE_SIZE = 4;

export function UsersTable({ project }: { project: Project }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [role, setRole] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("name");
  const [asc, setAsc] = useState(true);
  const [page, setPage] = useState(0);

  const activeFilters = (status !== "all" ? 1 : 0) + (role !== "all" ? 1 : 0);

  const filtered = useMemo(() => {
    const rows = project.users.filter((user) => {
      const matchesQuery =
        !query ||
        user.name.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = status === "all" || user.status === status;
      const matchesRole = role === "all" || user.role === role;
      return matchesQuery && matchesStatus && matchesRole;
    });
    return [...rows].sort(
      (a, b) => a[sort].localeCompare(b[sort]) * (asc ? 1 : -1),
    );
  }, [project.users, query, status, role, sort, asc]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount - 1);
  const rows = filtered.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);

  function toggleSort(key: SortKey) {
    if (sort === key) {
      setAsc((v) => !v);
    } else {
      setSort(key);
      setAsc(true);
    }
  }

  function open(user: DashboardUser) {
    router.push(`/app/projects/${project.id}/users/${user.id}`);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
            placeholder="Search users…"
            className="pl-9"
          />
        </div>

        <FilterPopover
          activeCount={activeFilters}
          status={status}
          role={role}
          onStatus={(v) => {
            setStatus(v);
            setPage(0);
          }}
          onRole={(v) => {
            setRole(v);
            setPage(0);
          }}
          onClear={() => {
            setStatus("all");
            setRole("all");
            setPage(0);
          }}
        />

        <Button size="sm" className="ml-auto">
          <Plus className="size-4" />
          Invite user
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-2.5 font-medium">
                <SortButton
                  label="User"
                  active={sort === "name"}
                  asc={asc}
                  onClick={() => toggleSort("name")}
                />
              </th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 font-medium">
                <SortButton
                  label="Role"
                  active={sort === "role"}
                  asc={asc}
                  onClick={() => toggleSort("role")}
                />
              </th>
              <th className="hidden px-4 py-2.5 font-medium md:table-cell">
                Provider
              </th>
              <th className="hidden px-4 py-2.5 font-medium sm:table-cell">
                <SortButton
                  label="Last active"
                  active={sort === "lastActive"}
                  asc={asc}
                  onClick={() => toggleSort("lastActive")}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((user) => (
              <tr
                key={user.id}
                onClick={() => open(user)}
                className="cursor-pointer border-b border-border transition-colors last:border-0 hover:bg-muted/50"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={user.name} />
                    <span className="flex flex-col">
                      <span className="font-medium text-foreground">
                        {user.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={user.status} />
                </td>
                <td className="px-4 py-3 text-muted-foreground">{user.role}</td>
                <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                  {user.provider}
                </td>
                <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                  {user.lastActive}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-sm text-muted-foreground"
                >
                  No users match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {filtered.length === 0
            ? "0 users"
            : `Showing ${current * PAGE_SIZE + 1}–${Math.min(
                (current + 1) * PAGE_SIZE,
                filtered.length,
              )} of ${filtered.length}`}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={current === 0}
            onClick={() => setPage(current - 1)}
          >
            Previous
          </Button>
          <span className="tabular-nums">
            {current + 1} / {pageCount}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={current >= pageCount - 1}
            onClick={() => setPage(current + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

function FilterPopover({
  activeCount,
  status,
  role,
  onStatus,
  onRole,
  onClear,
}: {
  activeCount: number;
  status: string;
  role: string;
  onStatus: (value: string) => void;
  onRole: (value: string) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground",
          activeCount > 0 && "border-foreground/30",
        )}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <SlidersHorizontal className="size-4" />
        Filters
        {activeCount > 0 && (
          <span className="flex size-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-11 z-50 w-64 rounded-lg border border-border bg-popover p-3 shadow-lg">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Status
              </label>
              <Select value={status} onChange={(e) => onStatus(e.target.value)}>
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="invited">Invited</option>
                <option value="suspended">Suspended</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Role
              </label>
              <Select value={role} onChange={(e) => onRole(e.target.value)}>
                <option value="all">All roles</option>
                <option value="Owner">Owner</option>
                <option value="Admin">Admin</option>
                <option value="Member">Member</option>
              </Select>
            </div>
            {activeCount > 0 && (
              <button
                onClick={onClear}
                className="w-full text-left text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SortButton({
  label,
  active,
  asc,
  onClick,
}: {
  label: string;
  active: boolean;
  asc: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 font-medium transition-colors hover:text-foreground",
        active && "text-foreground",
      )}
    >
      {label}
      <ArrowUpDown className={cn("size-3", active ? "opacity-100" : "opacity-40")} />
    </button>
  );
}
