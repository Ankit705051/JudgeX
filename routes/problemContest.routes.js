import express from "express";
import { contestProblems,getContestProblems,updateContestProblem,deleteContestProblem } from "../controllers/contestProblem.controllers.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { contestProblemSchema ,contestProblemParamsSchema,contestProblemQuerySchema,contestProblemUpdateSchema,contestProblemParamsSchemaWithProblemId,contestProblemDeleteSchema } from "../validation/contestProblem.validate.js";

const router = express.Router();

router.post("/:contestId/problems", authenticate,authorize("admin"), validate(contestProblemSchema,"body"), validate(contestProblemParamsSchema,"params"), contestProblems);
router.get("/:contestId/problems", authenticate,authorize("admin"), validate(contestProblemParamsSchema,"params"), validate(contestProblemQuerySchema,"query"), getContestProblems);
router.put("/:contestId/problems/:problemId", authenticate,authorize("admin"), validate(contestProblemParamsSchemaWithProblemId,"params"), validate(contestProblemUpdateSchema,"body"), updateContestProblem);
router.delete("/:contestId/problems/:problemId", authenticate,authorize("admin"), validate(contestProblemDeleteSchema,"params"), deleteContestProblem);

export default router;