build: build-esm build-types update-package-json

build-esm:
	bunx tsc --project tsconfig.esm.json --outDir libs/esm

build-types:
	bunx tsc --project tsconfig.types.json --outDir libs/types

update-package-json:
	bun scripts/update-package.json.ts --write