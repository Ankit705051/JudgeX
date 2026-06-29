import mongoose from 'mongoose';

const replySchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
        trim: true,
        minlength: 1
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    discussionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "discussion",
        required: true,
        index: true
    },
    parentReplyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Reply",
        default: null
    },
    code: [
        {
            language: String,
            code: String,
        }
    ],
    upvotes: {
        type: Number,
        default: 0
    },
    downvotes: {
        type: Number,
        default: 0
    },
    isAccepted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

export const Reply = mongoose.model("Reply", replySchema);
