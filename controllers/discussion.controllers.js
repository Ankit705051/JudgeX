import { discussion } from "../schema/discussion.js";
import {sendError,sendSuccess} from "../utils/response.js";
import {Problem} from "../schema/problem.js"
import {Reply} from "../schema/reply.js"

export const createDiscussion=async(req,res)=>{
    try{
        const userId=req.user._id;
        const {problemId}=req.validated.params;
        const{title,content,tags,code}=req.validated.body;

        const existingProblem=await Problem.findById(problemId);
        if(!existingProblem){
            return sendError(res,404,"Problem not found");
        }   

        const discussions=await discussion.create({
            problemId,
            userId,
            title,
            content,
            tags:tags || [],
            code:code || [],
            isPinned:false,
            upvotes:0,
            downvotes:0,
            views:0,
            replies:0,
        });
        return sendSuccess(res,201,"Discussion created successfully",discussions);
    }catch(error){
        console.error(error)
        return sendError(res,500,"internal server error ");
    }
}

export const getDiscussions=async(req,res)=>{
    try{
         const {page=1,limit=20,search,tag}=req.validated.query;
         const filter={};
         if(tag){
            filter.tags=tag;
         }
         if(search){
            filter.$text={$search:search};
         }

         const discussions=await discussion.find(filter)
         .sort({isPinned:-1,createdAt:-1})
         .skip((page-1)*limit)
         .limit(Number(limit));
         return sendSuccess(
            res,
            200,
            "Discussions retrieved successfully",
            discussions
         )
    }catch(error){
        console.error(error)
        return sendError(res,500,"internal server error ");
    }
}

export const getSingleDiscussion=async(req,res)=>{
    try{
        const {discussionId}=req.validated.params;
        const userId=req.user._id;

        const singleDiscussion=await discussion.findById(discussionId)
            .populate('userId','name email')
            .populate('problemId','title');

        if(!singleDiscussion){
            return sendError(res,404,"Discussion not found");
        }

        await discussion.findByIdAndUpdate(discussionId,{$inc:{views:1}});

        return sendSuccess(res,200,"Discussion retrieved successfully",singleDiscussion);
    }catch(error){
        console.error(error)
        return sendError(res,500,"internal server error ");
    }
}

export const updateDiscussion=async(req,res)=>{
    try{
        const userId=req.user._id;
        const {discussionId}=req.validated.params;
        const{title,content,tags,code}=req.validated.body;

        const existingDiscussion=await discussion.findById(discussionId);
        if(!existingDiscussion){
            return sendError(res,404,"Discussion not found");
        }

        if(existingDiscussion.userId.toString()!==userId.toString()){
            return sendError(res,403,"You can only update your own discussions");
        }

        const updatedDiscussion=await discussion.findByIdAndUpdate(
            discussionId,
            {title,content,tags,code},
            {new:true,runValidators:true}
        );

        return sendSuccess(res,200,"Discussion updated successfully",updatedDiscussion);
    }catch(error){
        console.error(error)
        return sendError(res,500,"internal server error ");
    }
}

export const deleteDiscussion=async(req,res)=>{
    try{
        const userId=req.user._id;
        const {discussionId}=req.validated.params;

        const existingDiscussion=await discussion.findById(discussionId);
        if(!existingDiscussion){
            return sendError(res,404,"Discussion not found");
        }

        if(existingDiscussion.userId.toString()!==userId.toString()){
            return sendError(res,403,"You can only delete your own discussions");
        }

        await Reply.deleteMany({discussionId});
        await discussion.findByIdAndDelete(discussionId);

        return sendSuccess(res,200,"Discussion deleted successfully");
    }catch(error){
        console.error(error)
        return sendError(res,500,"internal server error ");
    }
}

export const createReply=async(req,res)=>{
    try{
        const userId=req.user._id;
        const {discussionId}=req.validated.params;
        const{content,parentReplyId,code}=req.validated.body;

        const existingDiscussion=await discussion.findById(discussionId);
        if(!existingDiscussion){
            return sendError(res,404,"Discussion not found");
        }

        if(parentReplyId){
            const parentReply=await Reply.findById(parentReplyId);
            if(!parentReply){
                return sendError(res,404,"Parent reply not found");
            }
        }

        const reply=await Reply.create({
            content,
            userId,
            discussionId,
            parentReplyId:parentReplyId || null,
            code:code || [],
        });

        await discussion.findByIdAndUpdate(discussionId,{$inc:{replies:1}});

        return sendSuccess(res,201,"Reply created successfully",reply);
    }catch(error){
        console.error(error)
        return sendError(res,500,"internal server error ");
    }
}

export const getReplies=async(req,res)=>{
    try{
        const {discussionId}=req.validated.params;

        const replies=await Reply.find({discussionId})
            .populate('userId','name email')
            .sort({createdAt:-1});

        return sendSuccess(res,200,"Replies retrieved successfully",replies);
    }catch(error){
        console.error(error)
        return sendError(res,500,"internal server error ");
    }
}

export const updateReply=async(req,res)=>{
    try{
        const userId=req.user._id;
        const {discussionId,replyId}=req.validated.params;
        const{content,code}=req.validated.body;

        const existingReply=await Reply.findById(replyId);
        if(!existingReply){
            return sendError(res,404,"Reply not found");
        }

        if(existingReply.userId.toString()!==userId.toString()){
            return sendError(res,403,"You can only update your own replies");
        }

        const updatedReply=await Reply.findByIdAndUpdate(
            replyId,
            {content,code},
            {new:true,runValidators:true}
        );

        return sendSuccess(res,200,"Reply updated successfully",updatedReply);
    }catch(error){
        console.error(error)
        return sendError(res,500,"internal server error ");
    }
}

