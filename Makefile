.PHONY: all
all: build

.PHONY: clean
clean:
	rm -rf libs/esm
	rm -rf libs/types

.PHONY: build
build: libs/esm libs/types update-package-json

libs/esm:
	bunx tsc --project tsconfig.esm.json --outDir libs/esm

libs/types:
	bunx tsc --project tsconfig.types.json --outDir libs/types

.PHONY: update-package-json
update-package-json:
	bun scripts/update-package.json.ts --write