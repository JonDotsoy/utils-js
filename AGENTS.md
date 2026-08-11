# Agent Instructions

> For detailed design rules, library structure, and maintenance guidelines see [DESIGN.md](./DESIGN.md).

## Project

TypeScript utility library published as `@jondotsoy/utils-js`. Each utility lives in its own directory under `src/` and is exported as a separate package entry point.

## Commands

```bash
bun test               # run all tests
bun test src/<lib>     # run tests for a single lib
make build             # compile to libs/esm and libs/types
bun scripts/update-package.json.ts --write  # sync exports in package.json
```

## Adding a new lib

1. Create `src/<name>/<name>.ts` with the implementation.
2. Create `src/<name>/<name>.spec.ts` with tests (use `bun:test`).
3. Add the export entry to `package.json`:
   ```json
   "./<name>": {
     "import": "./libs/esm/<name>/<name>.js",
     "types": "./libs/types/<name>/<name>.d.ts"
   }
   ```
4. Add the lib to the top-level list in `README.md` and write a `## <Name>` section with a syntax block and at least one usage example.

## Lifecycle: new lib → published release

The repo is fully automated from merge to npm publish via [release-please](https://github.com/googleapis/release-please) — there is no manual version bump or `npm publish` step.

1. **Implement** the lib following "Adding a new lib" above, on a branch off `develop`.
2. **Validate before opening a PR** — all three are required, none alone is sufficient:
   - `bun test` — runs the suite, but does **not** type-check the project.
   - `make build` — compiles `libs/esm` and `libs/types` via `tsc`; this is the only step that catches type errors (a change can pass every test and still fail `tsc` — this has happened before, see the `pick.ts` fix in #81).
   - **Install the packed tarball in a scratch directory and confirm the new lib actually loads** — `bun test` and `make build` only exercise source/compiled files in place; they don't catch export-map mistakes (wrong path in `package.json`, forgotten `types` entry, etc.) that only surface once the package is installed as a real dependency:
     ```bash
     npm pack                                   # runs prepack (make build) and produces jondotsoy-utils-js-<version>.tgz
     tmp=$(mktemp -d) && cd "$tmp"
     npm init -y >/dev/null
     npm install /path/to/utils-js/jondotsoy-utils-js-*.tgz
     node -e "import('@jondotsoy/utils-js/<name>').then(m => console.log(m))"
     cd - && rm -rf "$tmp"
     ```
     The compatibility suite under `tests/e2e/` automates the equivalent check across Node/Bun/Deno, but it's not run in the PR's `tests.yml` CI job, so it's worth this one manual pass for a new lib's export path.
3. **Open a PR** against `develop`. CI (`.github/workflows/tests.yml`) runs `bun test` on the PR automatically; `make build` is not run in that workflow, so it must be checked locally before merging.
4. **Write the commit/PR title as a [Conventional Commit](https://www.conventionalcommits.org/)** (`feat(...)`, `fix(...)`, `docs(...)`, `chore(...)`, etc.) — release-please parses this to decide the next version bump (`feat` → minor, `fix` → patch) and to generate the `CHANGELOG.md` entry. A squash-merge uses the PR title as the commit message, so the PR title itself must follow this format.
5. **Merge the PR** (squash) into `develop`.
6. release-please reacts to the push to `develop` and opens (or updates) a `chore(develop): release utils-js <version>` PR that bumps `package.json`'s version, `.release-please-manifest.json`, and `CHANGELOG.md` — no manual edits needed.
7. **Merge the release-please PR.** This is the action that actually ships the release: `.github/workflows/release.yaml`'s `delivery-npm` job runs only when that merge creates a GitHub release, then runs `bun install` and `npm publish --provenance` (the `prepack` script runs `make build` first, so a broken `tsc` build fails publishing at this stage too).
8. **Post-publish e2e check — install the real published version from the npm registry** (not a local tarball) and confirm the new lib loads from it. This is the only step that validates what a consumer actually gets: it catches anything specific to what `npm publish` put on the registry (missing `files`, wrong `"exports"` resolved against the published tarball, registry propagation issues) that a local `npm pack` can't, since that only packs the working tree.
   ```bash
   npm view @jondotsoy/utils-js version   # confirm the new version is live

   tmp=$(mktemp -d) && cd "$tmp"
   npm init -y >/dev/null
   npm install @jondotsoy/utils-js@<version>
   node -e "import('@jondotsoy/utils-js/<name>').then(m => console.log(m))"
   cd - && rm -rf "$tmp"
   ```
   A fresh release can be blocked by `npm install`'s **`min-release-age`** config (`npm config get min-release-age`) — a supply-chain guardrail some setups enable that refuses to install a package published within the configured number of days. If the install fails with `ETARGET ... with a date before ...`, that's this setting, not a broken release; pass `--min-release-age=0` for this one command to validate anyway, without changing the guardrail globally.

## Rules

- **After every change to `DESIGN.md`** run:
  ```bash
  bunx @google/design.md lint DESIGN.md
  ```

## Conventions

- **Test runner**: `bun:test` (`import { describe, it, expect, expectTypeOf } from "bun:test"`).
- **Type assertions**: use `expectTypeOf` from `bun:test`; for `.parameter()` use `Parameters<>` / `ReturnType<>` utilities instead.
- **Base unit pattern**: store values in a canonical base unit (e.g. grams, millimeters) and convert on read.
- **No comments** unless the reason is non-obvious.
- **No convenience getters** — expose a single conversion method (e.g. `.total(unit)`).
- Overloads are fine; keep the implementation signature private.
