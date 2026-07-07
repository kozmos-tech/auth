import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

/**
 * Builds the Kozmos MCP server. Tools defined here are exposed to any MCP
 * client (Claude, editors, etc.). Auth-protected transports should resolve the
 * caller's session via `@kozmos-auth/auth` and pass it into the tool handlers.
 */
export function createMcpServer() {
  const server = new McpServer({
    name: "kozmos-auth",
    version: "0.0.0",
  });

  server.registerTool(
    "whoami",
    {
      title: "Who am I",
      description: "Returns the identity of the authenticated caller.",
      inputSchema: {
        userId: z
          .string()
          .optional()
          .describe("The authenticated user id, if resolved by the transport."),
      },
    },
    async ({ userId }) => ({
      content: [
        {
          type: "text",
          text: userId
            ? `Authenticated as ${userId}.`
            : "No authenticated session.",
        },
      ],
    }),
  );

  return server;
}
