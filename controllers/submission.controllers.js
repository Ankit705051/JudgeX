import { Submission } from "../schema/submission.js";
import { Problem } from "../schema/problem.js";
import mongoose from "mongoose";        
import { sendSuccess,sendError } from "../utils/response.js";
import { submissionQueue } from "../queues/submission.queue.js";

export const submitCode = async (req, res) => {
    try {
        const userId = req.user._id;
        const { problemId, code, language } = req.validated.body;


        console.log("RECEIVED problemId:", problemId);

const exists = await Problem.findById(problemId);

console.log("PROBLEM FOUND:", exists);
        const problem = await Problem.findById(problemId)
            .select("_id")
            .lean();

        if (!problem) {
            return sendError(res,404,"Problem not found");
        }
        const submission = await Submission.create({
            userId,
            problemId,
            code: code.trim(),
            language,
            status: "pending"
        });
        // Never execute user code in the API process.  The worker owns judging,
        // which keeps this endpoint responsive and gives pending submissions the
        // same lifecycle as contest submissions.
        await submissionQueue.add(
            "judge-submission",
            { submissionId: submission._id.toString() },
            {
                attempts: 3,
                backoff: { type: "exponential", delay: 2000 },
                removeOnComplete: 1000,
                removeOnFail: 1000
            }
        );

        // Match the contest-submission response and the frontend polling
        // contract. Mongoose documents expose `_id`, but clients must not need
        // to know that persistence detail.
        return sendSuccess(res, 201, "Submission queued for judging", {
            submissionId: submission._id.toString(),
            status: submission.status,
            passedTestCases: 0,
            totalTestCases: 0
        });
    } catch (error) {
        console.error(
            "Error creating submission:",
            error
        );
        return sendError(res,500,"Failed to create submission");
    }
};


export const getSubmissionById = async (req, res) => {
    try {
        const submissionId = req.validated.params.id;
        const submission = await Submission.findById(submissionId)
            .populate("userId","name email")
            .populate("problemId","title difficulty")
            .lean();
        if (!submission) {
            return sendError(res,404,"Submission not found");
        }
        return sendSuccess(res,200,"Submission found",submission);
    } catch (error) {
        console.error(
            "Error getting submission:",
            error
        );
        return sendError(res,500,"Failed to get submission");
    }
};

export const getMySubmissions = async (req, res) => {
    try {
        const userId = req.user._id;
        const page = parseInt(req.validated.query.page) || 1;
        const limit = Math.min(
        parseInt(req.validated.query.limit) || 20,
        100
       );
       const skip = (page - 1) * limit;
        const submissions = await Submission.find({ userId })
            .populate("problemId","title difficulty")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const totalSubmissions = await Submission.countDocuments({ userId });
        return sendSuccess(res,200,"Submissions found",{
           submissions,
                pagination: {
                    totalSubmissions,
                    currentPage: page,
                    totalPages: Math.ceil(
                        totalSubmissions / limit
                    ),
                    limit
                }
        });
    } catch (error) {
        console.error(
            "Error getting submissions:",
            error
        );
        return sendError(res,500,"Failed to get submissions");
    }   
};
