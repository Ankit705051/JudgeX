import { Queue } from "bullmq";
import { redis } from "../config/redis.js";


export const submissionQueue = new Queue(
    "submission-queue",
    {
        connection: redis,

        defaultJobOptions: {

            attempts: 3,

            backoff: {
                type: "fixed",
                delay: 2000
            },

            removeOnComplete: true,

            removeOnFail: false
        }
    }
);