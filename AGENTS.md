# Agent Instructions

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

## Conventions

- **Test runner**: `bun:test` (`import { describe, it, expect, expectTypeOf } from "bun:test"`).
- **Type assertions**: use `expectTypeOf` from `bun:test`; for `.parameter()` use `Parameters<>` / `ReturnType<>` utilities instead.
- **Base unit pattern**: store values in a canonical base unit (e.g. grams, millimeters) and convert on read.
- **No comments** unless the reason is non-obvious.
- **No convenience getters** — expose a single conversion method (e.g. `.total(unit)`).
- Overloads are fine; keep the implementation signature private.
