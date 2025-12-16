import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { userController } from "../controllers/userController";

const router = Router();

router.use(authMiddleware);

router.get("/", userController.list);

export default router;
