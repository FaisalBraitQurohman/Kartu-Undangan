# Native Windows launcher

The first Codex wave halted before building issue #1. The router's temp-only profile had no writable workspace capability SID; workers could not execute jq in WinGet's per-user directory, and the sandbox user could not use the owner's GitHub credential manager.

The native Windows adapter keeps sandboxing enabled:

- Router runs in a writable temporary workspace, with the repository readable.
- Lane workspace and git directories are writable; tool directories are readable.
- Before a Windows lane starts, its exact `issue-<number>-<lane>` directory exists and is registered with `--add-dir` plus an explicit write grant. Directory aliases are rejected; existing contents are preserved. Workers use that directory without recreating its root.
- Authenticated GitHub CLI credentials are passed only in the child process environment. Tokens never enter files, command arguments or model prompts. Other inherited secret-like variables are excluded from tool commands.
- The installed jq executable is copied into the ignored runtime tools directory and checked against the source SHA-256. No machine-wide ACL changes are made.
- npm and Playwright caches live in the ignored repository runtime cache. PowerShell workers use npm.cmd/npx.cmd rather than changing execution policy.
- Windows process cancellation terminates the owned child process tree. Unix permission arguments and process-group behavior are retained.

Readiness observed on 12 October 2026: a sandboxed scratch process read issue #1 and executed jq 1.8.2 successfully. A sandboxed lane process ran npm.cmd 11.19.1, git status and Bash/jq, then created and removed its scoped probe file. The npm.ps1 shim was blocked; npm.cmd succeeded. These checks establish launcher readiness, not completion of the CI ticket.

Wave 2 subsequently reached Building but could not write files in its newly created Git worktree. The earlier root-level probe did not cover that case. After the directory registration fix, a sandboxed detached-worktree probe passed absolute-path `apply_patch` creation under `.github/workflows`, modification and byte-for-byte restoration of tracked `README.md`, and PowerShell new-file creation/removal. Git status was clean and the diagnostic worktree was removed without force. Evidence is retained in `.claude/super-board/inflight/windows-worktree-readiness.txt` and its stderr log. Python AST parsing and Bash syntax checks passed; the CI ticket still needs its own workflow and PR evidence.

Reference: [OpenAI permission profiles](https://learn.chatgpt.com/docs/permissions) and [native Windows sandbox](https://learn.chatgpt.com/docs/windows/windows-sandbox).

Resume only after checking that the prior wave has exited. Recover GitHub reads through `super-board-github-read.py --resume`, preserve the archived failure record, release stale claims, and remove only the stale run lock. Then use `$super-board run --codex --low`.
