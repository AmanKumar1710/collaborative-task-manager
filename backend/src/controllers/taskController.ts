import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { taskService } from "../services/taskService";
import { createTaskSchema, updateTaskSchema } from "../utils/validation/taskSchemas";

export const taskController = {
  async create(req: AuthRequest, res: Response) {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const parseResult = createTaskSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ message: "Validation error", errors: parseResult.error.flatten() });
    }

    const task = await taskService.createTask(parseResult.data, req.userId);
    return res.status(201).json({ task });
  },

  async update(req: AuthRequest, res: Response) {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params;
    const parseResult = updateTaskSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ message: "Validation error", errors: parseResult.error.flatten() });
    }

    const updated = await taskService.updateTask(id, parseResult.data);
    if (!updated) return res.status(404).json({ message: "Task not found" });

    return res.json({ task: updated });
  },

  async remove(req: AuthRequest, res: Response) {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params;
    const deleted = await taskService.deleteTask(id);
    if (!deleted) return res.status(404).json({ message: "Task not found" });

    return res.status(204).send();
  },

  async getById(req: AuthRequest, res: Response) {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params;
    const task = await taskService.getTask(id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    return res.json({ task });
  },

  async list(req: AuthRequest, res: Response) {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const { status, priority, assignedToId, creatorId, overdueOnly } = req.query;

    const tasks = await taskService.listTasks({
      status: status as any,
      priority: priority as any,
      assignedToId: (assignedToId as string) || undefined,
      creatorId: (creatorId as string) || undefined,
      overdueOnly: overdueOnly === "true",
    });

    return res.json({ tasks });
  },
};
