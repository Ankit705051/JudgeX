import { contest } from "../schema/contest.js";
import { sendSuccess,sendError } from "../utils/response.js";  
import { contestParticipant } from "../schema/contestParticipant.js";
import { User } from "../schema/auth.js";

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
        const updatedContest=await contest.findByIdAndUpdate(
            contestId,
            {
                $inc:{
                    totalParticipants:1
                }
            }
        )
        return sendSuccess(
            res,
            201,
            "contest participant registered successfully",
            { 
                register,
                totalParticipants:updatedContest.totalParticipants
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
        .populate("userId","username email")
        .skip(skip)
        .limit(limit)
        .sort({createdAt:-1})
        const totalParticipants=await contestParticipant.countDocuments({contestId});
        return sendSuccess(
            res,200,
            "patricipants retrive successfully",
            participant,
            {
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
        .populate("userId","username email")
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
        const skip=(page-1)*limit;
        const contestdata=await contest.findById(contestId);
        if(!contestdata){
            return sendError(res,404,"contest not found");
        }
        const participants=await contestParticipant
        .find({contestId})
        .populate(
            "userId","username email",
        )
        .sort({
            score:-1,
            createdAt:1
        })
        .skip(skip)
        .limit(limit)
        .lean();
        const totalParticipants=await contestParticipant.countDocuments({contestId});

        const leaderboard=participants.map((participant,index)=>{
            return {
                ...participant,
                rank:skip+index+1,
                
            }
        })
        return sendSuccess(
            res,
            200,
            "leaderboard retrieved successfully",
            {
                leaderboard,
                pagination:{
                    totalParticipants,
                    currentPage:page,
                    totalPages:Math.ceil(totalParticipants/limit),
                    limit
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