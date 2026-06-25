---
name: utils-js
version: "1"
libs:
  location: src/<name>/<name>.ts
  spec: src/<name>/<name>.spec.ts
  export: ./libs/esm/<name>/<name>.js
  types: ./libs/types/<name>/<name>.d.ts
conventions:
  testRunner: bun:test
  baseUnit: store values in a canonical base unit; convert on read via .total(unit)
  noConvenienceGetters: true
  noComments: unless the reason is non-obvious
index:
  file: README.md
  rule: add each new lib to the top-level list and include a ## section with syntax + example
packageJson:
  exports: add "./<name>" entry with import and types paths for every new lib
  sync: bun scripts/update-package.json.ts --write
---

## Overview

`@jondotsoy/utils-js` is a TypeScript utility library where every utility is an independent package entry point. Each lib is self-contained: one implementation file, one spec file, one export in `package.json`, and one section in the README.

## Library structure

Every lib lives under `src/` in its own directory and follows this layout:

```
src/<name>/
  <name>.ts       # implementation
  <name>.spec.ts  # tests
```

The implementation file exports one primary class or function. The spec file uses `bun:test` exclusively.

## Adding a new lib

1. Create `src/<name>/<name>.ts` with the implementation.
2. Create `src/<name>/<name>.spec.ts` with tests.
3. Add the export to `package.json` under `"exports"`:
   ```json
   "./<name>": {
     "import": "./libs/esm/<name>/<name>.js",
     "types": "./libs/types/<name>/<name>.d.ts"
   }
   ```
4. Add the lib to the index list in `README.md` and create a `## <Name>` section with syntax and a usage example.
5. Run `bun scripts/update-package.json.ts --write` to sync exports.

## Conventions

**Base unit pattern** — store the canonical value in one unit internally (e.g. grams, millimeters) and convert on read. Expose a single `.total(unit)` method; do not add convenience getters.

**Test runner** — always `bun:test`. Import from `"bun:test"`:
```ts
import { describe, it, expect, expectTypeOf } from "bun:test";
```

For type assertions use `Parameters<>` and `ReturnType<>` utilities when `.parameter()` is needed, since `bun:test`'s `expectTypeOf` does not support that method.

**No comments** — only add a comment when the reason is non-obvious (a hidden constraint, a subtle invariant, a workaround).

**Overloads** — public overloads are fine; keep the implementation signature private (not exported).

## Maintaining the README

Every lib must appear in the top-level list and have its own `##` section. The section must include:

- **Syntax** block showing the primary API call.
- At least one concrete usage example.

Keep the list alphabetical or in order of addition — be consistent with what is already there.

## Maintaining package.json

- One `"exports"` entry per lib, keyed as `"./<name>"`.
- After adding or renaming a lib run:
  ```bash
  bun scripts/update-package.json.ts --write
  ```
- Do not remove existing export entries without removing the corresponding lib from `src/`.
