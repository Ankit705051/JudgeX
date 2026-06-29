import express from 'express';
import {authenticate} from '../middleware/auth.middleware.js';
import {validate} from '../middleware/validate.middleware.js';
import {
    createDiscussion,
    getDiscussions,
    getSingleDiscussion,
    updateDiscussion,
    deleteDiscussion,
    createReply,
    getReplies,
    updateReply,
    deleteReply,
    acceptReply,
    voteDiscussion,
    voteReply,
    pinDiscussion,
    myDiscussions,
    problemDiscussions
} from '../controllers/discussion.controllers.js';
import {
    createDiscussionValidation,
    createDiscussionParamsValidation,
    getDiscussionsQueryValidation,
    getSingleDiscussionParamsValidation,
    updateDiscussionValidation,
    updateDiscussionParamsValidation,
    deleteDiscussionParamsValidation,
    createReplyValidation,
    createReplyParamsValidation,
    updateReplyValidation,
    replyParamsValidation,
    acceptReplyParamsValidation,
    voteDiscussionValidation,
    voteDiscussionParamsValidation,
    voteReplyValidation,
    voteReplyParamsValidation,
    pinDiscussionParamsValidation,
    pinDiscussionValidation,
    myDiscussionsQueryValidation,
    problemDiscussionsParamsValidation,
    problemDiscussionsQueryValidation
} from '../validation/discussion.validation.js';

const router=express.Router();
router.get('/',authenticate,validate(getDiscussionsQueryValidation,"query"),getDiscussions);
router.get('/my',authenticate,validate(myDiscussionsQueryValidation,"query"),myDiscussions);
router.get('/single/:discussionId',authenticate,validate(getSingleDiscussionParamsValidation,"params"),getSingleDiscussion);
router.get('/problem/:problemId',authenticate,validate(problemDiscussionsParamsValidation,"params"),validate(problemDiscussionsQueryValidation,"query"),problemDiscussions);
router.post('/problem/:problemId',authenticate,validate(createDiscussionValidation,"body"),validate(createDiscussionParamsValidation,"params"),createDiscussion);

router.put('/:discussionId',authenticate,validate(updateDiscussionValidation,"body"),validate(updateDiscussionParamsValidation,"params"),updateDiscussion);
router.delete('/:discussionId',authenticate,validate(deleteDiscussionParamsValidation,"params"),deleteDiscussion);

router.post('/:discussionId/replies',authenticate,validate(createReplyValidation,"body"),validate(createReplyParamsValidation,"params"),createReply);
router.get('/:discussionId/replies',authenticate,validate(createReplyParamsValidation,"params"),getReplies);
router.put('/:discussionId/replies/:replyId',authenticate,validate(updateReplyValidation,"body"),validate(replyParamsValidation,"params"),updateReply);
router.delete('/:discussionId/replies/:replyId',authenticate,validate(replyParamsValidation,"params"),deleteReply);

router.patch('/:discussionId/replies/:replyId/accept',authenticate,validate(acceptReplyParamsValidation,"params"),acceptReply);

router.patch('/:discussionId/vote',authenticate,validate(voteDiscussionValidation,"body"),validate(voteDiscussionParamsValidation,"params"),voteDiscussion);
router.patch('/:discussionId/replies/:replyId/vote',authenticate,validate(voteReplyValidation,"body"),validate(voteReplyParamsValidation,"params"),voteReply);

router.patch('/:discussionId/pin',authenticate,validate(pinDiscussionValidation,"body"),validate(pinDiscussionParamsValidation,"params"),pinDiscussion);

export default router;