import { Worker } from "bullmq";
import { redis } from "../config/redis.js";
import { judgeSubmission } from "../services/judegXsubmission.js";
import { connectDB } from "../database/db.js";
import dotenv from "dotenv";
dotenv.config();
import { getIo } from "../socket/socket.js";
console.log("iO",getIo())
const io = getIo();
const startWorker = async () => {
    await connectDB();

    const submissionWorker = new Worker(
        "submission-queue",
        async (job) => {
            const { submissionId } = job.data;

            console.log("Processing:", submissionId);

            await judgeSubmission(submissionId);

            console.log("Done:", submissionId);
        },
        {
            connection: redis
        }
    );

    submissionWorker.on("completed", (job) => {
        console.log(`Job ${job.id} completed`);
    });

    submissionWorker.on("failed", (job, err) => {
        console.log(`Job ${job?.id} failed: ${err.message}`);
    });
};

startWorker();