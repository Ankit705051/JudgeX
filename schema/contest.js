import mongoose from "mongoose"


const contestSchem=new mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim:true,
    },
    description:{
        type:String,
        default:"",
    },
    createdBy:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"user",
    required:true,
    },
    startTime:{
        type:Date,
        required:true,
    },
    endTime:{
        type:Date,
        required:true,
    },
    duration:{
        type:Number,
        required:true
    },
    visibility:{
        type:String,
        enum:["public","contest"],
        default:"public",

    },
    status:{
        type:String,
        enum:["upcoming","running","ended"],
        default:"upcoming",
    },
    totalParticipants:{
        type:Number,
        default:0,
    }
},{timestamps:true}
)
export const contest=mongoose.model("contest",contestSchem);