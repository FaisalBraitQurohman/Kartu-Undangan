# UndangKita project context

## Product

Indonesian digital invitation SaaS. Purchasing a template unlocks it permanently for that account. Invitations are unlimited and never expire. There is no recurring billing. Storage limits are separate from invitation count. Four versioned template renderers support drafts, a live editor, publication, secure guest sharing, RSVP and moderated wishes. Admins manage users, templates, prices, moderation and payment reconciliation.

## Stack and source map

- Next.js 16.4 App Router, React 19.3, strict TypeScript, Tailwind 4, Radix/shadcn conventions, Lucide and Motion. Read relevant installed Next.js documentation before code changes; see AGENTS.md.
- Prisma 6.19 with PostgreSQL; Auth.js/next-auth 4 credentials authentication and database-backed authorization/session revocation.
- React Hook Form and Zod for validated Indonesian forms.
- Midtrans Snap payments, Cloudinary storage, Resend email/outbox, Upstash production rate limits, optional Sentry instrumentation.
- `src/app`: routes, server pages and API handlers; `src/components`: UI/editor/dashboard; `src/features`: domain services; `src/lib`: authentication, database, security and external adapters.
- `src/templates`: registry, typed renderer and four template designs; `src/validators`: request/content schemas.
- `prisma/schema.prisma`, `prisma/migrations`, `prisma/seed.ts`: schema, additive migrations and catalog seed. Seed creates no user accounts.
- `tests/unit`, `tests/integration`, `tests/e2e`: Vitest units, database integration and Playwright browser workflows.
- README.md, ARCHITECTURE.md, DATABASE_DESIGN.md, IMPLEMENTATION_PLAN.md and IMPLEMENTATION_PROGRESS.md document setup, design and observed verification.

## Engineering boundaries

Enforce identity, role, ownership, validation and authoritative prices on the server. Use integer IDR amounts and serializable transactions for checkout and ownership. Payment redirects never grant access; verify signed notifications against authoritative provider status, and keep financial processing idempotent. Preserve financial records and existing work. Do not expose guest lists, password hashes, tokens or service secrets.

Never read dotenv or credential files. Use documented environment variable names and service health results. Never perform destructive migrations or production deployment without explicit authorization. Keep accessible Indonesian UI and reduced-motion support. Do not claim checks passed unless they ran successfully.

## Worker checks

Use the lockfile and pinned dependencies:

```sh
npm ci
npm run db:generate
npm run lint
npm run typecheck
npm test
npm run build
```

On Windows, stop Next/Vitest processes before Prisma generation or the build to avoid locked engine DLLs. Run generation, database tests and build sequentially.

Database integration and authenticated browser checks require `TEST_DATABASE_URL` pointing to a disposable, migrated and seeded PostgreSQL database. Never use production. Missing configuration skips database-dependent suites and does not count as verification. Provision that database explicitly, then use `npm run test:integration` and `npm run test:e2e` (install Chromium with `npx playwright install chromium` if needed). Runtime setup uses DATABASE_URL, AUTH_SECRET, NEXTAUTH_URL and NEXT_PUBLIC_APP_URL; production rate limiting also requires Upstash. README.md lists integration variables and setup without embedding credentials.

## Verification baseline and limits

IMPLEMENTATION_PROGRESS.md records the completed local baseline: 30 unit tests, 14 integration tests and 5 Chromium workflows, plus lint, typecheck and production build. Database checks used a disposable local Prisma Postgres/PGlite instance; outbound email, payment HTTP and Cloudinary were mocked. These results are historical, not evidence for a new worker change.

Managed PostgreSQL behavior, live Midtrans sandbox checkout/public notifications, Cloudinary uploads/deletions, Resend delivery, Upstash distributed limits, Sentry telemetry, production load and deployment remain unverified. No live payment or production deployment has been performed. The recorded production dependency audit found zero vulnerabilities; the full audit had five high advisories in development lint tooling. Recheck when dependency work changes that baseline.
