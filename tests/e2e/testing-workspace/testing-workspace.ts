import fs from "fs/promises";
import { URL } from "url";
import { shell, Workspace } from "../../../src/workspace/workspace.js";

const id = () => {
  const now = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `${now.toString(32)}${random.toString(32)}`;
};

export class TestingWorkspace {
  constructor(
    readonly id: string,
    readonly workspace: Workspace,
  ) {}

  async run(cmd: string) {
    const p = this.workspace
      .run({
        command: cmd,
      })
      .verbose();
    const exitCode = await p.exitCode;

    if (exitCode !== 0) {
      const err = new Error(
        `Command "${cmd}" failed with exit code ${exitCode}`,
      );
      Error.captureStackTrace(err, this.run);
      throw err;
    }

    return p;
  }

  async file(name: string, content: string) {
    const fileUrl = new URL(name, this.workspace.default.workingDirectory);
    await fs.mkdir(new URL("./", fileUrl), { recursive: true });
    await fs.writeFile(fileUrl, content);
    return fileUrl;
  }

  async close() {
    await shell(`rm -rf "${this.workspace.default.workingDirectory.pathname}"`)
      .exitCode;
  }

  async [Symbol.asyncDispose]() {
    this.close();
  }

  static async init(): Promise<TestingWorkspace> {
    const workspace = Workspace.mktmp();
    const workflowId = id();
    return new TestingWorkspace(workflowId, workspace);
  }
}
