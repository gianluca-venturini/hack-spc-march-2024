import Redis from "ioredis";

export async function setValue(key: string, value: string) {
  await redisClient.set(key, value);
  return await redisClient.get(key);
}

export async function getValuesByPrefix(prefix: string): Promise<string[]> {
    try {
        const keys = await redisClient.keys(`${prefix}*`);
        console.log('keys', keys);
        
        // If no keys found, return empty or handle as needed
        if (!keys.length) {
            console.log('No keys found with the specified prefix.');
            return [];
        }
        
        // Get values for all found keys
        const values = await redisClient.mget(...keys);
        return values.filter(value => !!value) as string[];
    } catch (error) {
        console.error('Error fetching keys and values:', error);
        throw error;
    }
}

export async function setHash(hash: string, field: string, value: string) {
    await redisClient.hset(hash, field, value);
    await redisClient.hget(hash, field);
}

export async function deleteAll() {
    redisClient.flushdb().then(() => {
        console.log('All keys in the current database have been removed');
    });
}

const UPSTASH_API_KEY = process.env.UPSTASH_API_KEY;
export const redisClient = new Redis(
    `rediss://default:${UPSTASH_API_KEY}@usw1-magnetic-yak-33900.upstash.io:33900`, {
        connectTimeout: 30000 // Timeout in milliseconds
    }
);
