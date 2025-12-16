import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { taskController } from "../controllers/taskController";

const router = Router();

router.use(authMiddleware);

router.get("/", taskController.list);
router.post("/", taskController.create);
router.get("/:id", taskController.getById);
router.put("/:id", taskController.update);
router.delete("/:id", taskController.remove);

export default router;
