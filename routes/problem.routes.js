import express from "express";
import { createProblem, getAllProblem,getProblemBySlug,updateProblem,deleteProblem } from "../controllers/problem.controllers.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/create", authenticate, authorize("admin"), createProblem);
router.get("/all", authenticate, authorize("admin"), getAllProblem);
router.get("/:slug", getProblemBySlug);
router.put("/:id", authenticate, authorize("admin"), updateProblem);
router.delete("/:id", authenticate, authorize("admin"), deleteProblem);

export default router;