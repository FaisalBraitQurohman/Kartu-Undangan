# UndangKita

Modular monolith: Next.js App Router, React, strict TypeScript, PostgreSQL/Prisma, Auth.js credentials, Tailwind and shadcn-style Radix primitives. Modules own validation and business rules; route handlers call services and never trust client prices, ownership, or roles.

## Trust boundaries

- Auth.js signs encrypted session JWTs. Every private operation reloads the user from PostgreSQL and checks sessionVersion, role and disabledAt. Credentials users and password hashes are database-backed; password reset invalidates existing sessions.
- Invitation writes and guest management are scoped by authenticated userId. Public rendering reads only published invitations. Guest tokens are random, and guest names never enter shared caches.
- Money is integer IDR. A single active order per user/template prevents concurrent duplicate checkout. Orders snapshot prices. Serializable transactions grant ownership exactly once; refunds retain financial records and revoke only the affected order's grant.
- Midtrans notifications require constant-time signature verification and a server-to-server status lookup. Frontend redirects never grant ownership. Payment events are idempotent and recorded.
- Cloudinary uploads are server-authenticated and validated. Assets are linked to an owned invitation; deletion resolves the asset from the database.
- Upstash enforces distributed rate limits in production. Missing production credentials fail closed. Local development has a bounded in-memory limiter.
- Resend and Sentry are optional configured adapters. Missing service credentials are explicit errors, never simulated success.

## Presentation

Ivory #FAF8F4, sand #EDE3D6, gold #B59A75, espresso #3B302B, white #FFFFFF. Playfair Display headings; Plus Jakarta Sans controls. Invitation stationery is the visual focal point: layered envelopes and distinct floral, classical, editorial and botanical layouts. Dashboard uses quiet surfaces and readable forms.

## Operations

Vercel Node runtime, managed PostgreSQL, additive Prisma migrations. Public content queries are separated from personalization. No production deployment or real payment transaction is run automatically. See README for setup and verification.
