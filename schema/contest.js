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
    stratTime:{
        type:Date,
        required:true,
    },
    endTime:{
        type:Date,
        required:true,
    },
    duration:{
        tyep:Number,
        required:true
    },
    visibility:{
        type:String,
        enum:["public","contest"],
        defualt:"prublic",

    },
    status:{
        type:String,
        enum:["upcoming","running","ended"],
        defualt:"upcoming",
    },
    totalParticipants:{
        type:Number,
        defualt:0,
    }
},{timestamps:true}
)
export const contest=mongoose.model("contest",contestSchem);