import {z} from "zod";
import {ObjectIdSchema} from "./objectId.js";

export const contestSubmissionSchema = z.object({
    code: z.string().trim(),
    language: z.enum(["cpp", "java", "python","javascript"])
}); 
export const contestSubmissionParamsSchema=z.object({
    contestId:ObjectIdSchema,
    problemId:ObjectIdSchema,
});

export const contestgetMySubmissionQuerySchema =
z.object({
    page: z.coerce.number()
        .int()
        .positive()
        .default(1),

    limit: z.coerce.number()
        .int()
        .positive()
        .max(100)
        .default(10),
});
export const contestgetMySubmissionParamsSchema =
z.object({
    contestId: ObjectIdSchema,
});

export const contestgetDetailsSubmissionQuerySchema =
z.object({
    page: z.coerce.number()
        .int()
        .positive()
        .default(1),

    limit: z.coerce.number()
        .int()
        .positive()
        .max(100)
        .default(10),
});
export const contestgetDetailsSubmissionParamsSchema =
z.object({
    submissionId: ObjectIdSchema,
});




