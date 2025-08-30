---
mode: agent
model: Claude Sonnet 4
# prettier-ignore
tools: ['codebase', 'usages', 'vscodeAPI', 'problems', 'changes', 'testFailure', 'terminalSelection', 'terminalLastCommand', 'openSimpleBrowser', 'fetch', 'findTestFiles', 'searchResults', 'githubRepo', 'extensions', 'runTests', 'editFiles', 'runNotebooks', 'search', 'new', 'runCommands', 'runTasks']
---

Review src/queue/README.md and validate the changes in src/queue/queue.ts

If there are changes, update it. Avoid rewriting documentation if there are no relevant changes. Update the documentation if new APIs are found.

Only make changes in src/queue/README.md

Only modify classes and methods used exclusively by the Queue class.

After modifying the document, run `bun fmt` to format the code.
