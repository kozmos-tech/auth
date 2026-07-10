import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { CodeBlock } from "@/components/docs/code-block";
import { SideNav, type DocNavItem } from "@/components/docs/side-nav";

export const metadata: Metadata = {
  title: "Docs · Kozmos",
  description:
    "How to add Kozmos authentication to your Next.js or Hono app with the @kozmos-auth SDK and prebuilt UI.",
};

const NAV: DocNavItem[] = [
  { id: "overview", label: "Overview" },
  { id: "install", label: "Install" },
  { id: "configure", label: "Configure" },
  { id: "nextjs", label: "Next.js" },
  { id: "hono", label: "Hono" },
  { id: "ui", label: "UI components" },
  { id: "html", label: "Server-rendered HTML" },
  { id: "reference", label: "Entry points" },
];

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-10 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Kozmos
        </Link>
        <Link
          href="/app"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Dashboard
        </Link>
      </div>

      <div className="grid gap-12 lg:grid-cols-[200px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-10 lg:h-fit">
          <SideNav items={NAV} />
        </aside>

        <main className="flex min-w-0 flex-col gap-16">
          <Section id="overview" title="Overview">
            <p>
              Kozmos is open-source, MCP-native authentication. Create a project
              in the dashboard to get a publishable key (<Code>pk_live_…</Code>)
              and a secret key (<Code>sk_live_…</Code>), then install{" "}
              <Code>@kozmos-auth/auth</Code> into your own app to add auth for
              your end-users — email/password out of the box, Google optionally.
              It works in <strong>Next.js</strong> and <strong>Hono</strong>, and{" "}
              <Code>@kozmos-auth/ui</Code> ships prebuilt sign-in screens on top
              of it.
            </p>
            <Callout>
              The hosted end-user auth backend is still being built. The SDK and
              UI are correct and stable, but a real sign-in can’t complete until
              the backend is live. Point <Code>apiUrl</Code> at your Kozmos
              backend when it’s available.
            </Callout>
          </Section>

          <Section id="install" title="Install">
            <p>
              Install the SDK. It’s the only package you add to your
              dependencies — the prebuilt UI is installed separately as editable
              source with shadcn (see <strong>UI components</strong> below).
            </p>
            <CodeBlock lang="sh" code={`npm install @kozmos-auth/auth`} />
            <p>
              <Code>react</Code>, <Code>next</Code>, and <Code>hono</Code> are
              optional peer dependencies — install only what your app already
              uses.
            </p>
          </Section>

          <Section id="configure" title="Configure">
            <p>
              Grab your keys from the project dashboard and set them as
              environment variables. The <Code>NEXT_PUBLIC_</Code> values are
              browser-safe; the secret key must stay server-only.
            </p>
            <CodeBlock
              lang="sh"
              code={`# Client (browser-safe)
NEXT_PUBLIC_KOZMOS_PUBLISHABLE_KEY="pk_live_..."
NEXT_PUBLIC_KOZMOS_API_URL="https://auth.kozmos.tech"
NEXT_PUBLIC_KOZMOS_GOOGLE="true"   # optional — enables Google sign-in

# Server (never exposed to the browser)
KOZMOS_SECRET_KEY="sk_live_..."
KOZMOS_API_URL="https://auth.kozmos.tech"`}
            />
            <p>
              Prefer explicit config? Pass the values straight to{" "}
              <Code>createKozmosClient(...)</Code> /{" "}
              <Code>createServerClient(...)</Code> instead of using env vars.
            </p>
          </Section>

          <Section id="nextjs" title="Next.js">
            <Subsection title="Client components">
              <p>
                Zero-config once the <Code>NEXT_PUBLIC_KOZMOS_*</Code> vars are
                set — import the actions and the session hook directly.
              </p>
              <CodeBlock
                lang="tsx"
                code={`"use client";
import { signIn, useSession, signInWithGoogle } from "@kozmos-auth/auth/react";

export function LoginButtons({ email, password }) {
  const { data, isPending } = useSession();
  if (data) return <p>Signed in as {data.user.email}</p>;

  return (
    <>
      <button onClick={() => signIn.email({ email, password })}>Sign in</button>
      <button onClick={() => signInWithGoogle()}>Continue with Google</button>
    </>
  );
}`}
              />
            </Subsection>

            <Subsection title="Server components & route handlers">
              <p>
                Read the current end-user session on the server. Returns{" "}
                <Code>{`{ user, session }`}</Code> or <Code>null</Code>.
              </p>
              <CodeBlock
                lang="tsx"
                code={`import { getSession } from "@kozmos-auth/auth/next";

export default async function Page() {
  const session = await getSession();
  if (!session) return <p>Not signed in</p>;
  return <p>Hello {session.user.name}</p>;
}`}
              />
            </Subsection>

            <Subsection title="Protect routes with middleware">
              <p>
                Redirect unauthenticated requests to your sign-in page. Supply a{" "}
                <Code>matcher</Code> for the routes you want guarded.
              </p>
              <CodeBlock
                lang="ts"
                code={`// middleware.ts
import { createKozmosMiddleware } from "@kozmos-auth/auth/next";

export default createKozmosMiddleware({ signInUrl: "/sign-in" });
export const config = { matcher: ["/dashboard/:path*"] };`}
              />
            </Subsection>
          </Section>

          <Section id="hono" title="Hono">
            <p>
              <Code>kozmosAuth()</Code> verifies the session on each request and
              sets <Code>c.get(&quot;user&quot;)</Code> /{" "}
              <Code>c.get(&quot;session&quot;)</Code>. Type your app with{" "}
              <Code>KozmosEnv</Code> for full inference. Pass{" "}
              <Code>{`{ required: true }`}</Code> to return a <Code>401</Code>{" "}
              instead of <Code>null</Code>.
            </p>
            <CodeBlock
              lang="ts"
              code={`import { Hono } from "hono";
import { kozmosAuth, type KozmosEnv } from "@kozmos-auth/auth/hono";

const app = new Hono<KozmosEnv>();
app.use(kozmosAuth());

app.get("/me", (c) => {
  const user = c.get("user");        // KozmosUser | null
  return user ? c.json(user) : c.json({ error: "anon" }, 401);
});`}
            />
          </Section>

          <Section id="ui" title="UI components">
            <p>
              The prebuilt auth screens ship as a{" "}
              <strong>shadcn/ui registry</strong>, not an npm package. You install
              them with the shadcn CLI, which copies the components straight into
              your project as <strong>editable source you own</strong> — tweak the
              markup, styling, and copy however you like. The only runtime
              dependency they add is the <Code>@kozmos-auth/auth</Code> SDK.
            </p>
            <CodeBlock
              lang="sh"
              code={`npx shadcn@latest add https://auth.kozmos.tech/r/kozmos-auth.json`}
            />
            <p>
              This drops the forms, gates, profile, and their primitives (button,
              input, card, …) into your components directory and wires the Kozmos
              theme tokens into your <Code>globals.css</Code>. Requires a project
              already set up for <strong>Tailwind v4</strong> and{" "}
              <strong>shadcn/ui</strong> (<Code>npx shadcn@latest init</Code>).
              After installing, import from your own project paths — not from a
              package:
            </p>
            <Subsection title="Sign-in / sign-up forms">
              <CodeBlock
                lang="tsx"
                code={`"use client";
import { SignInForm } from "@/components/auth/sign-in-form";

export default function SignInPage() {
  return (
    <div className="grid min-h-svh place-items-center">
      <SignInForm google callbackURL="/dashboard" signUpUrl="/sign-up" />
    </div>
  );
}`}
              />
            </Subsection>
            <Subsection title="Session gates & profile">
              <p>
                Clerk-style gates render by session state;{" "}
                <Code>UserProfile</Code> shows the signed-in user with a sign-out
                button.
              </p>
              <CodeBlock
                lang="tsx"
                code={`import { SignedIn, SignedOut, AuthLoading } from "@/components/auth/auth-gate";
import { UserProfile } from "@/components/auth/user-profile";
import { SignInForm } from "@/components/auth/sign-in-form";

<AuthLoading><Spinner /></AuthLoading>
<SignedIn><UserProfile redirectTo="/sign-in" /></SignedIn>
<SignedOut><SignInForm signUpUrl="/sign-up" /></SignedOut>`}
              />
            </Subsection>
            <p>
              Components:{" "}
              <Code>SignInForm</Code>, <Code>SignUpForm</Code>,{" "}
              <Code>SignOutButton</Code>, <Code>UserProfile</Code>,{" "}
              <Code>SignedIn</Code>, <Code>SignedOut</Code>,{" "}
              <Code>AuthLoading</Code>. Each works zero-config with the{" "}
              <Code>NEXT_PUBLIC_KOZMOS_*</Code> vars, or accepts an explicit{" "}
              <Code>client</Code> prop to override the default env-configured
              client. Because they’re now your files, edit them in place.
            </p>
          </Section>

          <Section id="html" title="Server-rendered HTML">
            <p>
              For non-React servers (Hono, Express, plain Node),{" "}
              <Code>renderAuthPage()</Code> returns a complete, self-contained
              HTML document — inline CSS, theme-aware, vanilla{" "}
              <Code>fetch</Code> straight to the backend. No build step, no client
              bundle. Add it with shadcn as a single editable file:
            </p>
            <CodeBlock
              lang="sh"
              code={`npx shadcn@latest add https://auth.kozmos.tech/r/kozmos-auth-html.json`}
            />
            <CodeBlock
              lang="ts"
              code={`import { Hono } from "hono";
import { renderAuthPage } from "@/lib/auth-page";

const app = new Hono();

app.get("/sign-in", (c) =>
  c.html(renderAuthPage({
    mode: "sign-in",
    apiUrl: "https://auth.kozmos.tech",
    publishableKey: "pk_live_...",
    redirectTo: "/",
    signUpPath: "/sign-up",
    google: true,
  })),
);`}
            />
          </Section>

          <Section id="reference" title="Entry points">
            <p>
              The <Code>@kozmos-auth/auth</Code> SDK exposes one import per
              runtime:
            </p>
            <Reference
              rows={[
                [
                  "@kozmos-auth/auth",
                  "Framework-agnostic core: createKozmosClient, types, config helpers",
                ],
                [
                  "@kozmos-auth/auth/react",
                  "React: useSession, signIn / signUp / signOut, KozmosProvider",
                ],
                [
                  "@kozmos-auth/auth/server",
                  "Server: createServerClient, verifySession(headers)",
                ],
                [
                  "@kozmos-auth/auth/next",
                  "Next.js: getSession / auth, createKozmosMiddleware",
                ],
                ["@kozmos-auth/auth/hono", "Hono: kozmosAuth, KozmosEnv"],
              ]}
            />
            <p>
              The UI is not imported from a package — you install it with shadcn
              and import from your own project after:
            </p>
            <Reference
              rows={[
                [
                  "r/kozmos-auth.json",
                  "React components → @/components/auth/* (+ primitives)",
                ],
                [
                  "r/kozmos-auth-html.json",
                  "Server-rendered HTML page → @/lib/auth-page",
                ],
              ]}
            />
          </Section>
        </main>
      </div>
    </div>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 flex flex-col gap-4">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <div className="flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground [&_strong]:font-medium [&_strong]:text-foreground">
        {children}
      </div>
    </section>
  );
}

function Subsection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      {children}
    </div>
  );
}

function Code({ children }: { children: ReactNode }) {
  return (
    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.8125rem] text-foreground">
      {children}
    </code>
  );
}

function Callout({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
      <span className="font-medium text-foreground">Status: </span>
      {children}
    </div>
  );
}

function Reference({ rows }: { rows: [string, string][] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      {rows.map(([entry, use], index) => (
        <div
          key={entry}
          className={
            "flex flex-col gap-1 px-4 py-3 sm:flex-row sm:gap-6 " +
            (index > 0 ? "border-t border-border" : "")
          }
        >
          <code className="shrink-0 font-mono text-[0.8125rem] text-foreground sm:w-64">
            {entry}
          </code>
          <span className="text-sm text-muted-foreground">{use}</span>
        </div>
      ))}
    </div>
  );
}
