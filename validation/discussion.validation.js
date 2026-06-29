import { z } from "zod";
import { ObjectIdSchema } from "./objectId.js";

export const createDiscussionValidation = z.object({
  title: z.string().trim().min(1, "Title is required"),
  content: z.string().trim().min(1, "Content is required"),

  tags: z.array(z.string().trim()).optional(),

  code: z
    .array(
      z.object({
        language: z.string().trim().min(1, "Language is required"),
        code: z.string().min(1, "Code is required"),
      })
    )
    .optional(),
});

export const createDiscussionParamsValidation = z.object({
  problemId: ObjectIdSchema,
});

export const getDiscussionsQueryValidation = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().trim().optional(),
  tag: z.string().trim().optional(),
});

export const getSingleDiscussionParamsValidation = z.object({
  discussionId: ObjectIdSchema,
});

export const updateDiscussionValidation = z.object({
  title: z.string().trim().min(1, "Title is required").optional(),
  content: z.string().trim().min(1, "Content is required").optional(),
  tags: z.array(z.string().trim()).optional(),
  code: z
    .array(
      z.object({
        language: z.string().trim().min(1, "Language is required"),
        code: z.string().min(1, "Code is required"),
      })
    )
    .optional(),
});

export const updateDiscussionParamsValidation = z.object({
  discussionId: ObjectIdSchema,
});

export const deleteDiscussionParamsValidation = z.object({
  discussionId: ObjectIdSchema,
});

export const createReplyValidation = z.object({
  content: z.string().trim().min(1, "Content is required"),
  parentReplyId: ObjectIdSchema.nullish(),
  code: z
    .array(
      z.object({
        language: z.string().trim().min(1, "Language is required"),
        code: z.string().min(1, "Code is required"),
      })
    )
    .optional(),
});

export const createReplyParamsValidation = z.object({
  discussionId: ObjectIdSchema,
});

export const updateReplyValidation = z.object({
  content: z.string().trim().min(1, "Content is required").optional(),
  code: z
    .array(
      z.object({
        language: z.string().trim().min(1, "Language is required"),
        code: z.string().min(1, "Code is required"),
      })
    )
    .optional(),
});

export const replyParamsValidation = z.object({
  discussionId: ObjectIdSchema,
  replyId: ObjectIdSchema,
});

export const acceptReplyParamsValidation = z.object({
  discussionId: ObjectIdSchema,
  replyId: ObjectIdSchema,
});

export const voteDiscussionValidation = z.object({
  vote: z.enum(["upvote", "downvote", "remove"]),
});

export const voteDiscussionParamsValidation = z.object({
  discussionId: ObjectIdSchema,
});

export const voteReplyValidation = z.object({
  vote: z.enum(["upvote", "downvote", "remove"]),
});

export const voteReplyParamsValidation = z.object({
  discussionId: ObjectIdSchema,
  replyId: ObjectIdSchema,
});

export const pinDiscussionParamsValidation = z.object({
  discussionId: ObjectIdSchema,
});

export const pinDiscussionValidation = z.object({
  isPinned: z.boolean(),
});

export const myDiscussionsQueryValidation = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const problemDiscussionsParamsValidation = z.object({
  problemId: ObjectIdSchema,
});

export const problemDiscussionsQueryValidation = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
