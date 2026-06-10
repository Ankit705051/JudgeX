import express from "express";

import {submitCode} from "../controllers/submission.controllers.js";
import { authenticate,authorize } from "../middleware/auth.middleware.js";

const router=express.Router();

router.post("/submit",authenticate,submitCode);

export default router;