import { tmpdir } from "node:os";
import fs from "node:fs";
import { shell, ShellRequest, ShellResponse } from "@jondotsoy/shell";

type ShellResponseParameters = ConstructorParameters<typeof ShellResponse>;
type ShellRequestParameters = ConstructorParameters<typeof ShellRequest>;

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
  run(...requestOptions: ShellRequestParameters): ShellResponse {
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
