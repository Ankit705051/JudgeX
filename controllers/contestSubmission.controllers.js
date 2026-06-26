import { sendSuccess,sendError } from "../utils/response.js";
import { contest } from "../schema/contest.js";
import { contestParticipant } from "../schema/contestParticipant.js";
import {contestProblem} from "../schema/contestProblem.js"
import { Problem } from "../schema/problem.js";
import { Submission } from "../schema/submission.js";
import { submissionQueue } from "../queues/submission.queue.js";

export const submitContestProblem=async(req,res)=>{
    try{
        const userId=req.user._id;
        const {contestId,problemId}=req.validated.params;
        const {code,language}=req.validated.body;
        const contestData=await contest.findById(contestId).lean();
        if(!contestData){
            return sendError(
                res,
                404,
                "contest not found",
            )
        }
        const now=new Date();
        if(contestData.status!== "running" || contestData.startTime>now || contestData.endTime<now){
            return sendError(
                res,
                400,
                "contest is not running",
            )
        }
       
        const participant=await contestParticipant.findOne({
            contestId,
            userId,
        }).lean();
        if(!participant){
            return sendError(
                res,
                403,
                "you are not registered for this contest",
            )
        }
        const contestProblemData=await contestProblem.findOne({
            contestId,
            problemId,
        }).lean();
        if(!contestProblemData){
            return sendError(
                res,
                404,
                "problem does not belong to this contest"
            )
        }
        const problems=await Problem.findById(problemId)
        .select("_id")
        .lean();
        if(!problems){
            return sendError(
                res,
                404,
                "problem not found",
            )
        }

        const submission = await Submission.create({
            userId,
            problemId,
            code: code.trim(),
            language,
            status: "pending",
            passedTestCases: 0,
            totalTestCases: 0,
            accepted: false
        });
        await submissionQueue.add(
            "judge-submission",
            {
                submissionId: submission._id.toString(),
                contestId,
                problemId,
                userId
            },
            {
                attempts: 3,
                backoff: {
                    type: "exponential",
                    delay: 2000
                }
            }
        );

    return sendSuccess(
        res,
        201,
        "submission created successfully",
        {
            submissionId:submission._id,
            status:"pending",
            pointsAwarded:0
        }
    )
    }catch(error){
        console.error(error);
        sendError(
            res,
            500,
            "internal server error"
        )
    }
}


export const getMyContestSubmissions = async (req,res) => {
    try {
        const userId = req.user._id;
        const { contestId } =req.validated.params;
        const {
            page = 1,
            limit = 10
        } = req.validated.query;
        const skip=(page - 1) * limit;
        const submissions =
            await Submission.find({
                userId,
                contestId
            })
            .populate(
                "problemId",
                "title difficulty"
            )
            .sort({
                createdAt: -1
            })
            .skip(skip)
            .limit(limit)
            .lean();
        const totalSubmissions =
            await Submission.countDocuments({
                userId,
                contestId
            });
        return sendSuccess(
            res,
            200,
            "Submissions found",
            {
                submissions,
                pagination: {
                    totalSubmissions,
                    currentPage:
                        Number(page),
                    totalPages:
                        Math.ceil(
                            totalSubmissions /
                            limit
                        ),
                    limit:
                        Number(limit)
                }
            }
        );

    } catch (error) {

        console.error(error);

        return sendError(
            res,
            500,
            "internal server error"
        );
    }
};

export const getcontestSubmissionDetails=async(req,res)=>{
    try{
        const {submissionId}=req.validated.params;
        const submissions=await Submission.findById(submissionId).
        populate("problemId","title difficulty")
        .lean();
        if(!submissions){
            return sendError(res,404,"submissionnot found");
        }
        return sendSuccess(res,200,"submission retrived",submissions);

    }catch(error){
        console.error("error getting submissiondetails")
        return sendError(res,500,"failed to get submission details");

    }

}

const contestStatus=async(req,res)=>{
    try{

    }catch(error){

    }
}

const contestProblemAttempts=async(req,res)=>{
    try{

    }catch(error){

    }
}



