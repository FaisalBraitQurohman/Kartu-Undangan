# Implementation progress

## Status — 12 October 2026

The application is implemented from the supplied UndangKita specification. Initial commit `2482671` is pushed to GitHub on main, and staging has been created for super-board work. No production deployment has been performed. Production acceptance still requires configured services and verification against those services.

## Accepted finish scope

The user chose **ready to run locally and prepared for deployment**, with no external service accounts yet. That local target is implemented on branch `feat/local-readiness`. A real development database and private local verification/reset email delivery are configured; no default user account exists. External payments, Cloudinary uploads, hosted email, distributed limits and telemetry remain pending account configuration.

Final local readiness checks:

- 36 unit tests passed, including local mail persistence, idempotency and refusal of local delivery in production/Vercel.
- 14 real database integration tests passed on the dedicated Prisma Postgres/PGlite readiness database; only outbound service boundaries are mocked.
- 6 Chromium workflows passed, adding registration, inbox verification, password reset and old-session revocation to the previous five workflows.
- Lint, typecheck and production build passed. Final build had no tracing warnings; 35 server trace manifests contained zero environment/local-data/agent-tool files.
- First-run setup generated the client, migrated and seeded a fresh database and wrote an ignored `.env.local`. Database stop was exercised on the separate verification database and preserved its data.
- The development app returned HTTP 200 for home/login, displayed its database catalog, and its private invitation API returned HTTP 401 to an anonymous request.
- Production dependency audit returned zero vulnerabilities. The previously recorded five development-tool advisories remain.

GitHub Actions workflow is implemented with pinned official action commits, PostgreSQL 17 health checks, Node 24, required database suites and failure artifacts. **Remote publication and hosted execution are pending:** GitHub rejected the push because the current OAuth token lacks `workflow` scope; the authorization request timed out without a completed grant. No hosted CI run or new application PR is claimed. Source commits remain local on `feat/local-readiness`.

See README.md for the two-terminal local startup and docs/DEPLOYMENT.md for preview requirements. Super-board remains unused.

| Phase                         | State                                                                                                     |
| ----------------------------- | --------------------------------------------------------------------------------------------------------- |
| Architecture/database/auth    | Implemented; local checks passed                                                                          |
| Design/marketing/catalog      | Implemented; browser checks passed                                                                        |
| Dashboard/ownership/CRUD      | Implemented; database/browser checks passed                                                               |
| Template engine/editor        | Four designs and editor implemented; browser checks passed                                                |
| Public invitation             | Implemented; publication and access checks passed                                                         |
| Guests/RSVP/wishes            | Implemented; database/browser checks passed                                                               |
| Admin                         | Implemented; authorization and price persistence checks passed                                            |
| Payments                      | Adapter, signed webhook, status reconciliation and ownership implemented; mocked provider boundary tested |
| External integrations         | Adapters implemented; live service verification pending                                                   |
| Checks/deployment preparation | Local checks passed; setup documented; deployment pending                                                 |

## Verification actually performed

- `npm test`: **30 unit tests passed**, including financial state transitions, signatures, authorization, validation and security helpers.
- `npm run test:integration`: **14 tests passed** against a disposable local Prisma Postgres/PGlite instance, exercising real database writes. Outbound email, Midtrans HTTP and Cloudinary are mocked. Coverage includes ownership, concurrent checkout, webhook retries, reversal handling, publication, revision conflicts, guest responses and media quotas/deletion.
- `npm run test:e2e`: **5 Chromium workflows passed** after the final UI changes: marketing/four demos/mobile navigation, login protection, editor/publication/guest RSVP/moderation/deletion, cross-user isolation and admin price management.
- `npm run lint`: passed with zero warnings.
- `npm run typecheck`: passed.
- `npm run build`: passed, including Prisma client generation and Next.js production compilation.
- Both additive migrations and the four-template seed were applied to the disposable local database.
- Dependency audit observed **zero production dependency vulnerabilities**. The full audit reported five high development-tool advisories in the braces/fast-glob/micromatch lint tooling chain; no compatible patched braces release was available during this build.

Browser tests use generated temporary verified accounts in the disposable database, never production fixture accounts. Development servers are stopped after verification. No external credentials were inspected or persisted.

## Remaining external verification

- Managed PostgreSQL migration, connection pooling, concurrency and backup behavior. The local PGlite result does not establish managed database compatibility under production load.
- Real Midtrans sandbox checkout and publicly reachable notification delivery, including provider retries and financial reversals.
- Cloudinary upload/delivery/deletion against the configured account.
- Resend verification/reset/purchase/security email delivery and sender configuration.
- Upstash distributed limits and Sentry telemetry against configured services.
- Production operator information, deployment environment and production acceptance/load testing.

No real payment, live email delivery, live media upload or production deployment was performed. See README.md for setup and verification commands.

## Super-board

Onboarding is configured for GitHub Project “Kartu Undangan” #1 and base branch staging. Normal reviewed changes may merge automatically; money, authentication and Prisma schema/migration changes require a human. Database migration permission remains empty until a dedicated environment is configured. Sources are GitHub issues, past PRs and architecture. The first Codex wave halted before building issue #1 due to native Windows permissions and sandbox GitHub authentication. Launcher recovery and observed readiness are documented in docs/super-board/windows-launcher.md; the CI ticket remains unfinished until the resumed pipeline supplies evidence.

**Stopped by user choice on 12 October 2026.** Future work proceeds directly through Codex. No board workers remain active; the stale claim and run lock were released, and the clean issue-1 worktree was removed without force. Its branch is retained. CI issue #1 remains open in Backlog and has no implementation PR. Tooling remains installed but will not be started automatically.
