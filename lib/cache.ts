import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL ?? "",
  token: process.env.KV_REST_API_TOKEN ?? "",
});

const CACHE_TTL = 60 * 60 * 6; // 6 hours

export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get<T>(key);
    return data ?? null;
  } catch {
    return null;
  }
}

export async function setCached<T>(key: string, data: T): Promise<void> {
  try {
    await redis.set(key, data, { ex: CACHE_TTL });
  } catch {
    // fail silently — caching is not critical
  }
}

export function playerCacheKey(accountId: string): string {
  return `player:${accountId}`;
}
