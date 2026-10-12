# Implementation progress

## Status — 12 October 2026

The application is implemented from the supplied UndangKita specification. Initial commit `2482671` is pushed to GitHub on main, and staging has been created for super-board work. No production deployment has been performed. Production acceptance still requires configured services and verification against those services.

| Phase | State |
| --- | --- |
| Architecture/database/auth | Implemented; local checks passed |
| Design/marketing/catalog | Implemented; browser checks passed |
| Dashboard/ownership/CRUD | Implemented; database/browser checks passed |
| Template engine/editor | Four designs and editor implemented; browser checks passed |
| Public invitation | Implemented; publication and access checks passed |
| Guests/RSVP/wishes | Implemented; database/browser checks passed |
| Admin | Implemented; authorization and price persistence checks passed |
| Payments | Adapter, signed webhook, status reconciliation and ownership implemented; mocked provider boundary tested |
| External integrations | Adapters implemented; live service verification pending |
| Checks/deployment preparation | Local checks passed; setup documented; deployment pending |

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
