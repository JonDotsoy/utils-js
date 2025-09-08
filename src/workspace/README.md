# Workspace Module

The Workspace module provides a powerful and flexible API for executing shell commands in Node.js applications. It offers stream-based command execution with full control over input/output streams, environment variables, and working directories.

## Why This Module Exists

Traditional Node.js approaches to shell command execution often fall short when dealing with complex scenarios involving streaming data, environment management, and workspace isolation. While `child_process.exec()` and similar APIs work for simple cases, they become cumbersome when you need fine-grained control over input/output streams, environment variables, or when working with multiple related commands in a specific context.

This module was created to bridge that gap by providing a modern, stream-first approach to shell command execution. It enables developers to work with commands as composable units that can be chained, monitored, and controlled with precision. Whether you're building development tools, CI/CD pipelines, or applications that need to interact with system commands, this module provides the flexibility and reliability you need without sacrificing performance or type safety.

## Table of Contents

- [Why This Module Exists](#why-this-module-exists)
- [Overview](#overview)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Advanced Usage](#advanced-usage)

## Overview

The workspace module consists of several key components:

- **`shell()`** - Core function for executing shell commands
- **`Workspace`** - Managed environment for command execution
- **`ShellRequest`** - Command configuration container
- **`ShellResponse`** - Command execution result with streams
- **`ReadableTools`** - Utilities for working with streams
- **`StdioStream`** - Container for stdout/stderr streams

## Quick Start

### Basic Command Execution

```typescript
import { shell } from "./workspace.js";

// Simple command execution
const response = shell('echo "Hello World"');
const output = await response.text();
console.log(output); // "Hello World"
```

### Using Workspace for Multiple Commands

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

### Using Workspace with Timeout

```typescript
import { Workspace } from "./workspace.js";

// Create a workspace with a 5-second timeout
const workspace = new Workspace({
  workingDirectory: "/path/to/project",
  shell: "/bin/bash",
  timeout: 5000, // 5 seconds
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

### `shell(command, options?)`

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

#### Constructor

```typescript
new Workspace(options?: WorkspaceOptions)
```

**Options:**

- `workingDirectory` (string | URL) - Working directory for commands
- `shell` (string, optional) - Shell to use (default: '/bin/sh')
- `env` (Record<string, string>, optional) - Environment variables
- `timeout` (number, optional) - Timeout in milliseconds for command execution

#### Methods

##### `run(command, options?)`

Executes a command in the workspace context.

##### `static mktmp(options?)`

Creates a temporary workspace in the system temp directory.

### `ShellResponse`

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
const response = shell("npm install").verbose();
```

### `ReadableTools`

Utility class for working with ReadableStream instances.

#### Methods

##### `text()`

Reads entire stream as text.

##### `json()`

Reads and parses stream as JSON.

##### `static iterable(stream)`

Creates an async iterable from a ReadableStream.

## Examples

### Command with Timeout and Signal

```typescript
// Using AbortSignal for manual control
const controller = new AbortController();
const response = shell("long-running-command", {
  signal: controller.signal,
});

// Cancel the command after 3 seconds
setTimeout(() => controller.abort(), 3000);

try {
  const output = await response.text();
  console.log(output);
} catch (error) {
  if (error.name === "AbortError") {
    console.log("Command was cancelled");
  }
}
```

### Command with Custom Environment

```typescript
const response = shell("echo $MY_VAR", {
  env: { MY_VAR: "Hello from env!" },
});

const output = await response.text();
console.log(output); // "Hello from env!"
```

### Handling Command Errors

```typescript
const response = shell("nonexistent-command");

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
const response = shell('find /large/directory -name "*.js"');

// Process output as it arrives
for await (const chunk of ReadableTools.iterable(response.stdout.stream)) {
  const text = new TextDecoder().decode(chunk);
  console.log("Found:", text.trim());
}
```

### Piping Input to Command

```typescript
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
  timeout: 10000, // 10 seconds for all commands
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
const response = shell("npm list --json --depth=0");
const packageInfo = await response.json();

console.log("Dependencies:", Object.keys(packageInfo.dependencies || {}));
```

## Advanced Usage

### Timeout and Signal Handling

```typescript
import { ShellRequest } from "./workspace.js";

// Create a request with custom timeout
const signal = AbortSignal.timeout(5000); // 5 seconds
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
import { ShellRequest } from "./workspace.js";

const request = new ShellRequest("complex-command", {
  cwd: "/specific/directory",
  env: { NODE_ENV: "production" },
  shell: "/bin/bash",
});

const response = shell(request);
```

### Combining Streams

```typescript
const response1 = shell('echo "data1"');
const response2 = shell('echo "data2"');

const combined = new StdioStream({
  stdout: response1.stdout.stream,
  stderr: response2.stderr.stream,
});
```

### Timeout Handling

Commands can be configured with timeouts in several ways:

1. **Workspace-level timeout**: All commands inherit the workspace timeout
2. **AbortSignal.timeout()**: Create a signal with specific timeout
3. **Manual AbortController**: Programmatic control over cancellation

```typescript
// Method 1: Workspace timeout
const workspace = new Workspace({ timeout: 30000 }); // 30 seconds

// Method 2: AbortSignal timeout
const response = shell("command", { signal: AbortSignal.timeout(10000) });

// Method 3: Manual control
const controller = new AbortController();
const response2 = shell("command", { signal: controller.signal });
setTimeout(() => controller.abort(), 5000);
```

### Error Handling Best Practices

```typescript
async function safeExecute(command: string, timeout?: number) {
  try {
    const options = timeout ? { signal: AbortSignal.timeout(timeout) } : {};
    const response = shell(command, options);
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
// Types are automatically inferred
const response: ShellResponse = shell("echo test");
const output: Promise<string> = response.text();
const exitCode: Promise<number> = response.exitCode;
```

## Notes

- Commands can be configured with custom timeouts using `AbortSignal.timeout()` or workspace timeout settings
- Environment variables are inherited from `process.env` by default
- Working directory defaults to the workspace's configured directory
- All streams are properly managed and cleaned up automatically
- The module handles both text and binary data streams
- Timeout and cancellation are handled gracefully with proper error reporting
