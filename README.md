# UndangKita

Indonesian digital invitation SaaS. Next.js App Router, React, strict TypeScript, Tailwind/shadcn components, PostgreSQL/Prisma and Auth.js credentials. Templates are purchased **once per account**, with unlimited invitations and no invitation expiry.

## Implemented workflows

- Indonesian marketing, database template catalog, four distinct invitation designs and demos.
- Credentials registration/login/logout, email verification/reset, database RBAC and session revocation.
- Free/owned template access, invitation drafts, ten-section live editor, revision conflict detection, publish/unpublish.
- Published URLs, secure personalized guest tokens, countdown, maps, music, photos, RSVP and moderated wishes.
- Private guest CRUD, search, personalized sharing and CSV export with formula protection.
- Admin users/templates/prices, invitation moderation, transactions, payment events, statistics and audit logs with pagination.
- Midtrans Snap redirect checkout, signed notifications, authoritative status lookup, idempotent financial transactions, permanent ownership and verified reversal handling.
- Cloudinary uploads with signature-byte validation, ownership, per-file/per-invitation/account quotas, and safe deletion.
- Resend email, purchase-email outbox, Upstash production rate limits and optional Sentry instrumentation.

External integrations are implemented, but they require your own configuration. No fake credentials, fake production API responses or preinstalled administrator passwords exist.

## Development

Node 22.12+ or a compatible newer Node version. This checkout was built and tested with Node 26.10.0.

### First local run without external accounts

From a fresh checkout with no `.env` or `.env.local`:

```sh
npm ci
npm run local:db
```

Keep that database terminal open. In a second terminal:

```sh
npm run local:setup
npm run dev
```

Open `http://localhost:3000`. The setup creates a named Prisma Postgres development database, applies both migrations, seeds the four templates and writes an ignored `.env.local` with a random AUTH_SECRET. It refuses to overwrite existing environment files or use occupied ports. No default user/admin password is created. The database uses loopback development ports 51420–51422; keep these local and use a managed PostgreSQL database for deployment.

Register your own account, then run `npm run local:inbox`. Open the newest text email under `.local/mail` and follow its verification link in the browser. This inbox is a real local delivery transport, clearly marked as development; messages are not delivered to an internet mailbox. Reset-password and queued notifications also use it. Local delivery is refused in production and hosted Vercel environments. Inbox messages contain private account links; do not share them or commit the directory.

To make your verified account an administrator: `npm run admin:promote -- your-email`. Sign in again afterwards. On subsequent sessions, use `npm run local:db` and `npm run dev`; stop the database with `npm run local:stop`. Data is preserved. Database commands and promotion load Next.js environment configuration, including `.env.local`.

The free invitation workflow runs locally. Payment checkout, media upload and real internet email need the corresponding external accounts; missing adapters return explicit errors and never silently grant premium templates or fake delivery. For manual/managed database setup, follow the steps below.

```sh
npm ci
```

Copy `.env.example` to `.env` and fill the values. Create a cryptographically random `AUTH_SECRET`, for example with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Keep the output private and never commit dotenv files.

Choose a managed PostgreSQL development database or start Docker locally:

```sh
# Set POSTGRES_PASSWORD yourself; compose deliberately has no hardcoded password.
docker compose up -d
```

Set DATABASE_URL to that database, then:

```sh
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Open `http://localhost:3000`. The seed adds the four sample templates (0/49,000/79,000/99,000 IDR) and preserves subsequent admin edits. It creates no user accounts.

