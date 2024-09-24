import { pipe } from "../src/pipe/pipe.js";
import { Glob } from "bun";
import * as path from "path";
// import pkg from "../package.json";
import fs from "fs/promises";
const pkgLocation = new URL(import.meta.resolve("../package.json"));

const pkg = await fs.readFile(pkgLocation, "utf-8").then(JSON.parse);
pkg.exports ??= {};
const importAliases: Record<string, string> = { index: "." };

const globModules = (cwd: string, pattern: string) => {
  const glob = new Glob(pattern);

  const pathCwd = new URL(cwd, import.meta.url);

  return Array.fromAsync(
    glob.scan({
      cwd: pathCwd.pathname,
      absolute: true,
      onlyFiles: false,
      dot: false,
      followSymlinks: false,
    }),
    async (elementPath) => {
      const stat = await fs.stat(elementPath);
      const isDirectory = stat.isDirectory();
      const extname = path.extname(elementPath);
      const name = path.basename(elementPath, extname);

      return {
        name,
        isDirectory,
        elementPath,
      };
    },
  );
};

const pkgExports = await pipe(globModules("../src/", "*"))
  .pipe((list) =>
    Array.fromAsync(list, async ({ name }) => {
      const findLibs = async (name: string) => {
        const esmLib = await Array.fromAsync(
          [
            new URL(`../libs/esm/${name}/${name}.js`, import.meta.url),
            new URL(`../libs/esm/${name}.js`, import.meta.url),
          ],
          async (location) => {
            const exists = await fs.exists(location);
            return exists ? location.toString() : null;
          },
        );

        const typeLib = await Array.fromAsync(
          [
            new URL(`../libs/types/${name}/${name}.d.ts`, import.meta.url),
            new URL(`../libs/types/${name}.d.ts`, import.meta.url),
          ],
          async (location) => {
            const exists = await fs.exists(location);
            return exists ? location.toString() : null;
          },
        );

        return {
          esm: esmLib.find(Boolean),
          type: typeLib.find(Boolean),
        };
      };

      return {
        name,
        libs: await findLibs(name),
      };
    }),
  )
  .pipe((list) =>
    Array.fromAsync(list, async (info) => {
      const relative = (location?: string | null) => {
        return location
          ? `./${path.relative(new URL("./", pkgLocation).pathname, new URL(location).pathname)}`
          : undefined;
      };
      return [
        importAliases[info.name] ?? `./${info.name}`,
        {
          import: relative(info.libs.esm),
          types: relative(info.libs.type),
        },
      ];
    }),
  )
  .pipe((list) => list.sort(([a], [b]) => (a > b ? 1 : -1)))
  .pipe((list) => Object.fromEntries(list))
  .value();

Reflect.set(pkg, "exports", pkgExports);

// console.log("🚀 ~ pkg:", pkg)
const writeMode = process.argv.indexOf("--write") !== -1;
if (writeMode) {
  // console.log("🚀 ~ writeMode:", writeMode);
  const e = JSON.stringify(pkg, null, 2);
  await fs.writeFile(pkgLocation, e);
}
