import mongoose from "mongoose";

const contestProblemSchema=new mongoose.Schema({
    contestId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"contest",
        required:true,
    },
    problemId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"problem",
        required:true,
    },
    problemCode:{
        type:String,
        required:true,
    },
    order:{
        type:Number,
        required:true,
    },
    points:{
        type:Number,
        default:100,
    },
},{
    timestamps:true,
});

contestProblemSchema.index({
    contestId:1,
    problemId:1
},{
    unique:true
}
);
export const contestProblem=mongoose.model("contestProblem",contestProblemSchema)