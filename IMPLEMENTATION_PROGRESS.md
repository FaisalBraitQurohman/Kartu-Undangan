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

GitHub Actions workflow is implemented with pinned official action commits, PostgreSQL 17 health checks, Node 24, required database suites and failure artifacts. GitHub authorization now includes the `workflow` scope. Branch `feat/local-readiness` is published in draft [PR #4](https://github.com/FaisalBraitQurohman/Kartu-Undangan/pull/4), targeting staging. Hosted CI [run 38242382605](https://github.com/FaisalBraitQurohman/Kartu-Undangan/actions/runs/38242382605) passed for commit `28ab03a`: 36 unit tests, 14 PostgreSQL 17 integration tests, 6 Chromium workflows, lint, typecheck and production build on Node 24 / Ubuntu 24.04. No merge or production deployment has been performed.

See README.md for the two-terminal local startup and docs/DEPLOYMENT.md for preview requirements. Super-board remains unused.

## Vercel setup — 12 October 2026

The owner authorized Vercel setup. Project `undangkita` now has a protected Preview deployment, a dedicated Neon database with both migrations and four seeded templates, and Upstash Redis. Database and Redis health checks passed; the hosted homepage returned 200 and anonymous private invitation API returned 401. Preview secrets and its fixed origin are configured. Cloudinary API provisioning and ping succeeded; the owner confirmed the account claim and email verification. GitHub repository linking succeeded on retry, with main as the Production branch. The initial unexpected Production-target build was canceled; no production launch is complete. Domain/Resend, Midtrans, Cloudinary application upload acceptance, queue scheduling and production setup remain pending. Details are recorded in docs/DEPLOYMENT.md.

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

## Earlier implementation baseline

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

**Stopped by user choice on 12 October 2026.** Future work proceeds directly through Codex. No board workers remain active; the stale claim and run lock were released, and the clean issue-1 worktree was removed without force. Its branch is retained. CI issue #1 remains open in Backlog; its implementation is included in draft PR #4 through the direct Codex workflow. Tooling remains installed but will not be started automatically.
