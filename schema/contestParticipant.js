import mongoose from "mongoose";

const contestParticipantSchema=new mongoose.Schema({
    contestId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"contest",
        required:true,
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true,
    },
    score:{
        type:Number,
        default:0,
    },
    solvedProblem:[{

        problemId:mongoose.Schema.types.ObjectId,
        score:Number,
        solveDate:Date,
    }
    ]
})

export const contestParticipant=mongoose.model("contestParticipant",contestParticipantSchema);