import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import fs from "node:fs";

/**
 * Options for configuring stdio streams.
 */
type StdioStreamOptions = {
  /** Standard output stream */
  stdout?: ReadableStream;
  /** Standard error stream */
  stderr?: ReadableStream;
};

/**
 * Configuration options for workspace instances.
 */
type WorkspaceOptions = {
  /** Working directory for the workspace */
  workingDirectory?: string | URL;
  /** Shell to use for command execution */
  shell?: string;
  /** Environment variables */
  env?: Record<string, string>;
  /** Timeout in milliseconds for command execution (if specified, creates AbortSignal.timeout) */
  timeout?: number;
};

/**
 * Configuration options for shell requests as an object.
 */
type ShellRequestObjectOptions = {
  /** Command to execute */
  command: string;
  /** Input stream to pipe to the command */
  stdin?: ReadableStream;
  /** Environment variables for the command */
  env?: Record<string, string>;
  /** Shell to use for execution */
  shell?: string;
  /** Working directory for the command */
  cwd?: string;
  /** AbortSignal to control command cancellation and timeout */
  signal?: AbortSignal;
};

/**
 * Union type for different ways to specify shell request options.
 * Can be a ShellRequest instance, a command string, or an options object.
 */
type ShellRequestOptions =
  | [ShellRequest]
  | [string]
  | [string, Omit<ShellRequestObjectOptions, "command">]
  | [ShellRequestObjectOptions];

/**
 * Parses and normalizes shell request options from various input formats.
 * @param args - The shell request options to parse
 * @returns Normalized shell request object options
 */
const parseArgumentsShellRequestOptions = (
  args: ShellRequestOptions,
): ShellRequestObjectOptions => {
  const [commandOrObjectOptions, objectOptions] = args;

  if (commandOrObjectOptions instanceof ShellRequest) {
    return {
      command: commandOrObjectOptions.command,
      stdin: commandOrObjectOptions.stdin,
      env: commandOrObjectOptions.env,
      shell: commandOrObjectOptions.shell,
      cwd: commandOrObjectOptions.cwd,
      signal: commandOrObjectOptions.signal,
    };
  }

  if (typeof commandOrObjectOptions === "string") {
    return {
      command: commandOrObjectOptions,
      stdin: objectOptions?.stdin,
      env: objectOptions?.env,
      shell: objectOptions?.shell,
      cwd: objectOptions?.cwd,
      signal: objectOptions?.signal,
    };
  }

  return {
    command: commandOrObjectOptions.command,
    stdin: commandOrObjectOptions.stdin,
    env: commandOrObjectOptions.env,
    shell: commandOrObjectOptions.shell,
    cwd: commandOrObjectOptions.cwd,
    signal: commandOrObjectOptions.signal,
  };
};

/**
 * Configuration options for shell responses as an object.
 */
type ShellResponseObjectOptions = {
  /** Standard I/O streams */
  stdio?: {
    /** Standard output stream */
    stdout?: ReadableStream;
    /** Standard error stream */
    stderr?: ReadableStream;
  };
  /** Promise that resolves to the process exit code */
  exitCode?: Promise<number>;
};

/**
 * Union type for different ways to specify shell response options.
 */
type ShellResponseOptions =
  | []
  | [ReadableStream | StdioStream]
  | [ReadableStream | StdioStream, ShellResponseObjectOptions]
  | [ShellResponseObjectOptions];

/**
 * Parses and normalizes shell response options from various input formats.
 * @param args - The shell response options to parse
 * @returns Normalized shell response object options
 */
const parseArgumentsShellResponseOptions = (
  args: ShellResponseOptions,
): ShellResponseObjectOptions => {
  const [streamOrOptions, objectOptions] = args;

  const atStderr = (object: unknown) =>
    typeof object === "object" &&
    object !== null &&
    "stdio" in object &&
    typeof object["stdio"] === "object" &&
    object["stdio"] !== null &&
    "stderr" in object["stdio"] &&
    object["stdio"]["stderr"] instanceof ReadableStream
      ? object["stdio"]["stderr"]
      : undefined;

  if (streamOrOptions instanceof ReadableStream) {
    return {
      stdio: {
        stdout: streamOrOptions,
        stderr: atStderr(objectOptions),
      },
      exitCode: objectOptions?.exitCode,
    };
  }

  if (streamOrOptions instanceof StdioStream) {
    return {
      stdio: {
        stdout: streamOrOptions.stdout,
        stderr: streamOrOptions.stderr,
      },
      exitCode: objectOptions?.exitCode,
    };
  }

  return {
    stdio: streamOrOptions?.stdio,
    exitCode: streamOrOptions?.exitCode,
  };
};

/**
 * Utility class for working with ReadableStream instances.
 * Provides convenient methods for reading and parsing stream data.
 */
export class ReadableTools {
  constructor(readonly readable: ReadableStream) {}

