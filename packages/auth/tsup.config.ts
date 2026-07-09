import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    react: "src/react.ts",
    server: "src/server.ts",
    next: "src/next.ts",
    hono: "src/hono.ts",
  },
  format: ["esm"],
  dts: true,
  clean: true,
  splitting: false,
  treeshake: true,
  // Peers and better-auth stay external — they're the consumer's responsibility.
  external: ["react", "react-dom", "next", "hono", "better-auth"],
  // esbuild drops the "use client" directive when bundling; a post-build step
  // (scripts/add-use-client.mjs, run from the `build` script) re-adds it to
  // dist/react.js.
});
