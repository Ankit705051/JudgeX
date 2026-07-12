import express from "express";
import {authenticate} from "../middleware/auth.middleware.js"
import {validate} from "../middleware/validate.middleware.js";
import {contestSubmissionSchema,contestSubmissionParamsSchema,contestgetMySubmissionQuerySchema,contestgetMySubmissionParamsSchema,contestgetDetailsSubmissionQuerySchema,contestgetDetailsSubmissionParamsSchema} from "../validation/contestsubmission.validate.js"
import {submitContestProblem, getMyContestSubmissions,getcontestSubmissionDetails} from "../controllers/contestSubmission.controllers.js"

const router = express.Router();

router.post("/:contestId/:problemId/submit", authenticate, validate(contestSubmissionParamsSchema, "params"), validate(contestSubmissionSchema, "body"), submitContestProblem);
router.get("/:contestId/Mysubmissions", authenticate, validate(contestgetMySubmissionParamsSchema, "params"), validate(contestgetMySubmissionQuerySchema, "query"), getMyContestSubmissions);
router.get("/:submissionId/submissionDetails",authenticate,validate(contestgetDetailsSubmissionParamsSchema,"params"),getcontestSubmissionDetails)

export default router;