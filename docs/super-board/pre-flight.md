# Super-board pre-flight — 12 October 2026

- GitHub identity: FaisalBraitQurohman; repository and Project #1 are writable.
- Base branch: staging, created from initial application commit 2482671.
- Git, Node, Git Bash, jq, Python and Codex CLI are installed. Windows onboarding added a Python 3 launcher and tool directories to the user PATH; restart an existing IDE to inherit the update.
- Config: `.claude/super-board/configs/kartu-undangan.json`; active marker is machine-local.
- Gates: reviewed normal changes may auto-merge below 400 changed lines; auth, money and Prisma schema/migrations require a human.
- No database environments are authorized for autonomous migrations. Configure a dedicated environment and update onboarding before permitting them.
- Unit/static/build work can run without service credentials. Database tests require a disposable migrated and seeded TEST_DATABASE_URL. Skipped suites do not prove database behavior.
- Midtrans, Cloudinary, Resend, Upstash and Sentry live verification remains pending. Credentials were not inspected.
- Ready card #1: add GitHub Actions checks with a disposable PostgreSQL service. Acceptance criteria must cover real database suites without skips; no deployment or live services.
- No workers have been launched during onboarding.

Onboarding self-check is green. Both Codex launcher scripts passed Bash syntax checks. Ticket #1 pre-flight returned proceed: no duplicates, overlap or unclear acceptance criteria.
