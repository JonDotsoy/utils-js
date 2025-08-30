---
mode: agent
model: Claude Sonnet 4
# prettier-ignore
tools: ['codebase', 'usages', 'vscodeAPI', 'problems', 'changes', 'testFailure', 'terminalSelection', 'terminalLastCommand', 'openSimpleBrowser', 'fetch', 'findTestFiles', 'searchResults', 'githubRepo', 'extensions', 'runTests', 'editFiles', 'runNotebooks', 'search', 'new', 'runCommands', 'runTasks']
---

Review `src/queue/queue.ts` and update the JSDoc comments.

Validate the changes with the command `bun test src/queue/queue.spec.ts` and update the documentation if necessary.

Avoid making changes to the code logic.

Avoid rewriting comments if the documentation is already clear and precise.

You should only read and update `src/queue/queue.ts`, do not add new code.

After modifying the document, run `bun fmt` to format the code.
