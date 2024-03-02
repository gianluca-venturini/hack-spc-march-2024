import Redis from "ioredis";

const UPSTASH_API_KEY = process.env.UPSTASH_API_KEY;
export const redisClient = new Redis(
  `rediss://default:${UPSTASH_API_KEY}@usw1-magnetic-yak-33900.upstash.io:33900`
);
