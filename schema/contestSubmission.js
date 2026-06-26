import mongoose from "mongoose"

 const contestSubmissionSchema=new mongoose.Schema({
    contestId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"contest",
        required:true,
    },
    submissionId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"submission",
        required:true,
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    problemId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Problem",
        required:true,
    },
    pointsAwarded:{
        type:Number,
        default:0
    },

},{
    timestamps:true
})

contestSubmissionSchema.index({
    contestId:1,
    problemId:1
})

export const contestSubmission=mongoose.model("contestSubmission",contestSubmissionSchema);