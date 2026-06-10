import express from "express";
import { createProblem, getAllProblem,getProblemBySlug } from "../controllers/problem.controllers.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/create", authenticate, authorize("admin"), createProblem);
router.get("/all", authenticate, authorize("admin"), getAllProblem);
router.get("/:slug", getProblemBySlug);

export default router;