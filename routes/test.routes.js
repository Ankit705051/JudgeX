import express from "express"
import { createTestCase,getTestCases,updateTestCase,deleteTestcase } from "../controllers/test.controllers.js"
import { authenticate,authorize } from "../middleware/auth.middleware.js"

const router=express.Router();

router.post("/problem/:problemId",authenticate,authorize("admin"),createTestCase)
router.get("/problem/:problemId",authenticate,authorize("admin"),getTestCases)
router.put("/:id",authenticate,authorize("admin"),updateTestCase)
router.delete("/:id",authenticate,authorize("admin"),deleteTestcase)

export default router;