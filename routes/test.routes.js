import express from "express"
import { createTestCase,getTestCases,updateTestCase,deleteTestcase,bulkCreateTestCase } from "../controllers/test.controllers.js"
import { authenticate,authorize } from "../middleware/auth.middleware.js"
import {createTestCaseSchema,updateTestCaseSchema,getTestCasesSchema,deleteTestCaseSchema,testCaseIdSchema,bulkCreateTestCaseSchema} from "../validation/testcase.validation.js";
import {validate} from "../middleware/validate.middleware.js";

const router=express.Router();

router.post(
    "/problem/:problemId/bulk",
    authenticate,
    authorize("admin"),
    validate(getTestCasesSchema, "params"),
    validate(bulkCreateTestCaseSchema, "body"),
    bulkCreateTestCase
);

router.post(
    "/problem/:problemId",
    authenticate,
    authorize("admin"),
    validate(getTestCasesSchema, "params"),
    validate(createTestCaseSchema, "body"),
    createTestCase
);

router.get(
    "/problem/:problemId",
    authenticate,
    authorize("admin"),
    validate(getTestCasesSchema, "params"),
    getTestCases
);

router.put(
    "/:id",
    authenticate,
    authorize("admin"),
    validate(testCaseIdSchema, "params"),
    validate(updateTestCaseSchema, "body"),
    updateTestCase
);

router.delete(
    "/:id",
    authenticate,
    authorize("admin"),
    validate(deleteTestCaseSchema, "params"),
    deleteTestcase
);

export default router;  