import { describe, test, beforeAll, afterAll } from "bun:test";
import { TestingWorkspace } from "./testing-workspace/testing-workspace.js";
import { tmpdir } from "os";
import { shell } from "@jondotsoy/shell";

const projectRoot = new URL("../../", import.meta.url);
const packFile = new URL(`file:${tmpdir()}/utils-js-pack.tgz`);

const nodeVersions = [
  "16.4.1", // Minimun supported version
  "22.19.0", // Current LTS
  "24.7.0", // Current version
];

const denoVersions = [
  "2.4.5", // Current version
];

const bunVersions = [
  "1.2.21", // Current version
];

beforeAll(async () => {
  const exitCode = await shell(
    `
      cd $PROJECT_ROOT

      asdf set nodejs 24.7.0

      packageName=\$(cat "package.json" | jq -r .name)
      packageVersion=\$(cat "package.json" | jq -r .version)
      tarballName="jondotsoy-utils-js-\$packageVersion.tgz"

      [ -f "\$tarballName" ] || npm pack

      cp "\$tarballName" "$PACK_FILE"

      echo "Pack file created at $PACK_FILE"
    `,
    {
      env: {
        ...process.env,
        PROJECT_ROOT: projectRoot.pathname,
        PACK_FILE: packFile.pathname,
      },
    },
  ).verbose().exitCode;

  if (exitCode !== 0) {
    throw new Error(`Failed to create pack file at ${packFile}`);
  }
});

for (const nodeVersion of nodeVersions) {
  describe(`Node.js ${nodeVersion} compatibility tests`, () => {
    let workspace: TestingWorkspace;

    beforeAll(async () => {
      workspace = await TestingWorkspace.init();

      await workspace.file(".tool-versions", `nodejs ${nodeVersion}\n`);

      await workspace.run(`node -v`);

      await workspace.file(
        `package.json`,
        JSON.stringify({
          private: true,
          type: "module",
        }),
      );

      await workspace.run(`
        cp ${packFile.pathname} "pack.tgz"
        npm install "pack.tgz"
      `);
    });

    afterAll(async () => {
      await workspace.close();
    });

    test(`should import and use queue module on Node.js ${nodeVersion}`, async () => {
      await workspace.file(
        `queue.js`,
        `
          import * as m from "@jondotsoy/utils-js/queue"
          console.log(m)
        `,
      );

      await workspace.run(`
        node queue.js
      `);
    });

    test(`should import and use workspace module on Node.js ${nodeVersion}`, async () => {
      await workspace.file(
        `workspace.js`,
        `
          import * as m from "@jondotsoy/utils-js/workspace"
          console.log(m)
        `,
      );

      await workspace.run(`
        node workspace.js
      `);
    });
  });
}

for (const denoVersion of denoVersions) {
  describe(`Deno ${denoVersion} compatibility tests`, () => {
    let workspace: TestingWorkspace;
    const unpackDir = new URL(`file:${tmpdir()}/deno-${denoVersion}/`);

    beforeAll(async () => {
      workspace = await TestingWorkspace.init();

      await shell(`
        mkdir -p ${unpackDir.pathname}
        tar -xzf ${packFile.pathname} -C ${unpackDir.pathname} --strip-components=1
      `).exitCode;

      await workspace.file(".tool-versions", `deno ${denoVersion}\n`);
      await workspace.run(`asdf set deno ${denoVersion}`);

      await workspace.run(`deno install npm:@jondotsoy/shell`);
      await workspace.run(`deno -v`);
    });

    afterAll(async () => {
      await workspace.close();
    });

    test(`should import and use workspace module on Deno ${denoVersion}`, async () => {
      await workspace.file(
        `workspace.js`,
        `
          import * as m from "${unpackDir.pathname}/libs/esm/workspace/workspace.js"
          console.log(m)
        `,
      );

      await workspace.run(`
        deno run -r --allow-import workspace.js
      `);
    });
  });
}

for (const bunVersion of bunVersions) {
  describe(`Bun ${bunVersion} compatibility tests`, () => {
    let workspace: TestingWorkspace;

    beforeAll(async () => {
      workspace = await TestingWorkspace.init();

      await workspace.file(".tool-versions", `bun ${bunVersion}\n`);

      await workspace.run(`bun -v`);

      await workspace.file(
        `package.json`,
        JSON.stringify({
          private: true,
          type: "module",
        }),
      );

      await workspace.run(`
        cp ${packFile.pathname} "pack.tgz"
        bun install "pack.tgz"
      `);
    });

    afterAll(async () => {
      await workspace.close();
    });

    test(`should import and use workspace module on Bun ${bunVersion}`, async () => {
      await workspace.file(
        `workspace.js`,
        `
          import * as m from "@jondotsoy/utils-js/workspace"
          console.log(m)
        `,
      );

      await workspace.run(`
        bun run workspace.js
      `);
    });
  });
}
