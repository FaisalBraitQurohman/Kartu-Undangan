import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { AppError } from "./errors";
import { tokenHash } from "./tokens";
const memory = new Map<string, { count: number; until: number }>();
const limiters = new Map<number, Ratelimit>();
export async function rateLimit(key: string, limit = 20) {
  const hashed = tokenHash(key);
  if (
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    let limiter = limiters.get(limit);
    if (!limiter) {
      limiter = new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(limit, "1 m"),
        prefix: "undangkita",
      });
      limiters.set(limit, limiter);
    }
    const { success } = await limiter.limit(hashed);
    if (!success)
      throw new AppError(429, "Terlalu banyak permintaan. Tunggu satu menit.");
    return;
  }
  if (process.env.NODE_ENV === "production")
    throw new AppError(503, "Layanan keamanan belum dikonfigurasi.");
  const now = Date.now();
  if (memory.size > 5000)
    for (const [k, v] of memory) if (v.until <= now) memory.delete(k);
  const current = memory.get(hashed);
  if (!current || current.until <= now) {
    memory.set(hashed, { count: 1, until: now + 60_000 });
    return;
  }
  if (current.count >= limit)
    throw new AppError(429, "Terlalu banyak permintaan. Tunggu satu menit.");
  current.count++;
}
