import { timingSafeEqual } from "node:crypto";
import { deliverEmailOutbox } from "@/lib/email-outbox";
import { errorResponse } from "@/lib/security/errors";
export async function GET(request: Request) {
  const expected = process.env.CRON_SECRET
    ? Buffer.from(`Bearer ${process.env.CRON_SECRET}`)
    : null;
  const actual = Buffer.from(request.headers.get("authorization") || "");
  if (
    !expected ||
    actual.length !== expected.length ||
    !timingSafeEqual(actual, expected)
  )
    return new Response(null, { status: 401 });
  try {
    return Response.json(await deliverEmailOutbox());
  } catch (error) {
    return errorResponse(error);
  }
}
