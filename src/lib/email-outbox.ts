import { db } from "@/lib/db";
import { sendEmail } from "./email";
import { AppError } from "@/lib/security/errors";
export async function deliverEmailOutbox({
  retryFailed = false,
}: { retryFailed?: boolean } = {}) {
  if (
    process.env.EMAIL_DELIVERY_ENABLED !== "true" ||
    !process.env.RESEND_API_KEY ||
    !process.env.EMAIL_FROM
  )
    throw new AppError(503, "Pengiriman email belum dikonfigurasi.");
  if (retryFailed)
    await db.emailJob.updateMany({
      where: { sentAt: null, attempts: { gte: 10 }, lockedAt: null },
      data: { attempts: 0 },
    });
  const jobs = await db.emailJob.findMany({
    where: {
      sentAt: null,
      attempts: { lt: 10 },
      OR: [
        { lockedAt: null },
        { lockedAt: { lt: new Date(Date.now() - 300_000) } },
      ],
    },
    take: 20,
    orderBy: { createdAt: "asc" },
  });
  let sent = 0;
  for (const job of jobs) {
    const claim = await db.emailJob.updateMany({
      where: {
        id: job.id,
        sentAt: null,
        OR: [
          { lockedAt: null },
          { lockedAt: { lt: new Date(Date.now() - 300_000) } },
        ],
      },
      data: { lockedAt: new Date(), attempts: { increment: 1 } },
    });
    if (!claim.count) continue;
    try {
      await sendEmail(job.to, job.subject, job.text, job.key);
      await db.emailJob.update({
        where: { id: job.id },
        data: { sentAt: new Date(), lockedAt: null },
      });
      sent++;
    } catch {
      await db.emailJob.update({
        where: { id: job.id },
        data: { lockedAt: null },
      });
    }
  }
  return { sent, processed: jobs.length };
}
