import express from "express";
import { contestParamRegisterSchema, contestParticipateSchema, contestParticipantParamSchema, contestParticipantQuerySchema, contestLeaderboardQuerySchema } from "../validation/contestParticipate.validate.js";
import { validate } from "../middleware/validate.middleware.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { contestRegister, getContestParticipants, getMyContestParticipants, deleteMyContestParticipant, contestLeaderboard } from "../controllers/contestParticipant.controllers.js";
    
const router = express.Router();

router.post("/:contestId/register", authenticate, validate(contestParamRegisterSchema, "params"),validate(contestParticipateSchema, "body"), contestRegister);
router.get("/:contestId/participants", authenticate,authorize("admin"), validate(contestParticipantParamSchema, "params"),validate(contestParticipantQuerySchema, "query"), getContestParticipants);
router.get("/:contestId/my-participations", authenticate,validate(contestParticipantParamSchema, "params"), getMyContestParticipants);
router.get("/:contestId/leaderboard", authenticate,validate(contestParticipantParamSchema, "params"),validate(contestLeaderboardQuerySchema,"query"), contestLeaderboard);
router.delete("/:contestId/register", authenticate,validate(contestParticipantParamSchema, "params"), deleteMyContestParticipant);




export default router;