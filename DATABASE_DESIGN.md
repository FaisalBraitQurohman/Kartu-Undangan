# Database design

PostgreSQL is the source of truth. Prisma relations and indexes enforce isolation and financial integrity.

User → UserTemplate → Template grants permanent ownership. Unique (userId, templateId) prevents duplicate grants. A free active template requires no prior grant; creating an invitation also records a permanent free grant so later price changes preserve access. No invitation expiry or invitation count limit exists.

User → Invitation → Event / Media / Guest / Wish / InvitationVisit. Guest → RSVP is one-to-one. Deleting an invitation cascades its private guest data; template and user deletion are restricted where financial records exist. Users are disabled rather than hard-deleted.

Order → TemplatePurchase captures unitPrice independently of future price changes. PaymentEvent has unique providerEventKey. Order.activePurchaseKey is unique when checkout is active, null after terminal states; this serializes concurrent checkout for the same user/template. UserTemplate.sourceOrderId identifies the grant to revoke for refunds/chargebacks. A late failure cannot downgrade a paid order; a verified financial reversal can.

Invitation.revision supports compare-and-swap edits. JSON content is validated by a versioned Zod registry, never executable code. Invitation.templateVersion freezes the renderer version. Tokens are cryptographically random and reset/verification tokens are stored hashed.

Initial migration creates tables only. PasswordResetToken has token expiry; Invitation deliberately has no expiry field. Auth tables are included for Auth.js interoperability.
