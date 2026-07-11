import IORedis from "ioredis";
import dotenv from "dotenv";

dotenv.config();
export const redis = process.env.REDIS_URL
  ? new IORedis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null,
    })
  : new IORedis({
      host: process.env.REDIS_HOST || "localhost",
      port: Number(process.env.REDIS_PORT) || 6379,
      maxRetriesPerRequest: null,
    });

redis.on("connect", () => {
  console.log("Redis client connected");
});

redis.on("error", (err) => {
  console.error("Redis client error:", err);
});