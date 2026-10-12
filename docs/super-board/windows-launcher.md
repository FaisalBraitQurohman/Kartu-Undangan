# Native Windows launcher

The first Codex wave halted before building issue #1. The router's temp-only profile had no writable workspace capability SID; workers could not execute jq in WinGet's per-user directory, and the sandbox user could not use the owner's GitHub credential manager.

The native Windows adapter keeps sandboxing enabled:

- Router runs in a writable temporary workspace, with the repository readable.
- Lane workspace and git directories are writable; tool directories are readable.
- Authenticated GitHub CLI credentials are passed only in the child process environment. Tokens never enter files, command arguments or model prompts. Other inherited secret-like variables are excluded from tool commands.
- The installed jq executable is copied into the ignored runtime tools directory and checked against the source SHA-256. No machine-wide ACL changes are made.
- npm and Playwright caches live in the ignored repository runtime cache. PowerShell workers use npm.cmd/npx.cmd rather than changing execution policy.
- Windows process cancellation terminates the owned child process tree. Unix permission arguments and process-group behavior are retained.

Readiness observed on 12 October 2026: a sandboxed scratch process read issue #1 and executed jq 1.8.2 successfully. A sandboxed lane process ran npm.cmd 11.19.1, git status and Bash/jq, then created and removed its scoped probe file. The npm.ps1 shim was blocked; npm.cmd succeeded. These checks establish launcher readiness, not completion of the CI ticket.

Reference: [OpenAI permission profiles](https://learn.chatgpt.com/docs/permissions) and [native Windows sandbox](https://learn.chatgpt.com/docs/windows/windows-sandbox).

Resume only after checking that the prior wave has exited. Recover GitHub reads through `super-board-github-read.py --resume`, preserve the archived failure record, release stale claims, and remove only the stale run lock. Then use `$super-board run --codex --low`.