  /**
   * Reads the entire stream and returns it as a text string.
   * @returns Promise that resolves to the stream content as text
   */
  text = async (): Promise<string> => {
    const lines = await Array.fromAsync(ReadableTools.iterable(this.readable));
    return lines.join("");
  };

  /**
   * Reads the entire stream and parses it as JSON.
   * @returns Promise that resolves to the parsed JSON object
   */
  json = async (): Promise<any> => {
    return JSON.parse(await this.text());
  };

  /**
   * Creates an async iterable from a ReadableStream.
   * @param stream - The ReadableStream to iterate over
   * @returns Async generator that yields stream chunks
   */
  static async *iterable<T>(stream: ReadableStream<T>): AsyncGenerator<T> {
    const reader = stream.getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        yield value;
      }
    } finally {
      reader.releaseLock();
    }
  }
}

/**
 * Container for standard I/O streams (stdout and stderr).
 * Provides a unified interface for handling process output streams.
 */
export class StdioStream {
  /** Standard output stream */
  stdout?: ReadableStream;
  /** Standard error stream */
  stderr?: ReadableStream;

  constructor(options: StdioStreamOptions) {
    this.stdout = options.stdout;
    this.stderr = options.stderr;
  }
}

/**
 * Represents a shell command request with all necessary configuration.
 * Encapsulates command, input stream, environment variables, shell, working directory, and abort signal.
 */
export class ShellRequest {
  /** The command to execute */
  command: string;
  /** Input stream to pipe to the command */
  stdin?: ReadableStream;
  /** Environment variables for the command */
  env?: Record<string, string>;
  /** Shell to use for execution */
  shell?: string;
  /** Working directory for the command */
  cwd?: string;
  /** AbortSignal to control command cancellation and timeout */
  signal?: AbortSignal;

  /**
   * Creates a new ShellRequest instance.
   * @param options - Command string, options object, or other configuration formats
   */
  constructor(...options: ShellRequestOptions) {
    const { command, stdin, env, shell, cwd, signal } =
      parseArgumentsShellRequestOptions(options);
    this.command = command;
    this.stdin = stdin;
    this.env = env;
    this.shell = shell;
    this.cwd = cwd;
    this.signal = signal;
  }
}

/**
 * Represents the response from a shell command execution.
 * Provides access to stdout, stderr streams and the exit code.
 */
export class ShellResponse {
  /** Promise that resolves to the process exit code */
  exitCode: Promise<number>;

  /** Standard output stream with utility methods */
  stdout: ReadableTools;
  /** Standard error stream with utility methods */
  stderr: ReadableTools;

  /**
   * Creates a new ShellResponse instance.
   * @param options - Stream configurations and exit code promise
   */
  constructor(...options: ShellResponseOptions) {
    const { stdio, exitCode } = parseArgumentsShellResponseOptions(options);
    this.stdout = new ReadableTools(stdio?.stdout ?? new ReadableStream({}));
    this.stderr = new ReadableTools(stdio?.stderr ?? new ReadableStream({}));
    this.exitCode = exitCode ?? Promise.resolve(0);
  }

  /**
   * Enables verbose output by logging stdout and stderr to console.
   * Creates new streams that mirror the original streams while logging their content.
   * @returns This ShellResponse instance for method chaining
   */
  verbose() {
    let stdoutCtrl: ReadableStreamDefaultController<unknown>;
    let stderrCtrl: ReadableStreamDefaultController<unknown>;

    const stdoutReadable = new ReadableStream({
      start(controller) {
        stdoutCtrl = controller;
      },
    });

    const stderrReadable = new ReadableStream({
      start(controller) {
        stderrCtrl = controller;
      },
    });

    this.stdout.readable.pipeTo(
      new WritableStream({
        write(chunk) {
          console.log(`${new TextDecoder().decode(chunk)}`);
          stdoutCtrl.enqueue(chunk);
        },
        close() {
          stdoutCtrl.close();
        },
        abort(err) {
          stdoutCtrl.error(err);
        },
      }),
    );

    this.stderr.readable.pipeTo(
      new WritableStream({
        write(chunk) {
          console.error(`${new TextDecoder().decode(chunk)}`);
          stderrCtrl.enqueue(chunk);
        },
        close() {
          stderrCtrl.close();
        },
        abort(err) {
          stderrCtrl.error(err);
        },
      }),
    );

    this.stdout = new ReadableTools(stdoutReadable);
    this.stderr = new ReadableTools(stderrReadable);

    return this;
  }

  /**
   * Convenience method to get stdout content as text.
   * @returns Promise that resolves to stdout content as a string
   */
  text() {
    return this.stdout.text();
  }

  /**
   * Convenience method to parse stdout content as JSON.
   * @returns Promise that resolves to parsed JSON from stdout
   */
  json() {
    return this.stdout.json();
  }
}

