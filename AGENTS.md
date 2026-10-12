# UndangKita engineering

Indonesian digital invitations, purchased templates unlock permanently per user. No recurring billing, invitation expiry or invitation count quotas.

## Commands

- `npm run dev`: local app
- `npm run lint`, `npm run typecheck`, `npm test`: static and unit checks
- `npm run test:integration`: PostgreSQL integration checks
- `npm run test:e2e`: browser workflows
- `npm run build`: production build
- `npm run db:migrate`, `npm run db:seed`: explicitly configured database

## Boundaries

- Enforce identity, role, ownership, validation and authoritative prices on the server.
- Use integer money and serializable transactions for checkout/ownership.
- Never expose guest lists, password hashes, tokens or service secrets.
- Never read dotenv or credential files. Use documented variable names and service health results.
- Preserve existing work and financial records. No destructive migrations or production deployment without explicit authorization.
- Never claim checks passed unless they ran successfully. Keep progress accurate.
- Use stable pinned packages, accessible Indonesian UI and reduced-motion support.

Modules live in `src/features`, infrastructure adapters in `src/lib`, renderers in `src/templates`. Store structured JSON; no executable database content.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
