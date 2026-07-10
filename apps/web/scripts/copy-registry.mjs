// Copies the built shadcn registry from @kozmos-auth/ui into apps/web's public
// dir so it is served at /r/*.json (e.g. https://auth.kozmos.tech/r/kozmos-auth.json).
// The source of truth is packages/ui/public/r, produced by `shadcn build`
// (`npm run build:registry` in packages/ui). Run before dev/build.
import { cp, mkdir, readdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const src = resolve(here, "../../../packages/ui/public/r");
const dest = resolve(here, "../public/r");

await mkdir(dest, { recursive: true });
await cp(src, dest, { recursive: true });

const files = await readdir(dest);
console.log(`Copied ${files.length} registry file(s) → apps/web/public/r`);
