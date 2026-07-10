import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

import { McpDialog } from "@/components/landing/mcp-dialog";
import { SetupPrompt } from "@/components/landing/setup-prompt";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col justify-center gap-8 px-6 py-16">
      <header className="flex flex-col gap-3">
        <span className="text-sm font-medium tracking-widest text-muted-foreground uppercase">
          Kozmos
        </span>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Authentication your AI sets up for you.
        </h1>
        <p className="text-sm text-muted-foreground">
          Kozmos is open source authentication that works with your AI
          assistant. It connects over MCP so your assistant can set up sign in,
          sessions, and users for you.
        </p>
      </header>

      <section className="flex flex-col gap-2.5">
        <span className="text-xs font-medium text-muted-foreground">
          Paste this into Claude or any MCP client to get started.
        </span>
        <SetupPrompt />
      </section>

      <footer className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
        <FootLink href="/docs">Docs</FootLink>
        <FootLink href="/llms.txt">llms.txt</FootLink>
        <McpDialog />
        <FootLink href="https://github.com/kozmos-tech/auth" external>
          GitHub
        </FootLink>
        <a
          href="/app"
          className="ml-auto inline-flex items-center gap-1 transition-colors hover:text-foreground"
        >
          Dashboard
          <ArrowUpRight className="size-3.5" />
        </a>
      </footer>
    </main>
  );
}

function FootLink({
  href,
  external,
  children,
}: {
  href: string;
  external?: boolean;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className="transition-colors hover:text-foreground"
    >
      {children}
    </a>
  );
}
