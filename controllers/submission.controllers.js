import { Submission } from "../schema/submission.js";
import { Problem } from "../schema/problem.js";
import mongoose from "mongoose";


const sendtError = (res, status, message) => {
    return res.status(status).json({
        success: false,
        message
    });
};
const sendtSuccess = (res, status, message, data = null) => {
    const response = {
        success: true,
        message
    };
    if (data) {
        response.data = data;
    }
    return res.status(status).json(response);
};

export const submitCode = async (req, res) => {
    try {
        const userId = req.userId;
        const { problemId, code, language } = req.body;
        if (!problemId || !code || !language) {
            return sendtError(res,400,"Problem id, code and language are required");
        }
        if (!mongoose.Types.ObjectId.isValid(problemId)) {
            return sendtError(res,400,"Invalid problem id");
        }
        const supportedLanguages = ["cpp","java","python","javascript"];
        if (!supportedLanguages.includes(language)) {
            return sendtError(res,400,"Unsupported language");
        }
        if (typeof code !== "string" || !code.trim()) {
            return sendtError(res,400,"Code cannot be empty");
        }
        const problem = await Problem.findById(problemId)
            .select("_id")
            .lean();

        if (!problem) {
            return sendtError(res,404,"Problem not found");
        }
        const submission = await Submission.create({
            userId,
            problemId,
            code: code.trim(),
            language,
            status: "pending"
        });
        return sendtSuccess(res,201,"Submission created successfully",submission);
    } catch (error) {
        console.error(
            "Error creating submission:",
            error
        );
        return sendtError(res,500,"Failed to create submission");
    }
};


export const getSubmissionById = async (req, res) => {
    try {
        const submissionId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(submissionId)) {
            return sendtError(res,400,"Invalid submission id");
        }
        const submission = await Submission.findById(submissionId)
            .populate("userId","name email")
            .populate("problemId","title difficulty")
            .lean();
        if (!submission) {
            return sendtError(res,404,"Submission not found");
        }
        return sendtSuccess(res,200,"Submission found",submission);
    } catch (error) {
        console.error(
            "Error getting submission:",
            error
        );
        return sendtError(res,500,"Failed to get submission");
    }
};

export const getMySubmissions = async (req, res) => {
    try {
        const userId = req.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(
        parseInt(req.query.limit) || 20,
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
        return sendtSuccess(res,200,"Submissions found",{
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
        return sendtError(res,500,"Failed to get submissions");
    }
};
