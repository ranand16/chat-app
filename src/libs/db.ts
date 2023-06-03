import { Redis } from "@upstash/redis";

// export const redisdb = new Redis({
//   url: process.env.UPSTASH_REDIS_REST_URL,
//   token: process.env.UPSTASH_REDIS_REST_TOKEN,
// });

// The above commented code is same as the below line
export const redisdb = Redis.fromEnv();
