import { Glob } from "bun";
import * as path from "path";
// import pkg from "../package.json";
import fs from "fs/promises";
const pkgLocation = new URL(import.meta.resolve("../package.json"));

const pkg = await fs.readFile(pkgLocation, "utf-8").then(JSON.parse);
pkg.exports ??= {};
const importAliases: Record<string, string> = { index: "." };

async function ds(pattern: string, cwd: string, ext: string, t: string) {
  const glob = new Glob(pattern);

  const esm_libs_dir = new URL(cwd, import.meta.url);

  for await (const elm of glob.scan({
    cwd: esm_libs_dir.pathname,
    absolute: true,
  })) {
    const relative = path.relative(new URL("./", pkgLocation).pathname, elm);
    const basename = path.basename(relative, ext);
    const exportKey = importAliases[basename] ?? `./${basename}`;
    Reflect.set(
      pkg.exports,
      exportKey,
      Reflect.get(pkg.exports, exportKey) ?? {},
    );
    Reflect.set(Reflect.get(pkg.exports, exportKey), t, `./${relative}`);
  }
}

await ds("**/*.js", "../libs/esm/", ".js", "import");
await ds("**/*.d.ts", "../libs/types/", ".d.ts", "types");
//
// console.log("🚀 ~ pkg:", pkg)
const writeMode = process.argv.indexOf("--write") !== -1;
if (writeMode) {
  // console.log("🚀 ~ writeMode:", writeMode);
  const e = JSON.stringify(pkg, null, 2);
  await fs.writeFile(pkgLocation, e);
}
