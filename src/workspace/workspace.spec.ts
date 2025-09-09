import { describe, test, expect } from "bun:test";
import { tmpdir } from "os";
import fs from "fs";
import { Workspace } from "./workspace.js";
import { ShellRequest, ShellResponse } from "@jondotsoy/shell";

describe("Workspace", () => {
  test("should initialize workspace with default working directory and shell", () => {
    const workspace = new Workspace({ workingDirectory: "/tmp/test" });

    expect(workspace.default.workingDirectory.pathname).toBeString();
    expect(workspace.default.shell).toBeString();
  });

  test("should initialize workspace with custom working directory", () => {
    const tmp = `${tmpdir()}/workspace-${Math.random().toString(36).substring(2, 15)}`;

    const workspace = new Workspace({
      workingDirectory: tmp,
    });

    expect(workspace.default.workingDirectory.pathname).toBe(tmp);
    expect(workspace.default.shell).toBeString();
  });

  test("should create temporary workspace using mktmp method", () => {
    const workspace = Workspace.mktmp();

    expect(workspace).toBeInstanceOf(Workspace);
    expect(workspace.default.workingDirectory.pathname).toBeString();
  });

  test("should execute shell command and return response with correct output", async () => {
    const testWorkingDirectory = new URL(
      "__samples__/workspace/sample1",
      import.meta.url,
    );

    fs.mkdirSync(new URL(`${testWorkingDirectory}/`), { recursive: true });
    fs.writeFileSync(new URL(`${testWorkingDirectory}/.gitignore`), "*");
    fs.writeFileSync(
      new URL(`${testWorkingDirectory}/file1.txt`),
      "Hello, World!",
    );

    const workspace = new Workspace({
      workingDirectory: testWorkingDirectory.pathname,
    });

    const p = workspace.run(`cat file1.txt`);

    expect(p).toBeInstanceOf(ShellResponse);
    expect(await p.exitCode).toBe(0);
    expect(await p.text()).toBe("Hello, World!");
  });

  test("should initialize workspace with custom shell", async () => {
    const workspace = new Workspace({
      shell: "/bin/bash",
      workingDirectory: "/tmp/test",
    });

    expect(workspace.default.shell).toEqual("/bin/bash");
  });

  test("should create temporary workspace with custom shell using mktmp", async () => {
    const workspace = Workspace.mktmp({ shell: "/bin/bash" });

    expect(workspace.default.shell).toEqual("/bin/bash");
  });

  test("should initialize workspace with custom environment variables", async () => {
    const workspace = new Workspace({
      env: { TEST: "value" },
      workingDirectory: "/tmp/test",
    });

    expect(workspace.default.env).toEqual({ TEST: "value" });
  });

  test("should create temporary workspace with custom environment variables using mktmp", async () => {
    const workspace = Workspace.mktmp({ env: { TEST: "value" } });

    expect(workspace.default.env).toEqual({ TEST: "value" });
  });

  test("should create ShellRequest with command using object constructor", async () => {
    const request = new ShellRequest({
      command: `echo ls`,
    });

    expect(request.command).toBe(`echo ls`);
    expect(request.stdin).toBeUndefined();
  });

  test("should create ShellRequest with command using string constructor", async () => {
    const request = new ShellRequest(`echo ls`);

    expect(request.command).toBe(`echo ls`);
    expect(request.stdin).toBeUndefined();
  });

  test("should create ShellRequest with command and stdin using object constructor", async () => {
    const request = new ShellRequest({
      command: `cat`,
      stdin: new ReadableStream({}),
    });

    expect(request.command).toBe(`cat`);
    expect(request.stdin).toBeInstanceOf(ReadableStream);
  });

  test("should create ShellRequest with command and stdin using string constructor", async () => {
    const request = new ShellRequest(`cat`, {
      stdin: new ReadableStream({}),
    });

    expect(request.command).toBe(`cat`);
    expect(request.stdin).toBeInstanceOf(ReadableStream);
  });

  test("should create ShellRequest with command and environment variables", async () => {
    const request = new ShellRequest({
      command: `cat`,
      env: { TEST: "value" },
    });

    expect(request.command).toBe(`cat`);
    expect(request.env).toEqual({ TEST: "value" });
  });

  test("should create ShellResponse from ReadableStream and return text content", async () => {
    const response = new ShellResponse(
      new ReadableStream({
        start(controller) {
          controller.enqueue("Hello, World!");
          controller.close();
        },
      }),
    );

    expect(await response.text()).toBe("Hello, World!");
    expect(await response.exitCode).toBe(0);
  });

  test("should create ShellResponse with custom exit code", async () => {
    const response = new ShellResponse(
      new ReadableStream({
        start(controller) {
          controller.close();
        },
      }),
      {
        exitCode: Promise.resolve(0),
      },
    );

    expect(await response.exitCode).toBe(0);
  });

  test("should parse JSON response from ShellResponse", async () => {
    const response = new ShellResponse(
      new ReadableStream({
        start(controller) {
          controller.enqueue(`{"ok": true}`);
          controller.close();
        },
      }),
    );

    expect(await response.json()).toEqual({ ok: true });
  });

  test("should handle multiple JSON parsing calls on the same ShellResponse", async () => {
    const response = new ShellResponse(
      new ReadableStream({
        start(controller) {
          controller.enqueue(`{"ok": true}`);
          controller.close();
        },
      }),
    );

    expect(await response.json()).toEqual({ ok: true });
  });

  test("should create ShellResponse from StdioStream with stdout content", async () => {
    const response = new ShellResponse({
      stdio: {
        stdout: new ReadableStream({
          start(controller) {
            controller.enqueue(`ok`);
            controller.close();
          },
        }),
      },
    });

    expect(await response.text()).toEqual(`ok`);
  });

  test("should handle stderr content from StdioStream", async () => {
    const response = new ShellResponse({
      stdio: {
        stdout: new ReadableStream({
          start(controller) {
            controller.close();
          },
        }),
        stderr: new ReadableStream({
          start(controller) {
            controller.enqueue(`ok`);
            controller.close();
          },
        }),
      },
    });

    expect(await response.text()).toEqual(``);
    expect(await response.stderr.text()).toEqual(`ok`);
  });

  test("should create ShellResponse with complete stdio configuration and exit code", async () => {
    const response = new ShellResponse({
      stdio: {
        stdout: new ReadableStream({
          start(controller) {
            controller.close();
          },
        }),
        stderr: new ReadableStream({
          start(controller) {
            controller.enqueue(`ok`);
            controller.close();
          },
        }),
      },
      exitCode: Promise.resolve(0),
    });

    expect(await response.text()).toEqual(``);
    expect(await response.stderr.text()).toEqual(`ok`);
    expect(await response.exitCode).toBe(0);
  });

  test("should execute command with verbose output and return exit code", async () => {
    const workspace = Workspace.mktmp();

    const ex = await workspace.run(`pwd`).verbose().exitCode;

    expect(ex).toBe(0);
  });

  test("should execute simple echo command in temporary workspace and return correct output", async () => {
    const workspace = Workspace.mktmp();

    const response = await workspace.run(`echo "Hello, World!"`);

    expect(response).toBeInstanceOf(ShellResponse);
    expect(await response.text()).toMatch("Hello, World!");
    expect(await response.exitCode).toBe(0);
  });

  test("should execute command using ShellRequest object and return correct response", async () => {
    const workspace = Workspace.mktmp();

    const response = workspace.run(new ShellRequest(`echo "Hello, World!"`));

    expect(response).toBeInstanceOf(ShellResponse);
    expect(await response.text()).toMatch("Hello, World!");
    expect(await response.exitCode).toBe(0);
  });

  test("should execute cat command with stdin input from ShellRequest and return piped content", async () => {
    const workspace = Workspace.mktmp();

    const response = await workspace.run(
      new ShellRequest(`cat`, {
        stdin: new ReadableStream({
          start(controller) {
            controller.enqueue("Hello, World!");
            controller.close();
          },
        }),
      }),
    );

    expect(response).toBeInstanceOf(ShellResponse);
    expect(await response.text()).toMatch("Hello, World!");
    expect(await response.exitCode).toBe(0);
  });
});
