import { paymentWebhook } from "@/features/payments/service";
import { readJson } from "@/lib/security/request";
import { errorResponse } from "@/lib/security/errors";
export async function POST(request: Request) {
  try {
    const status = await paymentWebhook(await readJson(request));
    return Response.json({ status });
  } catch (error) {
    return errorResponse(error);
  }
}
