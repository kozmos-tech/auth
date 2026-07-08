"use client";

import { useState, useTransition, type ReactNode } from "react";
import {
  Ban,
  CheckCircle2,
  Monitor,
  Settings,
  Smartphone,
  Trash2,
  User,
} from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tabs, type TabItem } from "@/components/dashboard/tabs";
import { deleteUser, setUserStatus, updateUser } from "@/lib/actions";
import type { DashboardUser, Project } from "@/lib/data";

const sessions = [
  {
    icon: Monitor,
    device: "MacBook Pro · Chrome",
    location: "Berlin, DE",
    active: "Current session",
    current: true,
  },
  {
    icon: Smartphone,
    device: "iPhone 15 · Safari",
    location: "Berlin, DE",
    active: "2 hours ago",
    current: false,
  },
];

export function UserDetail({
  project,
  user,
}: {
  project: Project;
  user: DashboardUser;
}) {
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    status: user.status,
  });
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const dirty =
    form.name !== user.name ||
    form.email !== user.email ||
    form.status !== user.status;

  function save() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateUser(project.id, user.id, form);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setSaved(true);
    });
  }

  function toggleSuspend() {
    const next = form.status === "suspended" ? "active" : "suspended";
    setError(null);
    startTransition(async () => {
      await setUserStatus(project.id, user.id, next);
      setForm((f) => ({ ...f, status: next }));
    });
  }

  const suspended = form.status === "suspended";

  const tabs: TabItem[] = [
    {
      key: "profile",
      label: "Profile",
      icon: <User className="size-4" />,
      content: (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card title="Profile">
              <dl className="divide-y divide-border">
                <ReadRow label="Full name" value={form.name} />
                <ReadRow label="Email" value={form.email} />
                <ReadRow label="Sign-in method" value={user.provider} />
                <ReadRow label="User ID" value={user.id} mono />
              </dl>
            </Card>
          </div>
          <Card title="Account">
            <dl className="divide-y divide-border">
              <ReadRow label="Project" value={project.name} />
              <ReadRow label="Created" value={user.createdAt} />
              <ReadRow label="Last active" value={user.lastActive} />
            </dl>
          </Card>
        </div>
      ),
    },
    {
      key: "sessions",
      label: "Sessions",
      icon: <Monitor className="size-4" />,
      content: (
        <Card title="Active sessions">
          <div className="-mx-1">
            {sessions.map((session) => {
              const Icon = session.icon;
              return (
                <div
                  key={session.device}
                  className="flex items-center justify-between rounded-lg px-1 py-2.5"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <Icon className="size-4" />
                    </span>
                    <div>
                      <p className="text-sm font-medium">{session.device}</p>
                      <p className="text-xs text-muted-foreground">
                        {session.location} · {session.active}
                      </p>
                    </div>
                  </div>
                  {session.current ? (
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      Active now
                    </span>
                  ) : (
                    <button className="text-xs font-medium text-muted-foreground transition-colors hover:text-destructive">
                      Revoke
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      ),
    },
    {
      key: "settings",
      label: "Settings",
      icon: <Settings className="size-4" />,
      content: (
        <div className="space-y-6">
          <div className="flex items-center justify-end gap-2">
            {saved && !dirty && (
              <span className="mr-auto text-sm text-muted-foreground">
                Changes saved.
              </span>
            )}
            {error && (
              <span className="mr-auto text-sm text-destructive">{error}</span>
            )}
            <Button
              variant="ghost"
              size="sm"
              disabled={!dirty || pending}
              onClick={() => {
                setForm({
                  name: user.name,
                  email: user.email,
                  status: user.status,
                });
                setError(null);
                setSaved(false);
              }}
            >
              Cancel
            </Button>
            <Button size="sm" disabled={!dirty || pending} onClick={save}>
              {pending ? "Saving…" : "Save changes"}
            </Button>
          </div>

          <Card title="Profile">
            <div className="space-y-4">
              <EditRow label="Full name">
                <Input
                  value={form.name}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, name: e.target.value }));
                    setSaved(false);
                  }}
                />
              </EditRow>
              <EditRow label="Email">
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, email: e.target.value }));
                    setSaved(false);
                  }}
                />
              </EditRow>
              <EditRow label="Status">
                <Select
                  value={form.status}
                  onChange={(e) => {
                    setForm((f) => ({
                      ...f,
                      status: e.target.value as DashboardUser["status"],
                    }));
                    setSaved(false);
                  }}
                >
                  <option value="active">Active</option>
                  <option value="invited">Invited</option>
                  <option value="suspended">Suspended</option>
                </Select>
              </EditRow>
            </div>
          </Card>

          <Card title="Danger zone">
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                <div>
                  <p className="text-sm font-medium">
                    {suspended ? "Reactivate user" : "Suspend user"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {suspended
                      ? `Restore access for ${form.name}.`
                      : `Revoke access for ${form.name} until re-enabled.`}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pending}
                  onClick={toggleSuspend}
                  className={
                    suspended
                      ? "border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-600 dark:text-emerald-400"
                      : "border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  }
                >
                  {suspended ? (
                    <CheckCircle2 className="size-4" />
                  ) : (
                    <Ban className="size-4" />
                  )}
                  {suspended ? "Reactivate" : "Suspend"}
                </Button>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                <div>
                  <p className="text-sm font-medium">Delete user</p>
                  <p className="text-xs text-muted-foreground">
                    Permanently remove {form.name} and all of their sessions.
                  </p>
                </div>
                <ConfirmDialog
                  title="Delete user"
                  description={`This permanently removes ${form.name} from ${project.name}, along with their sessions and linked accounts. This cannot be undone.`}
                  confirmLabel="Delete user"
                  onConfirm={() => deleteUser(project.id, user.id)}
                  trigger={(open) => (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={open}
                      className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                      Delete
                    </Button>
                  )}
                />
              </div>
            </div>
          </Card>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar name={form.name} className="size-14 text-lg" />
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-semibold tracking-tight">
              {form.name}
            </h1>
            <StatusBadge status={form.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{form.email}</p>
        </div>
      </div>

      <Tabs tabs={tabs} defaultTab="profile" />
    </div>
  );
}

function Card({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function ReadRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 text-sm first:pt-0 last:pb-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={mono ? "font-mono text-xs" : "font-medium"}>{value}</dd>
    </div>
  );
}

function EditRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}
