import { Types } from "mongoose";
import { taskRepository, TaskQueryFilters } from "../repositories/taskRepository";
import { CreateTaskInput, UpdateTaskInput } from "../utils/validation/taskSchemas";
import { emitTaskUpdated, emitTaskAssigned } from "./socketEvents";

export const taskService = {
  async createTask(input: CreateTaskInput, creatorId: string) {
    const doc = await taskRepository.create({
      title: input.title,
      description: input.description,
      dueDate: new Date(input.dueDate),
      priority: input.priority,
      status: input.status,
      creatorId: new Types.ObjectId(creatorId),
      assignedToId: new Types.ObjectId(input.assignedToId),
    } as any);

    emitTaskUpdated(doc);
    emitTaskAssigned(doc);

    return doc;
  },

    async updateTask(taskId: string, input: UpdateTaskInput) {
    const existing = await taskRepository.findById(taskId);
    if (!existing) return null;

    const updates: any = { ...input };
    if (input.dueDate) {
      updates.dueDate = new Date(input.dueDate);
    }
    if (input.assignedToId) {
      updates.assignedToId = new Types.ObjectId(input.assignedToId);
    }

    const updated = await taskRepository.updateById(taskId, updates);
    if (!updated) return null;

    emitTaskUpdated(updated);

    const assignmentChanged =
      input.assignedToId &&
      input.assignedToId.toString() !== existing.assignedToId.toString();

    if (assignmentChanged) {
      emitTaskAssigned(updated);
    }

    return updated;
  },


  async deleteTask(taskId: string) {
    return taskRepository.deleteById(taskId);
  },

  async getTask(taskId: string) {
    return taskRepository.findById(taskId);
  },

  async listTasks(filters: TaskQueryFilters) {
    return taskRepository.list(filters);
  },
};
