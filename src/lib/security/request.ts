import { AppError } from "./errors";
import { appUrl } from "@/lib/utils";
export function requireSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(appUrl()).origin)
    throw new AppError(403, "Permintaan tidak diizinkan.");
}
export function clientIp(request: Request) {
  return process.env.VERCEL
    ? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
    : "local";
}
export async function readJson(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json"))
    throw new AppError(415, "Gunakan format JSON.");
  const raw = await request.text();
  if (Buffer.byteLength(raw) > 100_000)
    throw new AppError(413, "Data terlalu besar.");
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    throw new AppError(400, "JSON tidak valid.");
  }
}
