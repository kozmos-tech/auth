// @kozmos-auth/ui/html/auth-page — framework-agnostic HTML auth page.
//
// Returns a complete, self-contained HTML document (inline CSS + a tiny vanilla
// script) that signs an end-user in or up against a Kozmos project. It talks to
// the hosted backend directly with `fetch`, so it works from any server that can
// return HTML — Hono, Express, plain Node:
//
//   import { renderAuthPage } from "@kozmos-auth/ui/html/auth-page";
//
//   app.get("/sign-in", (c) =>
//     c.html(renderAuthPage({
//       mode: "sign-in",
//       apiUrl: "https://auth.kozmos.dev",
//       publishableKey: "pk_live_…",
//       redirectTo: "/",
//       signUpPath: "/sign-up",
//     })),
//   );

const DEFAULT_BASE_PATH = "/api/kozmos/auth";

export interface RenderAuthPageOptions {
  /** Which form to render. Defaults to `"sign-in"`. */
  mode?: "sign-in" | "sign-up";
  /** Base URL of the Kozmos backend (e.g. `https://auth.kozmos.dev`). */
  apiUrl: string;
  /** Project publishable key (`pk_live_…`). Safe to expose in the browser. */
  publishableKey: string;
  /** Path the auth API is mounted at. Defaults to `/api/kozmos/auth`. */
  basePath?: string;
  /** Where to send the user after success. Defaults to `/`. */
  redirectTo?: string;
  /** Href of the sign-in page (link shown on the sign-up form). */
  signInPath?: string;
  /** Href of the sign-up page (link shown on the sign-in form). */
  signUpPath?: string;
  /** Show a "Continue with Google" button. */
  google?: boolean;
  /** Brand name shown in the header. Defaults to `"Kozmos"`. */
  brand?: string;
  /** Page `<title>`. Defaults to the form's action label. */
  title?: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

/** Renders a complete, self-contained HTML auth page. */
export function renderAuthPage(options: RenderAuthPageOptions): string {
  const mode = options.mode ?? "sign-in";
  const isSignUp = mode === "sign-up";
  const brand = options.brand ?? "Kozmos";
  const heading = isSignUp ? "Create your account" : "Sign in";
  const action = isSignUp ? "Create account" : "Sign in";
  const title = options.title ?? `${action} · ${brand}`;

  const cfg = {
    mode,
    apiUrl: stripTrailingSlash(options.apiUrl),
    basePath: options.basePath ?? DEFAULT_BASE_PATH,
    publishableKey: options.publishableKey,
    redirectTo: options.redirectTo ?? "/",
  };
  // JSON is safe inside a <script> after neutralising the closing tag sequence.
  const cfgJson = JSON.stringify(cfg).replace(/</g, "\\u003c");

  const altLink = isSignUp
    ? options.signInPath
      ? `<p class="alt">Already have an account? <a href="${escapeHtml(options.signInPath)}">Sign in</a></p>`
      : ""
    : options.signUpPath
      ? `<p class="alt">Don't have an account? <a href="${escapeHtml(options.signUpPath)}">Sign up</a></p>`
      : "";

  const nameField = isSignUp
    ? `<label class="field"><span>Name</span>
         <input id="name" name="name" type="text" autocomplete="name" required placeholder="Ada Lovelace" />
       </label>`
    : "";

  const googleButton = options.google
    ? `<div class="divider"><span></span>or<span></span></div>
       <button type="button" id="google" class="btn btn-outline">Continue with Google</button>`
    : "";

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title>
<style>
  :root {
    color-scheme: light dark;
    --bg: #ffffff; --card: #ffffff; --fg: #0a0a0a; --muted: #737373;
    --border: #e5e5e5; --input: #e5e5e5; --primary: #171717; --primary-fg: #fafafa;
    --destructive: #dc2626; --radius: 10px;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #0a0a0a; --card: #171717; --fg: #fafafa; --muted: #a1a1a1;
      --border: #262626; --input: #2a2a2a; --primary: #fafafa; --primary-fg: #171717;
      --destructive: #f87171;
    }
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: var(--bg); color: var(--fg); padding: 24px;
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  }
  .card {
    width: 100%; max-width: 380px; background: var(--card); border: 1px solid var(--border);
    border-radius: 14px; padding: 28px; box-shadow: 0 1px 2px rgba(0,0,0,.05);
  }
  .brand { font-size: 13px; font-weight: 600; color: var(--muted); letter-spacing: .02em; }
  h1 { font-size: 20px; margin: 6px 0 20px; letter-spacing: -.01em; }
  form { display: flex; flex-direction: column; gap: 14px; }
  .field { display: flex; flex-direction: column; gap: 6px; font-size: 14px; font-weight: 500; }
  input {
    height: 38px; padding: 0 12px; font-size: 14px; color: var(--fg); background: transparent;
    border: 1px solid var(--input); border-radius: var(--radius); outline: none;
  }
  input:focus-visible { border-color: var(--fg); box-shadow: 0 0 0 3px rgba(120,120,120,.25); }
  .btn {
    height: 38px; border-radius: var(--radius); border: 1px solid transparent; cursor: pointer;
    font-size: 14px; font-weight: 500; transition: opacity .15s;
  }
  .btn:disabled { opacity: .6; cursor: default; }
  .btn-primary { background: var(--primary); color: var(--primary-fg); }
  .btn-outline { background: transparent; color: var(--fg); border-color: var(--border); }
  .divider { display: flex; align-items: center; gap: 12px; color: var(--muted); font-size: 12px; }
  .divider span { flex: 1; height: 1px; background: var(--border); }
  .error { color: var(--destructive); font-size: 14px; margin: 0; min-height: 0; }
  .alt { font-size: 14px; color: var(--muted); text-align: center; margin: 16px 0 0; }
  .alt a { color: var(--fg); font-weight: 500; }
</style>
</head>
<body>
  <div class="card">
    <div class="brand">${escapeHtml(brand)}</div>
    <h1>${escapeHtml(heading)}</h1>
    <form id="auth-form">
      ${nameField}
      <label class="field"><span>Email</span>
        <input id="email" name="email" type="email" autocomplete="email" required placeholder="you@example.com" />
      </label>
      <label class="field"><span>Password</span>
        <input id="password" name="password" type="password" autocomplete="${isSignUp ? "new-password" : "current-password"}" required minlength="8" placeholder="••••••••" />
      </label>
      <p class="error" id="error" role="alert"></p>
      <button type="submit" id="submit" class="btn btn-primary">${escapeHtml(action)}</button>
    </form>
    ${googleButton}
    ${altLink}
  </div>
<script>
(function () {
  var C = ${cfgJson};
  var base = C.apiUrl + C.basePath;
  var form = document.getElementById("auth-form");
  var errorEl = document.getElementById("error");
  var submitBtn = document.getElementById("submit");
  var googleBtn = document.getElementById("google");

  function headers() {
    return { "Content-Type": "application/json", "x-kozmos-publishable-key": C.publishableKey };
  }
  function showError(message) { errorEl.textContent = message || "Something went wrong. Please try again."; }
  async function readError(res) {
    try { var body = await res.json(); return body && body.message ? body.message : null; }
    catch (e) { return null; }
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    showError("");
    submitBtn.disabled = true;
    var payload = {
      email: document.getElementById("email").value,
      password: document.getElementById("password").value
    };
    var path = C.mode === "sign-up" ? "/sign-up/email" : "/sign-in/email";
    if (C.mode === "sign-up") payload.name = document.getElementById("name").value;
    try {
      var res = await fetch(base + path, {
        method: "POST", credentials: "include", headers: headers(), body: JSON.stringify(payload)
      });
      if (res.ok) { window.location.href = C.redirectTo; return; }
      showError((await readError(res)) || "Invalid email or password.");
    } catch (err) { showError("Network error. Please try again."); }
    submitBtn.disabled = false;
  });

  if (googleBtn) {
    googleBtn.addEventListener("click", async function () {
      showError("");
      googleBtn.disabled = true;
      try {
        var res = await fetch(base + "/sign-in/social", {
          method: "POST", credentials: "include", headers: headers(),
          body: JSON.stringify({ provider: "google", callbackURL: C.redirectTo })
        });
        var data = await res.json();
        if (res.ok && data && data.url) { window.location.href = data.url; return; }
        showError((data && data.message) || "Could not start Google sign-in.");
      } catch (err) { showError("Network error. Please try again."); }
      googleBtn.disabled = false;
    });
  }
})();
</script>
</body>
</html>`;
}