/**
 * Executes a shell command and returns a ShellResponse.
 * This is the core function for running shell commands with full control over streams and environment.
 * @param requestOptions - Command string, options object, or other configuration formats
 * @returns ShellResponse instance containing stdout, stderr streams and exit code
 */
export const shell = (
  ...requestOptions: ShellRequestOptions
): ShellResponse => {
  const shellRequest = new ShellRequest(...requestOptions); // validate request options

  const exitCode = Promise.withResolvers<number>();
  let stdoutCtrl: ReadableStreamDefaultController<unknown>;
  let stderrCtrl: ReadableStreamDefaultController<unknown>;

  const stdoutReadable = new ReadableStream<unknown>({
    start(controller) {
      stdoutCtrl = controller;
    },
  });

  const stderrReadable = new ReadableStream<unknown>({
    start(controller) {
      stderrCtrl = controller;
    },
  });

  const p = spawn(
    shellRequest.shell ?? "/bin/sh",
    ["-c", shellRequest.command],
    {
      cwd: shellRequest.cwd,
      env: shellRequest.env ?? process.env,
      stdio: ["overlapped", "pipe", "pipe"],
      signal: shellRequest.signal,
    },
  );

  if (shellRequest.stdin) {
    shellRequest.stdin.pipeTo(
      new WritableStream({
        write(chunk) {
          p.stdin.write(chunk);
        },
        close() {
          p.stdin.end();
        },
        abort(err) {
          p.stdin.destroy(err);
        },
      }),
    );
  }

  p.stdout.addListener("data", (data) => {
    stdoutCtrl.enqueue(data);
  });

  p.stderr.addListener("data", (data) => {
    stderrCtrl.enqueue(data);
  });

  p.stdout.addListener("end", () => {
    stdoutCtrl.close();
  });

  p.stderr.addListener("end", () => {
    stderrCtrl.close();
  });

  p.addListener("exit", (code) => {
    exitCode.resolve(code ?? 0);
  });

  return new ShellResponse({
    stdio: {
      stdout: stdoutReadable,
      stderr: stderrReadable,
    },
    exitCode: exitCode.promise,
  });
};

/**
 * A workspace provides a managed environment for executing shell commands.
 * It maintains default settings for working directory, shell, environment variables, and timeout.
 * All commands executed through the workspace inherit these defaults unless overridden.
 */
export class Workspace {
  /** Default configuration applied to all commands */
  default: {
    /** Default working directory as a file URL */
    workingDirectory: URL;
    /** Default shell for command execution */
    shell: string;
    /** Default environment variables */
    env?: Record<string, string>;
    /** Default timeout in milliseconds for command execution */
    timeout?: number;
  };

  /**
   * Creates a new Workspace instance.
   * @param options - Configuration options for the workspace
   * @throws {Error} When workingDirectory is not provided or invalid
   */
  constructor(options?: WorkspaceOptions) {
    const workingDirectory = options?.workingDirectory;

    if (
      !workingDirectory ||
      !URL.canParse(workingDirectory.toString(), "file:")
    ) {
      throw new Error("A valid working directory must be provided.");
    }

    this.default = {
      workingDirectory: new URL(workingDirectory.toString(), "file:"),
      shell: options?.shell ?? "/bin/sh",
      env: options?.env,
      timeout: options?.timeout,
    };
  }

  /**
   * Executes a shell command within this workspace context.
   * Inherits workspace defaults for working directory, shell, environment variables, and timeout.
   * If a timeout is configured, an AbortSignal.timeout is automatically created and applied.
   * @param requestOptions - Command string, options object, or other configuration formats
   * @returns ShellResponse instance containing stdout, stderr streams and exit code
   */
  run(...requestOptions: ShellRequestOptions): ShellResponse {
    const shellRequest = new ShellRequest(...requestOptions); // validate request options
    shellRequest.cwd ??= this.default.workingDirectory.pathname;
    shellRequest.shell ??= this.default.shell;
    shellRequest.env ??= this.default.env;
    if (this.default.timeout) {
      shellRequest.signal = AbortSignal.timeout(this.default.timeout);
    }
    return shell(shellRequest);
  }

  /**
   * Creates a temporary workspace in the system's temporary directory.
   * The directory is automatically created with a unique name based on timestamp and random values.
   * @param options - Configuration options excluding working directory (automatically generated)
   * @returns New Workspace instance pointing to the temporary directory
   */
  static mktmp(
    options?: Omit<WorkspaceOptions, "workingDirectory">,
  ): Workspace {
    const tmp = new URL(
      `file://${tmpdir()}/workspace-${Date.now().toString(36)}${Math.floor(Math.random() * 1e8).toString(36)}/`,
    );

    fs.mkdirSync(tmp.pathname, { recursive: true });

    return new Workspace({
      workingDirectory: tmp,
      ...options,
    });
  }
}
