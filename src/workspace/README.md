# Workspace Module

The Workspace module provides a managed environment for executing shell commands in Node.js applications. It builds on top of the `@jondotsoy/shell` package to offer a workspace-centric approach to command execution with default configurations for working directories, shell types, environment variables, and timeouts.

## Why This Module Exists

Traditional Node.js approaches to shell command execution often fall short when dealing with multiple related commands that need to be executed in a specific context or with consistent configuration. While `child_process.exec()` and similar APIs work for simple cases, they become cumbersome when you need to:

- Execute multiple commands in the same working directory
- Maintain consistent environment variables across commands
- Apply default timeouts to all commands in a workspace
- Create temporary workspaces for isolated operations

This module was created to provide a workspace-centric approach to shell command execution. It enables developers to define a context once and execute multiple commands within that context, ensuring consistency and reducing configuration repetition. Whether you're building development tools, CI/CD pipelines, or applications that need to interact with system commands in a structured way, this module provides the organization and reliability you need.

## Table of Contents

- [Why This Module Exists](#why-this-module-exists)
- [Overview](#overview)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Advanced Usage](#advanced-usage)

## Overview

The workspace module consists of several key components:

- **`Workspace`** - Main class providing a managed environment for command execution
- **Shell Integration** - Built on `@jondotsoy/shell` for `shell()`, `ShellRequest`, `ShellResponse` functionality
- **Timeout Support** - Automatic timeout handling via `AbortSignal.timeout()`
- **Temporary Workspaces** - Easy creation of isolated temporary directories

## Quick Start

### Using Workspace for Command Execution

```typescript
import { Workspace } from "./workspace.js";

// Create a workspace in a specific directory
const workspace = new Workspace({
  workingDirectory: "/path/to/project",
  shell: "/bin/bash",
});

// Execute commands in the workspace context
const response1 = workspace.run("pwd");
const response2 = workspace.run("ls -la");

console.log(await response1.text()); // /path/to/project
```

### Basic Command Execution with Shell Integration

```typescript
import { shell } from "@jondotsoy/shell";

// Simple command execution (direct shell usage)
const response = shell('echo "Hello World"');
const output = await response.text();
console.log(output); // "Hello World"
```

### Using Workspace with Timeout

```typescript
import { Workspace } from "./workspace.js";

// Create a workspace with a 5-second timeout
const workspace = new Workspace({
  workingDirectory: "/path/to/project",
  shell: "/bin/bash",
  timeout: Temporal.Duration.from({ seconds: 5 }).total("milliseconds"),
});

// All commands in this workspace will timeout after 5 seconds
const response = workspace.run("sleep 10"); // Will be aborted after 5 seconds
```

### Temporary Workspace

```typescript
import { Workspace } from "./workspace.js";

// Create a temporary workspace
const tmpWorkspace = Workspace.mktmp();
const response = tmpWorkspace.run('echo "Working in temp dir" > test.txt');
await response.exitCode; // Wait for command completion
```

## API Reference

### Import Statement

```typescript
import { Workspace } from "@jondotsoy/utils-js/workspace";
// or for both workspace and direct shell access
import { shell, Workspace } from "@jondotsoy/utils-js/workspace";

// For local development
import { Workspace } from "./workspace.js";
// or
import { shell, Workspace } from "./workspace.js";
```

### Shell Integration

The Workspace module builds on the `@jondotsoy/shell` package and re-exports the `shell` function for convenience. You can import shell commands in two ways:

```typescript
// Option 1: Import from workspace module (recommended for workspace-based projects)
import { shell, Workspace } from "@jondotsoy/utils-js/workspace";

// Option 2: Import directly from shell package (for standalone shell usage)
import { shell, ShellRequest, ShellResponse } from "@jondotsoy/shell";
```

### `shell(command, options?)`

_Note: This function is provided by `@jondotsoy/shell`, not directly by the workspace module._

Executes a shell command and returns a `ShellResponse`.

**Parameters:**

- `command` (string) - Command to execute
- `options` (object, optional) - Additional configuration
  - `stdin` (ReadableStream, optional) - Input stream to pipe to the command
  - `env` (Record<string, string>, optional) - Environment variables for the command
  - `shell` (string, optional) - Shell to use for execution
  - `cwd` (string, optional) - Working directory for the command
  - `signal` (AbortSignal, optional) - Signal to abort the command execution

**Returns:** `ShellResponse`

### `Workspace`

### Constructor

Creates a new Workspace instance with specified configuration.

```typescript
new Workspace(options?: WorkspaceOptions)
```

**Options (WorkspaceOptions):**

- `workingDirectory` (string | URL, **required**) - Working directory for commands. Must be a valid path that can be parsed as a file URL.
- `shell` (string, optional) - Shell to use for command execution (default: '/bin/sh')
- `env` (Record<string, string>, optional) - Environment variables to apply to all commands
- `timeout` (number, optional) - Timeout in milliseconds for command execution. If specified, creates `AbortSignal.timeout()` automatically for all commands.

**Throws:**

- `Error` - When `workingDirectory` is not provided or cannot be parsed as a valid file URL

**Example:**

```typescript
const workspace = new Workspace({
  workingDirectory: "/path/to/project",
  shell: "/bin/bash",
  env: { NODE_ENV: "development" },
  timeout: Temporal.Duration.from({ seconds: 30 }).total("milliseconds"),
});
```

#### Methods

##### `run(...requestOptions)`

Executes a shell command within the workspace context. Inherits all workspace defaults (working directory, shell, environment variables, and timeout) unless explicitly overridden in the command options.

**Parameters:**

- `...requestOptions` (ShellRequestParameters) - Command options in any format accepted by `ShellRequest` constructor

**Returns:**

- `ShellResponse` - Response object with stdout/stderr streams and exit code promise

**Behavior:**

- Applies workspace's `workingDirectory` as default `cwd`
- Applies workspace's `shell` as default shell
- Applies workspace's `env` as default environment variables
- If workspace has `timeout` configured, automatically creates `AbortSignal.timeout()` and applies it

**Example:**

```typescript
const workspace = new Workspace({
  workingDirectory: "/project",
  timeout: Temporal.Duration.from({ seconds: 5 }).total("milliseconds"),
});

// All these inherit workspace defaults
const response1 = workspace.run("npm test");
const response2 = workspace.run("git status", { env: { GIT_PAGER: "cat" } });
const response3 = workspace.run({ command: "ls -la" });
```

##### `static mktmp(options?)`

Creates a temporary workspace in the system's temporary directory. The directory is automatically created with a unique name based on timestamp and random values.

**Parameters:**

- `options` (Omit<WorkspaceOptions, "workingDirectory">, optional) - Configuration options excluding working directory (automatically generated)

**Returns:**

- `Workspace` - New Workspace instance pointing to the created temporary directory

**Directory Naming:**

- Format: `workspace-{timestamp}{random}`
- Location: System temp directory (`os.tmpdir()`)
- Automatically created with `recursive: true`

**Example:**

```typescript
const tmpWorkspace = Workspace.mktmp({
  shell: "/bin/bash",
  timeout: Temporal.Duration.from({ seconds: 10 }).total("milliseconds"),
});

const response = tmpWorkspace.run('echo "Working in temp: $(pwd)"');
console.log(await response.text());
// Output: Working in temp: /tmp/workspace-xyz123abc/
```

### `ShellResponse`

_Note: This class is provided by `@jondotsoy/shell` package._

Represents the result of command execution.

#### Properties

- `exitCode` (Promise<number>) - Promise resolving to exit code
- `stdout` (ReadableTools) - Standard output stream
- `stderr` (ReadableTools) - Standard error stream

#### Methods

##### `text()`

Returns stdout content as text.

```typescript
const output = await response.text();
```

##### `json()`

Parses stdout content as JSON.

```typescript
const data = await response.json();
```

##### `verbose()`

Enables console logging of stdout/stderr while preserving streams.

```typescript
const response = workspace.run("npm install").verbose();
```

### `ReadableTools`

_Note: This utility class is provided by `@jondotsoy/shell` package._

Utility class for working with ReadableStream instances.

#### Methods

##### `text()`

Reads entire stream as text.

##### `json()`

Reads and parses stream as JSON.

##### `static iterable(stream)`

Creates an async iterable from a ReadableStream.

## Examples

### Working with Workspace and Shell Integration

```typescript
import { shell, Workspace } from "@jondotsoy/utils-js/workspace";

// Direct shell execution
const directResponse = shell("echo 'Direct command'");

// Workspace-managed execution
const workspace = new Workspace({
  workingDirectory: "/project",
  timeout: Temporal.Duration.from({ seconds: 5 }).total("milliseconds"),
});

const workspaceResponse = workspace.run("echo 'Workspace command'");

// Both return the same ShellResponse type
console.log(await directResponse.text());
console.log(await workspaceResponse.text());
```

### Command with Timeout and Signal

```typescript
import { shell } from "@jondotsoy/shell";

// Using AbortSignal for manual control
const controller = new AbortController();
const response = shell("long-running-command", {
  signal: controller.signal,
});

// Cancel the command after 3 seconds
setTimeout(() => controller.abort(), Temporal.Duration.from({ seconds: 3 }).total("milliseconds"));

try {
  const output = await response.text();
  console.log(output);
} catch (error) {
  if (error.name === "AbortError") {
    console.log("Command was cancelled");
  }
}
```

### Workspace-level Timeout

```typescript
import { Workspace } from "@jondotsoy/utils-js/workspace";

// All commands automatically get 10-second timeout
const workspace = new Workspace({
  workingDirectory: "/project",
  timeout: Temporal.Duration.from({ seconds: 10 }).total("milliseconds"),
});

const response = workspace.run("long-running-command");
// Will automatically timeout after 10 seconds with AbortError
```

### Command with Custom Environment

```typescript
import { shell } from "@jondotsoy/shell";

const response = shell("echo $MY_VAR", {
  env: { MY_VAR: "Hello from env!" },
});

const output = await response.text();
console.log(output); // "Hello from env!"
```

### Handling Command Errors

```typescript
import { Workspace } from "@jondotsoy/utils-js/workspace";

const workspace = new Workspace({ workingDirectory: "/project" });
const response = workspace.run("nonexistent-command");

try {
  const exitCode = await response.exitCode;
  if (exitCode !== 0) {
    const errorOutput = await response.stderr.text();
    console.error("Command failed:", errorOutput);
  }
} catch (error) {
  console.error("Execution error:", error);
}
```

### Streaming Command Output

```typescript
import { shell, ReadableTools } from "@jondotsoy/shell";

const response = shell('find /large/directory -name "*.js"');

// Process output as it arrives
for await (const chunk of ReadableTools.iterable(response.stdout.stream)) {
  const text = new TextDecoder().decode(chunk);
  console.log("Found:", text.trim());
}
```

### Piping Input to Command

```typescript
import { shell } from "@jondotsoy/shell";

const input = new ReadableStream({
  start(controller) {
    controller.enqueue(new TextEncoder().encode("line 1\n"));
    controller.enqueue(new TextEncoder().encode("line 2\n"));
    controller.close();
  },
});

const response = shell("wc -l", { stdin: input });
const count = await response.text();
console.log("Line count:", count.trim()); // "2"
```

### Working with Different Shells

```typescript
// Using zsh
const workspace = new Workspace({
  workingDirectory: "/Users/username",
  shell: "/bin/zsh",
});

const response = workspace.run("echo $SHELL");
console.log(await response.text()); // "/bin/zsh"
```

### Workspace with Timeout Configuration

```typescript
// Create workspace with default timeout
const workspace = new Workspace({
  workingDirectory: "/path/to/project",
  timeout: Temporal.Duration.from({ seconds: 10 }).total("milliseconds"),
});

// This command will automatically timeout after 10 seconds
const response = workspace.run("npm install");

try {
  await response.exitCode;
  console.log("Installation completed");
} catch (error) {
  if (error.name === "AbortError") {
    console.log("Installation timed out after 10 seconds");
  }
}
```

### Batch Operations in Workspace

```typescript
const workspace = new Workspace({
  workingDirectory: "/path/to/project",
});

// Multiple related commands
const commands = ["git status", "npm test", "npm run build"];

for (const command of commands) {
  console.log(`Running: ${command}`);
  const response = workspace.run(command).verbose();
  const exitCode = await response.exitCode;

  if (exitCode !== 0) {
    console.error(`Command failed with exit code ${exitCode}`);
    break;
  }
}
```

### JSON Processing

```typescript
import { Workspace } from "@jondotsoy/utils-js/workspace";

const workspace = new Workspace({ workingDirectory: "/project" });
const response = workspace.run("npm list --json --depth=0");
const packageInfo = await response.json();

console.log("Dependencies:", Object.keys(packageInfo.dependencies || {}));
```

## Advanced Usage

### Workspace Constructor Validation

```typescript
import { Workspace } from "@jondotsoy/utils-js/workspace";

try {
  // This will throw an error
  const workspace = new Workspace({
    workingDirectory: undefined, // Required parameter missing
  });
} catch (error) {
  console.error(error.message); // "A valid working directory must be provided."
}

try {
  // This will throw an error
  const workspace = new Workspace({
    workingDirectory: "invalid-url", // Invalid URL format
  });
} catch (error) {
  console.error(error.message); // "A valid working directory must be provided."
}

// Valid usage
const workspace = new Workspace({
  workingDirectory: "/valid/path",
});
```

### Timeout and Signal Handling

```typescript
import { shell, ShellRequest } from "@jondotsoy/shell";

// Create a request with custom timeout
const signal = AbortSignal.timeout(Temporal.Duration.from({ seconds: 5 }).total("milliseconds"));
const request = new ShellRequest("complex-command", {
  cwd: "/specific/directory",
  env: { NODE_ENV: "production" },
  shell: "/bin/bash",
  signal: signal,
});

const response = shell(request);

try {
  const result = await response.text();
  console.log("Command completed:", result);
} catch (error) {
  if (error.name === "AbortError") {
    console.log("Command timed out");
  }
}
```

### Custom Shell Request Configuration

```typescript
import { shell, ShellRequest } from "@jondotsoy/shell";

const request = new ShellRequest("complex-command", {
  cwd: "/specific/directory",
  env: { NODE_ENV: "production" },
  shell: "/bin/bash",
});

const response = shell(request);
```

### Workspace vs Direct Shell Usage

```typescript
import { Workspace } from "@jondotsoy/utils-js/workspace";
import { shell } from "@jondotsoy/shell";

// Direct shell usage - configure each command
const response1 = shell("npm test", {
  cwd: "/project",
  shell: "/bin/bash",
  env: { NODE_ENV: "test" },
});

const response2 = shell("npm build", {
  cwd: "/project",
  shell: "/bin/bash",
  env: { NODE_ENV: "production" },
});

// Workspace usage - configure once, inherit everywhere
const workspace = new Workspace({
  workingDirectory: "/project",
  shell: "/bin/bash",
  env: { CI: "true" },
});

const response3 = workspace.run("npm test", {
  env: { NODE_ENV: "test" }, // Merges with workspace env
});
const response4 = workspace.run("npm build", {
  env: { NODE_ENV: "production" }, // Merges with workspace env
});
```

### Timeout Handling

Commands can be configured with timeouts in several ways:

1. **Workspace-level timeout**: All commands inherit the workspace timeout
2. **AbortSignal.timeout()**: Create a signal with specific timeout
3. **Manual AbortController**: Programmatic control over cancellation

```typescript
// Method 1: Workspace timeout
const workspace = new Workspace({ timeout: Temporal.Duration.from({ seconds: 30 }).total("milliseconds") });

// Method 2: AbortSignal timeout
const response = shell("command", { signal: AbortSignal.timeout(Temporal.Duration.from({ seconds: 10 }).total("milliseconds")) });

// Method 3: Manual control
const controller = new AbortController();
const response2 = shell("command", { signal: controller.signal });
setTimeout(() => controller.abort(), Temporal.Duration.from({ seconds: 5 }).total("milliseconds"));
```

### Error Handling Best Practices

```typescript
import { Workspace } from "@jondotsoy/utils-js/workspace";

async function safeExecute(command: string, timeout?: number) {
  try {
    const workspace = new Workspace({
      workingDirectory: "/project",
      timeout: timeout,
    });

    const response = workspace.run(command);
    const exitCode = await response.exitCode;

    if (exitCode === 0) {
      return {
        success: true,
        output: await response.text(),
        error: null,
      };
    } else {
      return {
        success: false,
        output: await response.stdout.text(),
        error: await response.stderr.text(),
      };
    }
  } catch (error) {
    return {
      success: false,
      output: null,
      error: error.name === "AbortError" ? "Command timed out" : error.message,
    };
  }
}
```

## Type Safety

The module is fully typed with TypeScript, providing excellent IDE support and compile-time error checking:

```typescript
import { Workspace } from "@jondotsoy/utils-js/workspace";
import type { ShellResponse } from "@jondotsoy/shell";

// Types are automatically inferred
const workspace: Workspace = new Workspace({ workingDirectory: "/project" });
const response: ShellResponse = workspace.run("echo test");
const output: Promise<string> = response.text();
const exitCode: Promise<number> = response.exitCode;

// Workspace options are type-checked
const workspace2 = new Workspace({
  workingDirectory: "/project", // string | URL (required)
  shell: "/bin/bash", // string (optional)
  env: { NODE_ENV: "test" }, // Record<string, string> (optional)
  timeout: Temporal.Duration.from({ seconds: 5 }).total("milliseconds"), // number (optional)
});
```

## Notes

- **Workspace Management**: Workspaces provide consistent configuration across multiple command executions
- **Automatic Timeout**: When a workspace timeout is configured, `AbortSignal.timeout()` is automatically created and applied to all commands
- **URL Validation**: Working directories must be valid paths that can be parsed as file URLs - the constructor validates this and throws an error if invalid
- **Environment Inheritance**: Environment variables are inherited from `process.env` by default, with workspace and command-specific variables taking precedence
- **Directory Creation**: The `mktmp()` method automatically creates temporary directories with unique names using timestamps and random values
- **Shell Integration**: Built on `@jondotsoy/shell` for robust command execution - all shell functionality remains available
- **Stream Management**: All streams are properly managed and cleaned up automatically
- **Cross-Platform**: Works with different shells (`/bin/sh`, `/bin/bash`, `/bin/zsh`, etc.) based on your system and configuration
- **Error Handling**: Timeout and cancellation are handled gracefully with proper error reporting and AbortError detection
