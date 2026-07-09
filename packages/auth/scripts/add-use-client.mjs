// esbuild strips the top-level "use client" directive when bundling (imports get
// hoisted above it), so we prepend it to the built React entry as a final step.
// The directive must be the very first line for RSC bundlers to pick it up.
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const target = fileURLToPath(new URL("../dist/react.js", import.meta.url));
const source = await readFile(target, "utf8");

if (!source.startsWith('"use client";')) {
  await writeFile(target, `"use client";\n${source}`);
}
