import express from "express"
import { createTestCase,getTestCases,updateTestCase,deleteTestcase } from "../controllers/test.controllers.js"
import { authenticate,authorize } from "../middleware/auth.middleware.js"
import {createTestCaseSchema,updateTestCaseSchema,getTestCasesSchema,deleteTestCaseSchema,testCaseIdSchema} from "../validation/testcase.validation.js";
import {validate} from "../middleware/validate.middleware.js";

const router=express.Router();

router.post("/problem/:problemId",validate(createTestCaseSchema),authenticate,authorize("admin"),createTestCase)
router.get("/problem/:problemId",validate(getTestCasesSchema,"params"),authenticate,authorize("admin"),getTestCases)
router.put(
    "/:id",
    authenticate,
    authorize("admin"),
    validate(testCaseIdSchema,"params"),
    validate(updateTestCaseSchema, "body"),
    updateTestCase
);
router.delete("/:id",validate(deleteTestCaseSchema,"params"),authenticate,authorize("admin"),deleteTestcase)

export default router;  