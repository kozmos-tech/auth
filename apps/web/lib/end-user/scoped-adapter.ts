// Project-scoped wrapper around the Drizzle adapter.
//
// The end-user tables (`user`, `session`, `account`) are shared by every
// project and keyed by `projectId`. This wrapper appends a `projectId = <tenant>`
// condition to every read/update/delete against those models and injects the
// current project's id into every create. Combined with the create-time
// injection in the databaseHooks (see ./auth), it guarantees a request keyed for
// project A can never read, mutate, or create rows in project B — even with a
// valid cookie from another project.
//
// `verification` (and the platform tables) are intentionally NOT scoped: they
// carry no projectId column.

import type { DBAdapter, DBAdapterInstance, Where } from "better-auth";

import { requireProjectId } from "./tenant-context";

// Better Auth logical model names that carry a projectId column.
const TENANT_MODELS = new Set(["user", "session", "account"]);

const PROJECT_FIELD = "projectId";

function scopeWhere(where: Where[] | undefined, projectId: string): Where[] {
  const tenant: Where = {
    field: PROJECT_FIELD,
    value: projectId,
    connector: "AND",
  };
  return where && where.length > 0 ? [...where, tenant] : [tenant];
}

// Method names whose args carry a `where` clause we must scope.
const WHERE_METHODS = new Set([
  "findOne",
  "findMany",
  "count",
  "update",
  "updateMany",
  "delete",
  "deleteMany",
  "consumeOne",
  "incrementOne",
]);

type AnyAdapter = DBAdapter | Omit<DBAdapter, "transaction">;

// Wraps an adapter (or a transaction adapter) so tenant models are scoped. Uses
// a Proxy so we don't have to re-declare Better Auth's generic method
// signatures — the target's types flow through untouched.
function scope<A extends AnyAdapter>(adapter: A): A {
  return new Proxy(adapter, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (typeof value !== "function") return value;
      const key = prop as string;

      if (key === "create") {
        return (arg: { model: string; data: Record<string, unknown> }) => {
          if (!TENANT_MODELS.has(arg.model)) return value.call(target, arg);
          return value.call(target, {
            ...arg,
            data: { ...arg.data, [PROJECT_FIELD]: requireProjectId() },
          });
        };
      }

      if (WHERE_METHODS.has(key)) {
        return (arg: { model: string; where?: Where[] }) => {
          if (!TENANT_MODELS.has(arg.model)) return value.call(target, arg);
          return value.call(target, {
            ...arg,
            where: scopeWhere(arg.where, requireProjectId()),
          });
        };
      }

      if (key === "transaction") {
        // Scope operations inside a transaction too.
        return (cb: (trx: Omit<DBAdapter, "transaction">) => unknown) =>
          value.call(target, (trx: Omit<DBAdapter, "transaction">) =>
            cb(scope(trx)),
          );
      }

      return value;
    },
  });
}

/**
 * Wraps a Drizzle `DBAdapterInstance` so the end-user tables are always scoped
 * to the current request's project. Drop-in for `betterAuth({ database })`.
 */
export function tenantScopedAdapter(
  base: DBAdapterInstance,
): DBAdapterInstance {
  return (options) => scope(base(options));
}
