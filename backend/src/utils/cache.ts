import Redis from "ioredis"
import { redisConfig } from "@/config/env"

const redis = new Redis(redisConfig.redis)

export async function getCache(key: string): Promise<string | null> {
  return redis.get(key)
}

export async function setCache(
  key: string,
  value: string,
  ttl: number = 3600
): Promise<void> {
  await redis.set(key, value, "EX", ttl) // Set cache with expiry
}

export async function deleteCache(key: string): Promise<void> {
  await redis.del(key)
}
