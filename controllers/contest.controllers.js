import {contest} from "../schema/contest.js";
import {sendError,sendSuccess} from "../utils/response.js";
import {contestProblem} from "../schema/contestProblem.js";
import { getContestLeaderboard as calculateLeaderboard } from "../services/contestLeaderboard.js";

const updateContestStatus = (contestData) => {
    // Use IST timezone (UTC+5:30)
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
    const istNow = new Date(now.getTime() + istOffset);

    const start = new Date(contestData.startTime);
    const end = new Date(contestData.endTime);

    // Also convert start and end times to IST for comparison
    const istStart = new Date(start.getTime() + istOffset);
    const istEnd = new Date(end.getTime() + istOffset);

    if (istNow < istStart) {
        return "upcoming";
    } else if (istNow >= istStart && istNow < istEnd) {
        return "running";
    } else {
        return "ended";
    }
};

export const createContest = async (req, res) => {
    try {
        const {title,
             description,
             startTime,
             endTime,
             visibility
            }= req.validated.body;
            
            const start=new Date(startTime);
            const end=new Date(endTime);
            if(start >= end) {
                return sendError(res, 400, "Start time must be before end time");
            }
            const duration=Math.floor((end.getTime() - start.getTime()) /(1000*60*60));
            
            const tempContest = { startTime, endTime };
            const status = updateContestStatus(tempContest);

        const contests = await contest.create({ 
            title,
            description, 
            startTime, 
            endTime, 
            duration,
            visibility, 
            status,
            createdBy: req.user.id 
        });
        sendSuccess(res, 201, contests);
    } catch (error) {
        console.error(error);
        sendError(res, 500, error.message);
    }
};

export const getAllContest=async(req,res)=>{
    try{
        const{
            page=1,
            limit=20,
            title,
        }=req.validated.query;
        const skip=(page-1)*limit;
        const query={};
        if(title){
            query.title={
                $regex: title,
                $options: "i"
            };
        }
        const contests = await contest.find(query)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .select("-__v");
        
        // Update status for each contest based on current time
        for (const contestData of contests) {
            const currentStatus = updateContestStatus(contestData);
            if (contestData.status !== currentStatus) {
                contestData.status = currentStatus;
                await contestData.save();
            }
        }
        
         const totalContest=await contest.countDocuments(query);
        sendSuccess(res, 200,
            "contest retrieved successfully",
             contests,
            {
                pagination:{
                    page,
                    limit,
                    total: totalContest,
                    totalPages: Math.ceil(totalContest / limit),
                }
            }
       );
    }catch(error){
        console.error(error);
        return sendError(
            res,
            500,
            "internal server error"
        )
    }
}

export const getContestById=async(req,res)=>{
    try{
        const {id}=req.validated.params;
        const contests = await contest.findById(id);
        if(!contests){
            return sendError(res, 404, "Contest not found");
        }
        
        // Update status based on current time
        const currentStatus = updateContestStatus(contests);
        if (contests.status !== currentStatus) {
            contests.status = currentStatus;
            await contests.save();
        }
        
        sendSuccess(res, 200, "Contest retrieved successfully", contests);
    }catch(error){
        console.error(error);
        return sendError(
            res,
            500,
            "internal server error"
        )
    }
}

export const updateContest = async (req, res) => {
    try {
        const { id } = req.validated.params;
        const updateData = { ...req.validated.body };
        const existingContest = await contest.findById(id);
        if (!existingContest) {
            return sendError(res, 404, "Contest not found");
        }
        if (updateData.title) {
            const existingTitle = await contest.findOne({
                title: updateData.title,
                _id: { $ne: id }
            });
            if (existingTitle) {
                return sendError(
                    res,
                    409,
                    "Contest title already exists"
                );
            }
        }
        const start =
            updateData.startTime
                ? new Date(updateData.startTime)
                : existingContest.startTime;

        const end =
            updateData.endTime
                ? new Date(updateData.endTime)
                : existingContest.endTime;

        if (start >= end) {
            return sendError(
                res,
                400,
                "Start time must be before end time"
            );
        }
        updateData.startTime = start;
        updateData.endTime = end;
        updateData.duration = Math.floor(
            (end.getTime() - start.getTime()) /
            (1000 * 60 * 60)
        );
        const now = new Date();
        if (now < start) {
            updateData.status = "upcoming";
        } else if (now >= start && now < end) {
            updateData.status = "running";
        } else {
            updateData.status = "ended";
        }
        const updatedContest = await contest.findByIdAndUpdate(
            id,
            updateData,
            {
                new: true,
                runValidators: true,
            }
        );
        return sendSuccess(
            res,
            200,
            "Contest updated successfully",
            updatedContest
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

export const deleteContest = async (req, res) => {
    try {
        const { id } = req.validated.params;
        const existingContest = await contest.findById(id);
        if (!existingContest) {
            return sendError(res, 404, "Contest not found");
        }
        await contest.findByIdAndDelete(id);
        return sendSuccess(res, 200, "Contest deleted successfully");
    } catch (error) {
        console.error(error);
        return sendError(res, 500, "Internal server error");
    }
};

export const getContestLeaderboard = async (req, res) => {
    try {
        const { id } = req.validated.params;
        const leaderboard = await calculateLeaderboard(id);
        return sendSuccess(res, 200, "Leaderboard retrieved successfully", leaderboard);
    } catch (error) {
        console.error(error);
        return sendError(res, 500, error.message || "Internal server error");
    }
};
