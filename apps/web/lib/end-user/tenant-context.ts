// Per-request tenant context for the end-user auth service.
//
// The end-user Better Auth instance is multi-tenant: a single instance serves
// every project, and the `user`/`session`/`account` rows are scoped per project
// (`UNIQUE(projectId, email)`). Each request resolves its project from the
// incoming API key (see ./api-key) and runs the auth handler inside this
// AsyncLocalStorage scope. The scoped adapter (./scoped-adapter) reads the
// projectId from here to filter every query, so one project can never see
// another's users or sessions.

import { AsyncLocalStorage } from "node:async_hooks";

export interface TenantContext {
  projectId: string;
  keyType: "publishable" | "secret";
}

const storage = new AsyncLocalStorage<TenantContext>();

/** Runs `fn` with the given tenant bound for the duration of the request. */
export function runWithTenant<T>(ctx: TenantContext, fn: () => T): T {
  return storage.run(ctx, fn);
}

/** The current tenant, if a request is in flight. */
export function getTenant(): TenantContext | undefined {
  return storage.getStore();
}

/**
 * The current project id. Throws if called outside a tenant scope — this is a
 * deliberate fail-closed guard: an unscoped query against the shared end-user
 * tables would leak across projects, so we refuse to run one.
 */
export function requireProjectId(): string {
  const ctx = storage.getStore();
  if (!ctx) {
    throw new Error(
      "[kozmos] No tenant context: an end-user auth query ran outside a project-scoped request.",
    );
  }
  return ctx.projectId;
}
