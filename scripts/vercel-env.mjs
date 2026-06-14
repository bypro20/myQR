import { readFileSync } from "fs";
import { spawnSync } from "child_process";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const env = {};
for (const line of readFileSync(join(root, ".env.production"), "utf8").split("\n")) {
  const m = line.match(/^([A-Z_]+)="(.*)"/);
  if (m) env[m[1]] = m[2];
}

for (const [k, v] of Object.entries(env)) {
  let r = spawnSync("npx", ["vercel", "env", "add", k, "production", "--force"], {
    cwd: root,
    input: v,
    encoding: "utf8",
    timeout: 60000,
  });
  if (r.status !== 0) {
    r = spawnSync("npx", ["vercel", "env", "add", k, "production"], {
      cwd: root,
      input: v,
      encoding: "utf8",
      timeout: 60000,
    });
  }
  console.log(r.status === 0 ? `ENV_OK:${k}` : `ENV_FAIL:${k}`);
}
