import express from "express";
import {authenticate} from "../middleware/auth.middleware.js"
import {validate} from "../middleware/validate.middleware.js";
import {contestSubmissionSchema,contestSubmissionParamsSchema,contestgetMySubmissionQuerySchema,contestgetDetailsSubmissionQuerySchema,contestgetDetailsSubmissionParamsSchema} from "../validation/contestsubmission.validate.js"
import {submitContestProblem, getMyContestSubmissions,getcontestSubmissionDetails} from "../controllers/contestSubmission.controllers.js"

const router = express.Router();

router.post("/:contestId/:problemId/submit", authenticate, validate(contestSubmissionParamsSchema, "params"), validate(contestSubmissionSchema, "body"), submitContestProblem);
router.get("/:contestId/Mysubmissions", authenticate, validate(contestSubmissionParamsSchema, "params"), validate(contestgetMySubmissionQuerySchema, "query"), getMyContestSubmissions);
router.get("/:submissionId/submissionDetails",authenticate,validate(contestgetDetailsSubmissionQuerySchema,"body"),validate(contestgetDetailsSubmissionParamsSchema,"params"),getcontestSubmissionDetails)

export default router;