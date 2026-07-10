import { Worker } from "bullmq";
import dotenv from "dotenv";

import { redis } from "../config/redis.js";
import { connectDB } from "../database/db.js";
import { judgeSubmission } from "../services/judegXsubmission.js";


dotenv.config();


console.log("=== Submission Worker Starting ===");



const WORKER_CONCURRENCY =
    Number(process.env.WORKER_CONCURRENCY) || 20;



const startWorker = async () => {

    let submissionWorker;


    try {


        console.log("Connecting MongoDB...");

        await connectDB();

        console.log("✅ MongoDB connected");



        submissionWorker = new Worker(

            "submission-queue",


            async(job)=>{


                console.log(
                    `📋 Processing Job ${job.id}`
                );


                const {
                    submissionId,
                    contestId
                } = job.data;



                if(!submissionId){

                    throw new Error(
                        "Submission ID missing"
                    );

                }



                await judgeSubmission(

                    submissionId,

                    contestId,

                    job

                );



                return {

                    submissionId,

                    status:"completed"

                };

            },


            {
                connection: redis,
                concurrency:
                    WORKER_CONCURRENCY,

                limiter: {
                    max:100,

                    duration:60000

                },
                stalledInterval:30000,

                maxStalledCount:1
            }

        );

        submissionWorker.on(
            "ready",
            ()=>{

                console.log(
                    "🚀 Worker ready"
                );

            }
        );
        submissionWorker.on(
            "completed",
            (job)=>{

                console.log(
                    `✅ Job ${job.id} completed`
                );

            }
        );
        submissionWorker.on(
            "failed",
            (job,error)=>{
                console.error(
                    `Job ${job?.id} failed`,
                    error.message
                );
            }
        );
        submissionWorker.on(
            "error",
            (error)=>{

                console.error(
                    "Worker Error:",
                    error
                );

            }
        );

        console.log(
`
================================
Submission Worker Started

Concurrency : ${WORKER_CONCURRENCY}

================================
`
        );

        const shutdown = async()=>{
            console.log(
                "Closing worker..."
            );
            await submissionWorker.close();
            await redis.quit();
            console.log(
                "Worker closed"
            );
            process.exit(0);

        };
        process.on(
            "SIGTERM",
            shutdown
        );
        process.on(
            "SIGINT",
            shutdown
        );
    }
    catch(error){
        console.error(
            "Worker startup error:",
            error
        );
        process.exit(1);

    }

};
startWorker();