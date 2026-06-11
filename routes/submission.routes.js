import express from "express";

import {submitCode,getSubmissionById,getMySubmissions} from "../controllers/submission.controllers.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router=express.Router();

router.post("/submit",authenticate,submitCode);
router.get("/my-submissions",authenticate,getMySubmissions);
router.get("/:id",authenticate,getSubmissionById);


export default router;