Without Docker, `npx prisma dev --name undangkita-local` can run a local Prisma Postgres instance. Copy the **local connection URL printed by that command** into your environment. The local PGlite proxy used during this build needed `statement_cache_size=0&pgbouncer=true&connection_limit=1` in its URL to prevent prepared-statement collisions between processes. This local runtime is for development/tests; verify managed PostgreSQL before production. See [Prisma local Postgres documentation](https://www.prisma.io/docs/local-development/postgres).

For registration and verification, configure Resend and a verified sender, then enable `EMAIL_DELIVERY_ENABLED=true`. Without email configuration, registration persists the unverified account and returns an explicit delivery error; use “Kirim ulang email verifikasi” once delivery is ready. Forgot-password responses deliberately do not reveal whether an account exists.

After verifying your operator account:

```sh
npm run admin:promote -- your-operator-email
```

Sign in again after promotion. The command refuses nonexistent, unverified or disabled accounts and records the promotion.

## Environment

`.env.example` documents every variable. Required runtime values are DATABASE_URL, AUTH_SECRET, NEXTAUTH_URL and NEXT_PUBLIC_APP_URL. Both public URL variables must match the browser origin; authenticated and public mutations enforce same-origin requests. Auth.js v4 uses NEXTAUTH_URL and this application passes AUTH_SECRET explicitly.

Production additionally requires Upstash. Without it, mutation/auth rate limiting **fails closed**, rather than pretending a per-process limiter is distributed. The in-memory limiter is development-only.

Cloudinary media limits default to 30 images and one audio per invitation, 3 MiB/image, 4 MiB/audio and 200 MiB total per account. The account limit can be changed with MAX_USER_STORAGE_BYTES. Unlimited invitations does not bypass storage quotas. Use Cloudinary delivery transformations and only upload media you have rights to use.

Midtrans defaults to sandbox. Keep MIDTRANS_SERVER_KEY server-only. Set the notification URL to:

```text
https://your-app-domain/api/payments/webhook
```

Checkout uses the server's current price snapshot. A pending checkout is reused. A lost provider response remains reserved until an admin reconciles it from the orders page; it never silently creates another charge. Redirects do not unlock ownership. [Midtrans notification documentation](https://docs.midtrans.com/docs/https-notification-webhooks).

Purchase emails are queued transactionally. Schedule GET `/api/cron/email` with `Authorization: Bearer <CRON_SECRET>` or run the queue from the admin settings page. Resend receives an idempotency key. Verification and password-reset emails use direct delivery with retry through the corresponding account forms. EMAIL_FROM and SUPPORT_EMAIL must be real configured addresses. Tests disable real email delivery.

Sentry is enabled only if DSN variables exist. Server keys never use NEXT_PUBLIC variables. Database settings, guest lists and RSVP data are never exposed through a public GET API.

## Checks

```sh
npm run lint
npm run typecheck
npm test
npm run test:integration
npx playwright install chromium
npm run test:e2e
npm run test:database
npm run build
```

Integration and authenticated browser tests require **TEST_DATABASE_URL pointing to a disposable, migrated and seeded PostgreSQL database**. The fixture cleanup affects only generated test rows. Never set it to production. Missing TEST_DATABASE_URL causes database-dependent suites to skip; a skipped test is not verification.

Integration tests exercise real database writes and mock only outbound email/payment HTTP boundaries. Browser tests run a local Next server with generated test credentials and disabled external payments/emails. See IMPLEMENTATION_PROGRESS.md for actual results and limits.
Browser tests use an isolated local mail inbox and port 3100. `test:database` requires TEST_DATABASE_URL and refuses missing configuration, so CI cannot pass merely by skipping database suites. Run it in a separate checkout if another Next dev server is already running in this checkout.

GitHub Actions runs the **Quality and PostgreSQL workflows** check on PRs and pushes to main/staging. It uses Node 24, npm ci, PostgreSQL 17 with a health check, both migrations and seed, lint/typecheck/unit tests, production build and Chromium/database workflows. Its PostgreSQL password is disposable service configuration, not a production secret. Failed browser traces/screenshots are retained for seven days. The workflow has contents:read permission, pinned action commits, cancellation for superseded runs, and no deployment step.

On Windows, stop running Next/Vitest processes before `prisma generate` or `npm run build`; the Prisma DLL can be locked by another process. Run generation, database tests and production build sequentially.

## Deployment preparation

Use Vercel's Next.js preset and `npm run build`. Provision managed PostgreSQL and run the additive migrations from a trusted operator/CI environment before releasing code. Use a direct database connection for migration tooling if the runtime pooler does not support migrations. Configure sandbox Midtrans, Cloudinary, verified Resend sender, Upstash and optional Sentry in Preview first.

Validate the full sandbox payment, upload/delete and mail delivery workflows against your accounts before enabling live payments. Schedule the protected email queue endpoint, confirm backups and review your operator contact/privacy/terms information. No production deployment or real payment has been executed from this workspace.

See ARCHITECTURE.md, DATABASE_DESIGN.md, IMPLEMENTATION_PLAN.md and IMPLEMENTATION_PROGRESS.md. Super-board remains installed for historical reference, but the user stopped using it. Development proceeds directly through Codex; do not start board workers unless explicitly requested again.
