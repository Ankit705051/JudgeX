import mongoose from "mongoose";

const contestParticipantSchema=new mongoose.Schema({
    contestId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"contest",
        required:true,
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    rank:{
        type:Number,
        default:0,
    },
    score:{
        type:Number,
        default:0,
    },
    totalParticipants:{
        type:Number,
        default:0,
    },
    solvedProblem:[{

        problemId:mongoose.Schema.Types.ObjectId,
        score:Number,
        solveDate:Date,
    }
    ]
})
contestParticipantSchema.index({ contestId: 1, userId: 1 }, { unique: true });

export const contestParticipant=mongoose.model("contestParticipant",contestParticipantSchema);