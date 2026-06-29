import mongoose from 'mongoose';


const discussionSchems=new mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim:true,
        minlength:1,
        index:"text"
    },
    code:[
         {
            language:String,
            code:String,
         }
    ],
    tags:{
        type:[String],
        index:true,
    },
    content:{
        type:String,
        required:true,
        minlength:1,
        trim:true
    },
    problemId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Problem",
        required:true,
        index:true
    },

    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
        index:true
    },

    isPinned:{
        type:Boolean,
        default:false
    },
    acceptedReplyId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Reply" 
    },
    views:{
        type:Number,
        default:0
    },
    replies:{
        type:Number,
        default:0
    },
    upvotes:{
        type:Number,
        default:0
    },
    downvotes:{
        type:Number,
        default:0
    }
},{
    timestamps:true
})

export const discussion=mongoose.model("discussion",discussionSchems);