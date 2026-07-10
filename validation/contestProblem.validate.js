import {z} from "zod";
import { ObjectIdSchema } from "./objectId.js";
export const contestProblemSchema = z.object({
    problemId: ObjectIdSchema,
    points: z
    .number()
    .int()
    .positive()
    .optional(),
    order: z
    .coerce
    .number()
    .int()
    .positive()
    .optional(),
    problemCode: z
    .string()
    .trim()
    .optional()});

export const contestProblemParamsSchema = z.object({
    contestId: ObjectIdSchema
});

export const contestProblemQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10)
});

export const contestProblemUpdateSchema = z.object({
    points: z
        .coerce
        .number()
        .int()
        .positive()
        .optional(),

    order: z
        .coerce
        .number()
        .int()
        .positive()
        .optional(),
    problemCode: z
    .string()
    .trim()
    .optional()
}).refine(
    (data) => Object.keys(data).length > 0,
    {
        message: "At least one field is required",
        path: ["body"]
    }
);

export const contestProblemParamsSchemaWithProblemId=z.object({
    contestId:ObjectIdSchema,
    problemId:ObjectIdSchema
})

export const contestProblemDeleteSchema=z.object({
    contestId:ObjectIdSchema,
    problemId:ObjectIdSchema
})