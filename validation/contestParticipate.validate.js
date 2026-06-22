import { z } from "zod";
import { ObjectIdSchema } from "./objectId.js";

export const contestParamRegisterSchema = z.object({
    contestId: ObjectIdSchema,
});

export const contestParticipateSchema = z.object({
        userId: ObjectIdSchema,
});

export const contestParticipantQuerySchema = z.object({
        page: z.coerce.number().int().positive().default(1),
        limit: z.coerce.number().int().positive().default(10),
});
export const contestParticipantParamSchema = z.object({
        contestId: ObjectIdSchema,
});

export const contestParticipantIdParamSchema = z.object({
        participantId: ObjectIdSchema,
});

export const deleteMyContestParticipantSchema = z.object({
        contestId: ObjectIdSchema,
});

export const contestLeaderboardQuerySchema = z.object({
        page: z.coerce.number().int().positive().default(1),
        limit: z.coerce.number().int().positive().default(10),
});
export const contestLeaderboardParamSchema = z.object({
        contestId: ObjectIdSchema,
});