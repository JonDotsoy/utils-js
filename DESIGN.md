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
  staticFactory: prefer static from() or parse() over direct new Constructor()
  errorHandling: throw at input boundaries; return undefined inside fluent chains
  helpersOutsideClass: define pure utility functions at module scope, not as class members
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

**Base unit pattern** — store the canonical value in one unit internally (e.g. grams for `Weight`, millimeters for `Meter`, bytes for `Bytes`) and convert on read. Expose a single `.total(unit)` method; do not add convenience getters.

**Static factory over constructor** — prefer `ClassName.from()` or `ClassName.parse()` for public construction. Keep the constructor private or accept only the already-validated canonical value. Overloads on the static factory handle strings, numbers, and objects:
```ts
Weight.from({ kilograms: 1, grams: 500 })
Weight.from(1500, "gram")
Weight.from("1.5kg")
```

**Conversion lookup table** — unit aliases and their conversion factors live in module-level `Record<string, number>` constants. A `resolveAlias()` helper normalises user input (case-insensitive, plurals, short codes) to canonical keys before looking up factors. Do not inline conversion math in method bodies.

**String parsing** — use a single regex to extract value + unit from user-supplied strings. Validate the numeric part with `isNaN`, then resolve the unit via the alias map. Throw a descriptive `Error` on mismatch.

**Helper functions outside the class** — pure utilities (`toGrams`, `parseUnit`, `resolveAlias`, `createValidatorPrimitiveType`) belong at module scope. Only behaviour intrinsic to the class instance belongs inside the class.

**Error handling** — throw `Error` at input boundaries (`from()`, `parse()`, constructors that accept raw user input). Inside fluent or chaining APIs (e.g. `pick`) return `undefined` instead of throwing so callers can use optional-chaining (`?.`) to short-circuit safely.

**Test runner** — always `bun:test`. Use `test.describe()` for grouping and `test()` for individual cases. Do not use `describe` or `it` as standalone imports.

```ts
import { test, expect, expectTypeOf } from "bun:test";

test.describe("Weight.from", () => {
  test("combines kilograms and grams", () => {
    expect(Weight.from({ kilograms: 1, grams: 500 }).total("grams")).toBe(1500);
  });
});
```

For type assertions use `Parameters<>` and `ReturnType<>` utilities when `.parameter()` is needed, since `bun:test`'s `expectTypeOf` does not support that method.

**No comments** — only add a comment when the reason is non-obvious (a hidden constraint, a subtle invariant, a workaround).

**Overloads** — public overloads are fine; keep the implementation signature private (not exported).

**Locale-aware formatting** — libs that format human-readable output implement `toLocaleString(locale?, options?)` wrapping `Intl.NumberFormat`. Do not hard-code number formatting.

**Disposable resources** — libs that own async resources implement `Symbol.asyncDispose` (and optionally `Symbol.dispose`) so callers can use the `await using` syntax. See `CleanupTasks` and `Queue` as reference.

**Namespace pattern** — when a function or class needs related helpers that are not instance methods, attach them as static properties or via a TypeScript `namespace` block (see `MeterFormatOptions`, `get.string`, `visit.getParent`).

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
