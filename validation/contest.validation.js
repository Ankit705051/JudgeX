import { z } from "zod";
import { ObjectIdSchema } from "./objectId.js";

export const createContestSchema = z.object({
    title: z.string().trim(),
    description: z.string().trim().optional(),
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
    visibility: z.enum(["public", "contest"]).default("public"),
});


export const getAllContestSchema=z.object({
    page:z
        .string()
        .optional()
        .transform(val => Number(val) || 1),
    limit:z
         .string()
         .optional()
         .transform(val=>Math.min(Number(val) || 20,100)),
    title:z.string().optional(),
})

export const contestIdSchema=z.object({
    id:ObjectIdSchema
})

export const updateContestSchema=z.object({
    title:z
    .string()
    .trim()
    .optional(),

    description:z
    .string()
    .trim()
    .optional(),

    startTime:z
    .coerce
    .date()
    .optional(),
    endTime:z
    .coerce
    .date()
    .optional(),

    visibility:z
    .enum(["public", "contest"])
    .optional(),
}).refine(
    (data) => Object.keys(data).length > 0,
    {
        message: "At least one field required",
        path: ["body"]
    }
).refine(
    (data) => {
        if (data.startTime && data.endTime) {
            return data.startTime < data.endTime;
        }
        return true;
    },
    {
        message: "Start time must be before end time",
        path: ["startTime"]
    }
);

export const deleteContestSchema = z.object({
    id: ObjectIdSchema
});

