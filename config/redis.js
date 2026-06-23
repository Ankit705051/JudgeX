import IORedis from "ioredis";

export const redis = new IORedis({
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || 6379,
    maxRetriesPerRequest: null,
});

redis.on("connect", () => {
    console.log("Redis client connected");
});

redis.on("error", (err) => {
    console.error("Redis client error:", err);
});