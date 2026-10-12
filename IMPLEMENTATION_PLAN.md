# Implementation plan

1. Scaffold tooling, schema, migration, seed, credentials authentication, verification/reset and RBAC.
2. Design tokens, reusable components, Indonesian marketing and database catalog.
3. Authenticated dashboard, ownership service, invitation CRUD, optimistic locking.
4. Four versioned renderers and ten-section form editor with live preview.
5. Published invitation route, personal guest tokens, metadata, music and sharing.
6. Private guest CRUD/CSV, RSVP and moderated wishes.
7. Admin queries, users/templates/orders/payment events/audit/moderation/settings.
8. Midtrans Snap checkout, authoritative status verification, idempotent ownership transactions.
9. Cloudinary uploads/deletion, Resend, Upstash and Sentry adapters.
10. Unit/integration/E2E checks, security review, build and deployment documentation.

External verification needs PostgreSQL and service credentials. Record actual results in IMPLEMENTATION_PROGRESS.md. Keep all integration failures explicit. Do not represent unavailable infrastructure as working.
