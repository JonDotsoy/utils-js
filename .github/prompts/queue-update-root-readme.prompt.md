---
mode: agent
model: Claude Sonnet 4
# prettier-ignore
tools: ['codebase', 'usages', 'vscodeAPI', 'problems', 'changes', 'testFailure', 'terminalSelection', 'terminalLastCommand', 'openSimpleBrowser', 'fetch', 'findTestFiles', 'searchResults', 'githubRepo', 'extensions', 'runTests', 'editFiles', 'runNotebooks', 'search', 'new', 'runCommands', 'runTasks']
---

Review the Queue API section in README.md, check the documentation in src/queue/README.md, and update README.md.

Keep the update clear and concise.

Only make changes to README.md.

After making changes, run `bun fmt`.
