export const dynamic = "force-static";

const BODY = `# Kozmos

> Open-source, MCP-native authentication.

Coming soon.

The full llms.txt — setup guide, API reference, and MCP endpoints your
assistant can read to wire up auth for you — is on its way.

Follow along: https://github.com/kozmos-tech/auth
`;

export function GET() {
  return new Response(BODY, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
