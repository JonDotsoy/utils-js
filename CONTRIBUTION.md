## How to add tools

This project contains a set of tools to help developers write less code. Each tool is an independent package entry point with one implementation file, one spec file, one export in `package.json`, and one section in the README. See [DESIGN.md](./DESIGN.md) for the full design rules and conventions.

1. Describe a new tool with a name. Example: `set`.
2. Create the implementation at `./src/${name}/${name}.ts`. Example: `./src/set/set.ts`.
3. Write your logic in this file.
4. Create tests at `./src/${name}/${name}.spec.ts` using `bun:test`.
5. Add the export entry to `package.json` under `"exports"`:
   ```json
   "./${name}": {
     "import": "./libs/esm/${name}/${name}.js",
     "types": "./libs/types/${name}/${name}.d.ts"
   }
   ```
   `bun scripts/update-package.json.ts --write` can sync this automatically, but only after a build has produced `libs/esm`/`libs/types` (run `make build` first) — otherwise it will strip existing `types` entries for libs that haven't been built yet.
6. Add the tool to the top-level list in `README.md` and write a `## <Name>` section with a syntax block and at least one usage example.
7. Validate your change before opening a PR:
   - Run the test suite: `bun test`.
   - Run `make build` — `bun test` does **not** perform a full type-check, so a change can pass all tests while still failing `tsc`. `make build` compiles both `libs/esm` and `libs/types` and is the same check the release pipeline runs; it must pass with no errors.
   - Install the packed tarball in a scratch directory and confirm the new lib actually loads. Neither of the checks above installs the package as a real dependency, so a wrong path or missing entry in `package.json`'s `"exports"` won't be caught by them:
     ```bash
     npm pack                                   # runs prepack (make build) and produces jondotsoy-utils-js-<version>.tgz
     tmp=$(mktemp -d) && cd "$tmp"
     npm init -y >/dev/null
     npm install /path/to/utils-js/jondotsoy-utils-js-*.tgz
     node -e "import('@jondotsoy/utils-js/<name>').then(m => console.log(m))"
     cd - && rm -rf "$tmp"
     ```
8. Submit a new pull request here: https://github.com/JonDotsoy/utils-js/pulls
9. Once your PR is merged and the follow-up `chore(develop): release utils-js <version>` PR (opened automatically by release-please) is merged too, the new version is live on npm. As a final e2e check, install the **real published package** (not a local tarball) in a scratch directory and confirm your new lib loads from it — this is the only check that validates what a consumer actually gets, since `npm pack` only packs your local working tree:
   ```bash
   npm view @jondotsoy/utils-js version   # confirm the new version is live

   tmp=$(mktemp -d) && cd "$tmp"
   npm init -y >/dev/null
   npm install @jondotsoy/utils-js@<version>
   node -e "import('@jondotsoy/utils-js/<name>').then(m => console.log(m))"
   cd - && rm -rf "$tmp"
   ```
   If `npm install` fails with `ETARGET ... with a date before ...`, that's npm's **`min-release-age`** config (a supply-chain guardrail some setups enable that blocks installing packages published too recently) — not a broken release. Pass `--min-release-age=0` for this one command to validate anyway, without changing the guardrail globally.

## Commands

```bash
bun test                                    # run all tests
bun test src/<lib>                          # run tests for a single lib
make build                                  # compile to libs/esm and libs/types — required validation, not optional
bun scripts/update-package.json.ts --write  # sync exports in package.json (after make build)
```
