# UndangKita deployment preparation

The local development target is ready. This document describes the remaining preview/production work; it does not claim those external accounts have been tested.

## Environment and database

1. Provision a dedicated managed PostgreSQL preview database and separate disposable test database. Do not reuse a production database for tests.
2. Configure DATABASE_URL, a fresh random AUTH_SECRET, NEXTAUTH_URL and NEXT_PUBLIC_APP_URL. URL values must identify the actual preview origin.
3. Apply `npm run db:migrate` with a migration-capable database connection, then `npm run db:seed`. Existing template price edits are preserved.
4. Configure EMAIL_TRANSPORT=resend, EMAIL_DELIVERY_ENABLED=true, RESEND_API_KEY, a verified EMAIL_FROM, and your SUPPORT_EMAIL. Never deploy the generated development `.env.local` or use the local mail transport on a hosted environment.
5. Configure Upstash rate-limit variables; production mutations fail closed without them. Configure Cloudinary and sandbox Midtrans keys. Enable Sentry only after setting the appropriate server/public DSNs.
6. Configure CRON_SECRET and schedule GET `/api/cron/email` with its bearer authorization. Keys remain server-only except explicitly public variables in `.env.example`.

Use Vercel's Next.js preset and `npm run build`. No deployment has been performed. Deploy only after the owner authorizes the target account and environment.

## Preview acceptance

| Area          | Evidence needed against real preview services                                                                                                                                                                                                                                          |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Accounts      | Receive verification/reset messages, consume links once, reject expired links and invalidate an old session after password reset.                                                                                                                                                      |
| Authorization | One user cannot read or mutate another user's invitations, guests, files or transactions. An ordinary user cannot invoke admin APIs.                                                                                                                                                   |
| Invitations   | Create a free invitation, edit, publish, personalize guest sharing, submit RSVP/wishes, moderate, unpublish and delete.                                                                                                                                                                |
| Storage       | Upload valid images/audio, reject invalid magic/oversized files, respect account quota, remove detached assets and confirm Cloudinary deletion.                                                                                                                                        |
| Payments      | Complete a Midtrans sandbox checkout; receive signed notifications at `/api/payments/webhook`; reconcile provider status; duplicate delivery creates one ownership grant; reject wrong amount/signature; exercise verified reversal handling. Redirect alone must not grant ownership. |
| Operations    | Observe Upstash limits, process/retry the email queue, confirm audit logs, scrub sensitive telemetry and check database backup/restore procedures.                                                                                                                                     |

Create and verify the operator's own account, then use `npm run admin:promote -- operator-email`. Promotion has no default password and revokes old sessions. Review company/contact/privacy/terms information before opening the service publicly.

GitHub Actions is defined in `.github/workflows/ci.yml` with a disposable PostgreSQL service and no deployment step. The workflow is published in draft [PR #4](https://github.com/FaisalBraitQurohman/Kartu-Undangan/pull/4), targeting staging; hosted [CI run 38242382605](https://github.com/FaisalBraitQurohman/Kartu-Undangan/actions/runs/38242382605) passed for commit `28ab03a` on Node 24, PostgreSQL 17 and Ubuntu 24.04, including all 56 unit, integration and browser tests. The local test results are in IMPLEMENTATION_PROGRESS.md. Managed PostgreSQL and live adapters require separate preview verification once those environments are available.
