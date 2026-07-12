import { contest } from "../schema/contest.js";
import { sendSuccess,sendError } from "../utils/response.js";  
import { contestParticipant } from "../schema/contestParticipant.js";
import { getUserRank, getLeaderboard } from "../services/leaderboard.service.js";
import { User } from "../schema/auth.js";
import { truncates } from "bcryptjs";

export const contestRegister=async(req,res)=>{
    try{
        const {contestId}=req.validated.params;
        const userId=req.user._id;
        const contests=await contest.findById(contestId);
        if(!contests){
            return sendError(res,404,"contest not found");
        }
      if(contests.status === "ended"){
            return sendError(res,400,"Contest has ended");
        }
        const existingParticipant=await contestParticipant.findOne({userId,contestId});
        if(existingParticipant){
            return sendError(res,400,"user already registered for this contest");
        }
        const register=new contestParticipant({
          contestId,
          userId,
          score:0,
          rank:null,
          solvedProblem:[]
        })
        await register.save();

        // Initialize user in Redis leaderboard with score 0
        const { redis } = await import("../config/redis.js");
        await redis.zadd(`leaderboard:${contestId}`, 0, userId.toString());

        const updatedContest=await contest.findByIdAndUpdate(
            contestId,
            {
                $inc:{
                    totalParticipants:1
                },
            },{
                new:true
            }
        )
        return sendSuccess(
            res,
            201,
            "contest participant registered successfully",
            {
                register,
                totalParticipants:updatedContest.totalParticipants,
            }

        );

    }catch(error){
        console.error(error);
        sendError(
            res,
            500,
            "internal server error"
        )
    }
}


export const getContestParticipants=async(req,res)=>{
    try{
        const{contestId}=req.validated.params;
        const {
            page,
            limit,

        } =req.validated.query;
        const skip=(page-1)*limit;
        
        const contestdata=await contest.findById(contestId);
        if(!contestdata){
            return sendError(res,400,"contest not found");
        }

        const participant=await contestParticipant.find({contestId})
        .populate("userId","userName email")
        .skip(skip)
        .limit(limit)
        .sort({createdAt:-1})
        const totalParticipants=await contestParticipant.countDocuments({contestId});
        return sendSuccess(
            res,200,
            "patricipants retrive successfully",
            {
                participants: participant,
                pagination:{
                totalParticipants,
                currentPage:page,
                totalPages:Math.ceil(totalParticipants/limit),
                limit
               }
            }
        )

    }catch(error){
        console.error(error);
        sendError(
            res,
            500,
            "Internal server error"
        )
    }
}

export const getMyContestParticipants=async(req,res)=>{
    try{
        const{contestId}=req.validated.params;
        const userId=req.user._id;
        const participant=await contestParticipant.findOne({contestId,userId})
        .populate("userId","userName email")
        .populate("contestId","title description");
        if(!participant){
            return sendError(res,404,"participant not found");
        }
        return sendSuccess(
            res,
            200,
            "participant retrieved successfully",
            participant
        );
    }catch(error){
        console.error(error);
        sendError(
            res,
            500,
            "Internal server error"
        )
    }
}
export const contestLeaderboard=async(req,res)=>{
    try{
        const{contestId}=req.validated.params;
        const {page=1,limit=10}=req.validated.query;
        const contestdata=await contest.findById(contestId);
        if(!contestdata){
            return sendError(res,404,"contest not found");
        }
        const leaderboard=await getLeaderboard(
            contestId,
            Number(page),
            Number(limit)
        );

        console.log("Raw leaderboard from Redis:", leaderboard);

        const totalParticipants = await contestParticipant.countDocuments({contestId});
        const populatedLeaderboard = await Promise.all(
            leaderboard.map(async (entry) => {
                try {
                    const userData = await User.findById(entry.userId).select("userName name email").lean();
                    const participantData = await contestParticipant.findOne({contestId, userId: entry.userId}).lean();
                    const finalEntry = {
                        ...entry,
                        username: userData ? userData.userName || userData.name : `User ${entry.userId}`,
                        email: userData ? userData.email : "",
                        solvedProblems: participantData?.solvedProblem?.length || 0
                    };
                    if (participantData && participantData.score > 0 && entry.score === 0) {
                        finalEntry.score = participantData.score;
                    }
                    console.log("Final entry:", finalEntry);
                    return finalEntry;
                } catch (err) {
                    return {
                        ...entry,
                        username: `User ${entry.userId}`,
                        solvedProblems: 0
                    };
                }
            })
        );

        return sendSuccess(
            res,
            200,
            "leaderboard retrieved successfully",
            {
                leaderboard: populatedLeaderboard,
                pagination: {
                    currentPage: Number(page),
                    totalPages: Math.ceil(totalParticipants / limit),
                    totalParticipants,
                    limit: Number(limit)
                }
            }
        );
    }catch(error){
        console.error(error);
        return sendError(
            res,
            500,
            "Internal server error"
        )
    }
}

export const getMyRank=async(req,res)=>{
    try{
    const {contestId}=req.validated.params;
    const userId=req.user._id;
    const rank=await getUserRank(contestId,userId);
    return sendSuccess(
        res,
        200,
        "rank retrieved successfully",
        {
            rank
        }
    );
  }catch(error){
    console.error(error);
    return sendError(res,500,"internal server error ");
  }
}

export const deleteMyContestParticipant = async (req, res) => {
    try {
        const { contestId } = req.validated.params;
        const userId = req.user._id;
        const contestData = await contest.findById(contestId);
        if (!contestData) {
            return sendError(
                res,
                404,
                "Contest not found"
            );
        }
        if (contestData.status !== "upcoming") {
            return sendError(
                res,
                400,
                "Cannot unregister after contest starts"
            );
        }
        const participant =
            await contestParticipant.findOneAndDelete({
                contestId,
                userId
            });

        if (!participant) {
            return sendError(
                res,
                404,
                "Participant not found"
            );
        }
        await contest.findByIdAndUpdate(
            contestId,
            {
                $inc: {
                    totalParticipants: -1
                }
            }
        );
        return sendSuccess(
            res,
            200,
            "Contest registration cancelled successfully"
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


