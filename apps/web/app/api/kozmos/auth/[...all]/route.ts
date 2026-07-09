// Hosted end-user auth endpoint — what the @kozmos-auth/auth SDK talks to.
//
// Every request must present a project API key (publishable key header, or a
// secret key as a Bearer token). We resolve it to a project, then run the Better
// Auth handler inside that project's tenant context so all queries are scoped to
// it. Unknown or mismatched keys get a 401 before any auth logic runs.
//
// Lives at /api/kozmos/auth so it never collides with the dashboard's own auth
// at /api/auth.

import { toNextJsHandler } from "better-auth/next-js";

import { resolveTenant } from "@/lib/end-user/api-key";
import { endUserAuth } from "@/lib/end-user/auth";
import { runWithTenant } from "@/lib/end-user/tenant-context";

const handlers = toNextJsHandler(endUserAuth);

// The SDK runs in the customer's app, a different origin, so browser calls are
// cross-origin and need CORS with credentials. We reflect the request Origin
// (required when Allow-Credentials is true — "*" is not allowed).
function corsHeaders(req: Request): Headers {
  const headers = new Headers();
  const origin = req.headers.get("origin");
  if (origin) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Credentials", "true");
  }
  headers.set("Vary", "Origin");
  headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, x-kozmos-publishable-key",
  );
  return headers;
}

export function OPTIONS(req: Request): Response {
  return new Response(null, { status: 204, headers: corsHeaders(req) });
}

async function handle(
  method: "GET" | "POST",
  req: Request,
): Promise<Response> {
  const cors = corsHeaders(req);

  const tenant = await resolveTenant(req);
  if (!tenant) {
    return Response.json(
      { error: "invalid_or_missing_api_key" },
      { status: 401, headers: cors },
    );
  }

  const res = await runWithTenant(tenant, () => handlers[method](req));
  cors.forEach((value, key) => res.headers.set(key, value));
  return res;
}

export const GET = (req: Request): Promise<Response> => handle("GET", req);
export const POST = (req: Request): Promise<Response> => handle("POST", req);
