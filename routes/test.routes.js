import express from "express"
import { createTestCase } from "../controllers/test.controllers.js"
import { authenticate,authorize } from "../middleware/auth.middleware.js"

const router=express.Router();

router.post("/problem/:problemId",authenticate,authorize("admin"),createTestCase)

export default router;