export const deleteReply=async(req,res)=>{
    try{
        const userId=req.user._id;
        const {discussionId,replyId}=req.validated.params;

        const existingReply=await Reply.findById(replyId);
        if(!existingReply){
            return sendError(res,404,"Reply not found");
        }

        if(existingReply.userId.toString()!==userId.toString()){
            return sendError(res,403,"You can only delete your own replies");
        }

        await Reply.deleteMany({parentReplyId:replyId});
        await Reply.findByIdAndDelete(replyId);

        await discussion.findByIdAndUpdate(discussionId,{$inc:{replies:-1}});

        return sendSuccess(res,200,"Reply deleted successfully");
    }catch(error){
        console.error(error)
        return sendError(res,500,"internal server error ");
    }
}

export const acceptReply=async(req,res)=>{
    try{
        const userId=req.user._id;
        const {discussionId,replyId}=req.validated.params;

        const existingDiscussion=await discussion.findById(discussionId);
        if(!existingDiscussion){
            return sendError(res,404,"Discussion not found");
        }

        if(existingDiscussion.userId.toString()!==userId.toString()){
            return sendError(res,403,"Only discussion owner can accept a reply");
        }

        const existingReply=await Reply.findById(replyId);
        if(!existingReply){
            return sendError(res,404,"Reply not found");
        }

        if(existingDiscussion.acceptedReplyId){
            await Reply.findByIdAndUpdate(existingDiscussion.acceptedReplyId,{isAccepted:false});
        }

        await Reply.findByIdAndUpdate(replyId,{isAccepted:true});
        const updatedDiscussion=await discussion.findByIdAndUpdate(
            discussionId,
            {acceptedReplyId:replyId},
            {new:true}
        );

        return sendSuccess(res,200,"Reply accepted successfully",updatedDiscussion);
    }catch(error){
        console.error(error)
        return sendError(res,500,"internal server error ");
    }
}

export const voteDiscussion=async(req,res)=>{
    try{
        const userId=req.user._id;
        const {discussionId}=req.validated.params;
        const {vote}=req.validated.body;

        const existingDiscussion=await discussion.findById(discussionId);
        if(!existingDiscussion){
            return sendError(res,404,"Discussion not found");
        }

        const updateData={};
        if(vote==="upvote"){
            updateData.$inc={upvotes:1};
        }else if(vote==="downvote"){
            updateData.$inc={downvotes:1};
        }

        const updatedDiscussion=await discussion.findByIdAndUpdate(
            discussionId,
            updateData,
            {new:true}
        );

        return sendSuccess(res,200,"Vote recorded successfully",updatedDiscussion);
    }catch(error){
        console.error(error)
        return sendError(res,500,"internal server error ");
    }
}

export const voteReply=async(req,res)=>{
    try{
        const userId=req.user._id;
        const {discussionId,replyId}=req.validated.params;
        const {vote}=req.validated.body;

        const existingReply=await Reply.findById(replyId);
        if(!existingReply){
            return sendError(res,404,"Reply not found");
        }

        const updateData={};
        if(vote==="upvote"){
            updateData.$inc={upvotes:1};
        }else if(vote==="downvote"){
            updateData.$inc={downvotes:1};
        }

        const updatedReply=await Reply.findByIdAndUpdate(
            replyId,
            updateData,
            {new:true}
        );

        return sendSuccess(res,200,"Vote recorded successfully",updatedReply);
    }catch(error){
        console.error(error)
        return sendError(res,500,"internal server error ");
    }
}

export const pinDiscussion=async(req,res)=>{
    try{
        const userId=req.user._id;
        const {discussionId}=req.validated.params;
        const {isPinned}=req.validated.body;

        const existingDiscussion=await discussion.findById(discussionId);
        if(!existingDiscussion){
            return sendError(res,404,"Discussion not found");
        }

        const updatedDiscussion=await discussion.findByIdAndUpdate(
            discussionId,
            {isPinned},
            {new:true}
        );

        return sendSuccess(res,200,"Discussion pin status updated",updatedDiscussion);
    }catch(error){
        console.error(error)
        return sendError(res,500,"internal server error ");
    }
}

export const myDiscussions=async(req,res)=>{
    try{
        const userId=req.user._id;
        const {page=1,limit=20}=req.validated.query;

        const discussions=await discussion.find({userId})
            .populate('problemId','title')
            .sort({createdAt:-1})
            .skip((page-1)*limit)
            .limit(Number(limit));

        return sendSuccess(res,200,"My discussions retrieved successfully",discussions);
    }catch(error){
        console.error(error)
        return sendError(res,500,"internal server error ");
    }
}

export const problemDiscussions=async(req,res)=>{
    try{
        const {problemId}=req.validated.params;
        const {page=1,limit=20}=req.validated.query;

        const discussions=await discussion.find({problemId})
            .populate('userId','name email')
            .sort({isPinned:-1,createdAt:-1})
            .skip((page-1)*limit)
            .limit(Number(limit));

        return sendSuccess(res,200,"Problem discussions retrieved successfully",discussions);
    }catch(error){
        console.error(error)
        return sendError(res,500,"internal server error ");
    }
}