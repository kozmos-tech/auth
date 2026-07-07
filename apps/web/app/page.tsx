import { Button } from "@kozmos-auth/ui/components/button";

export default function Home() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-8 p-8 text-center">
      <div className="flex flex-col items-center gap-3">
        <span className="text-muted-foreground text-sm font-medium tracking-widest uppercase">
          Kozmos
        </span>
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Coming soon
        </h1>
        <p className="text-muted-foreground max-w-md text-balance">
          Open-source, MCP-native authentication. The admin dashboard is on its
          way.
        </p>
      </div>
      <Button asChild size="lg">
        <a href="https://github.com/kozmos-tech/auth">Follow on GitHub</a>
      </Button>
    </main>
  );
}
