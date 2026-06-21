import {contestProblem} from "../schema/contestProblem.js";
import { sendSuccess,sendError } from "../utils/response.js";
import { contest } from "../schema/contest.js";
import { Problem } from "../schema/problem.js";

export const contestProblems=async(req,res)=>{
    try{
        const {contestId} = req.validated.params;
        const {problemId,points,order}=req.validated.body;
        const contestData=await contest.findById(contestId);
        if(!contestData){
            return sendError(res,404,"Contest not found");
        }
        const problem =await Problem.findById(problemId);
        if(!problem){
            return sendError(res,404,"Problem not found");
        }
        const contestProblemData=await contestProblem.findOne({contestId,problemId});
        if(contestProblemData){
            return sendError(res,400,"Problem already added to contest");
        }
        const existingOrder=await contestProblem.findOne({contestId,order});
        if(existingOrder){
            return sendError(res,400,"Order already exists");
        }
        const problemCode=String.fromCharCode(65 + order - 1);
        const contestProblems=new contestProblem({
            contestId,
            problemId,
            problemCode,
            order,
            points
        })
        await contestProblems.save();
        sendSuccess(res,200,"Contest problems retrieved successfully",contestProblems);
    }catch(error){
        console.error(error);
        sendError(res,500,"Internal server error");
    }
}

export const getContestProblems=async(req,res)=>{
    try{
        const {contestId} = req.validated.params;
        const contestData=await contest.findById(contestId);
        if(!contestData){
            return sendError(res,404,"Contest not found");
        }
        const contestProblems=await contestProblem
        .find({contestId})
        .populate("problemId")
        .sort({order:1});

        sendSuccess(res,200,"Contest problems retrieved successfully",contestProblems);
    }catch(error){
        console.error(error);
        sendError(res,500,"Internal server error");
    }
}


export const updateContestProblem = async (req, res) => {
    try {
        const { contestId, problemId } = req.validated.params;
        const { points, order } = req.validated.body;

        const contestData = await contest.findById(contestId);

        if (!contestData) {
            return sendError(res, 404, "Contest not found");
        }

        const contestProblemData =
            await contestProblem.findOne({
                contestId,
                problemId
            });

        if (!contestProblemData) {
            return sendError(
                res,
                404,
                "Contest problem not found"
            );
        }

        if (order) {
            const existingOrder =
                await contestProblem.findOne({
                    contestId,
                    order
                });

            if (
                existingOrder &&
                existingOrder._id.toString() !==
                contestProblemData._id.toString()
            ) {
                return sendError(
                    res,
                    400,
                    "Order already exists"
                );
            }
        }

        const updatedOrder =
            order ?? contestProblemData.order;

        const updatedContestProblem =
            await contestProblem.findByIdAndUpdate(
                contestProblemData._id,
                {
                    ...(points !== undefined && { points }),
                    ...(order !== undefined && {
                        order,
                        problemCode: String.fromCharCode(
                            65 + order - 1
                        )
                    })
                },
                {
                    new: true,
                    runValidators: true
                }
            );

        return sendSuccess(
            res,
            200,
            "Contest problem updated successfully",
            updatedContestProblem
        );

    } catch (error) {
        console.error(error);

        return sendError(
            res,
            500,
            "Internal server error"
        );
    }
};


export const deleteContestProblem = async (req, res) => {
    try {
        const { contestId, problemId } = req.validated.params;
        
        const contestProblemData =
            await contestProblem.findOne({
                contestId,
                problemId
            });

        if (!contestProblemData) {
            return sendError(
                res,
                404,
                "Contest problem not found"
            );
        }

        await contestProblem.findByIdAndDelete(contestProblemData._id);

        return sendSuccess(
            res,
            200,
            "Contest problem deleted successfully"
        );
    } catch (error) {
        console.error(error);

        return sendError(
            res,
            500,
            "Internal server error"
        );
    }
};