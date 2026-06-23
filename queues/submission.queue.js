import {Queue} from "bullmq";
import {redis} from "../config/redis.js"

export const submissionQueue=new Queue(
    "submission-queue",
    {connection:redis}
);