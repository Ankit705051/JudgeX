import express from "express"
import { createTestCase,getTestCases,updateTestCase } from "../controllers/test.controllers.js"
import { authenticate,authorize } from "../middleware/auth.middleware.js"

const router=express.Router();

router.post("/problem/:problemId",authenticate,authorize("admin"),createTestCase)
router.get("/problem/:problemId",authenticate,authorize("admin"),getTestCases)
router.put("/:id",authenticate,authorize("admin"),updateTestCase)

export default router;