import Redis from "ioredis";

export async function setKey(key: string, value: string) {
  await redisClient.set(key, value);
  await redisClient.get(key);
}

export async function setHash(hash: string, field: string, value: string) {
  await redisClient.hset(hash, field, value);
  await redisClient.hget(hash, field);
}

const UPSTASH_API_KEY = process.env.UPSTASH_API_KEY;
export const redisClient = new Redis(
  `rediss://default:${UPSTASH_API_KEY}@usw1-magnetic-yak-33900.upstash.io:33900`
);
