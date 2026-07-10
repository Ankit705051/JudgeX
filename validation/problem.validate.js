import { z } from "zod";
import { ObjectIdSchema } from "./objectId.js";
import { exampleSchema, codeTemplateSchema, solutionSchema } from "./subSchema.js";

const parameterSchema = z.object({
    name: z.string().trim().min(1),
    type: z.string().trim().min(1),
});
export const createProblemSchema = z.object({
    title: z.string().trim().min(3),

    slug: z
        .string()
        .trim()
        .min(3)
        .toLowerCase(),

    description: z.string().trim().min(10),
    difficulty: z.enum(["easy", "medium", "hard"]),
    tags: z.array(z.string().trim()).optional(),
    constraints: z.string().trim().min(1),
    timeLimit: z.number().positive(),
    memoryLimit: z.number().positive(),
    examples: z.array(exampleSchema).optional(),
    codeTemplate: z.array(codeTemplateSchema).optional(),
    solution: z.array(solutionSchema).optional(),
    functionName: z.string().trim().min(1),
    parameters: z.array(parameterSchema).min(1),
    returnType: z.string().trim().min(1).optional(),
    visibility: z.enum(["public", "contest"]),
    hints: z.string().trim().optional(),
    createBy: ObjectIdSchema.optional(),
    updateBy: ObjectIdSchema.optional()
});


export const updateProblemSchema = z
    .object({
        title: z.string().trim().min(3).optional(),

        description: z
            .string()
            .trim()
            .min(10)
            .optional(),

        difficulty: z
            .enum(["easy", "medium", "hard"])
            .optional(),

        tags: z
            .array(z.string().trim())
            .optional(),

        constraints: z
            .string()
            .trim()
            .optional(),

        timeLimit: z
            .number()
            .positive()
            .optional(),

        memoryLimit: z
            .number()
            .positive()
            .optional(),

        examples: z
            .array(exampleSchema)
            .optional(),

        codeTemplate: z
            .array(codeTemplateSchema)
            .optional(),

        solution: z
            .array(solutionSchema)
            .optional(),

        functionName: z
            .string()
            .trim()
            .optional(),

        parameters: z
            .array(parameterSchema)
            .optional(),

        returnType: z
            .string()
            .trim()
            .optional(),

        visibility: z
            .enum(["public", "contest"])
            .optional(),
        hints: z
            .string()
            .trim()
            .optional(),

        updateBy: ObjectIdSchema.optional()
    })
    .refine(
        (data) => Object.keys(data).length > 0,
        {
            message: "At least one field required",
            path: ["body"]
        }
    );
export const problemIdSchema = z.object({
  id: ObjectIdSchema
});
export const slugSchema = z.object({
  slug: z.string().trim().min(1)
});


export const getAllProblemQuerySchema = z.object({
    page: z
        .string()
        .optional()
        .transform(val => Number(val) || 1),

    limit: z
        .string()
        .optional()
        .transform(val => Math.min(Number(val) || 10, 100)),

    title: z
        .string()
        .trim()
        .optional()
        .transform(val => val || undefined),

    slug: z
        .string()
        .trim()
        .optional()
        .transform(val => val || undefined),

    difficulty: z.preprocess(
        val => val === "" ? undefined : val,
        z.enum(["easy", "medium", "hard"]).optional()
    ),

    tags: z
        .string()
        .optional()
        .transform(val => val?.trim() || undefined)
});
