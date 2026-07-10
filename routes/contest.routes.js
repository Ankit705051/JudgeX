import express from "express";
import { createContest ,getAllContest,getContestById,updateContest  ,deleteContest ,getContestLeaderboard} from "../controllers/contest.controllers.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/auth.middleware.js";
import { createContestSchema,getAllContestSchema,contestIdSchema,updateContestSchema,deleteContestSchema } from "../validation/contest.validation.js";
import { validate } from "../middleware/validate.middleware.js";

const router = express.Router();

router.post("/create", authenticate, authorize("admin"), validate(createContestSchema), createContest);
router.get("/all",authenticate,validate(getAllContestSchema,"query"),getAllContest);
router.get("/:id",authenticate,validate(contestIdSchema,"params"),getContestById);
router.get("/:id/leaderboard", authenticate, validate(contestIdSchema,"params"), getContestLeaderboard);
router.put("/:id",authenticate,authorize("admin"),validate(contestIdSchema,"params"),validate(updateContestSchema),updateContest);
router.delete("/:id",authenticate,authorize("admin"),validate(deleteContestSchema,"params"),deleteContest);

export default router;