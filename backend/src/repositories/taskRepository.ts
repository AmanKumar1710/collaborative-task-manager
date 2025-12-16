import { TaskModel, ITask, TaskPriority, TaskStatus } from "../models/Task";

export interface TaskQueryFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedToId?: string;
  creatorId?: string;
  overdueOnly?: boolean;
}

export const taskRepository = {
  create(data: Omit<ITask, "createdAt" | "updatedAt">) {
    return TaskModel.create(data);
  },

  findById(id: string) {
    return TaskModel.findById(id).exec();
  },

  updateById(id: string, updates: Partial<ITask>) {
    return TaskModel.findByIdAndUpdate(id, updates, { new: true }).exec();
  },

  deleteById(id: string) {
    return TaskModel.findByIdAndDelete(id).exec();
  },

  list(filters: TaskQueryFilters) {
    const query: Record<string, unknown> = {};

    if (filters.status) query.status = filters.status;
    if (filters.priority) query.priority = filters.priority;
    if (filters.creatorId) query.creatorId = filters.creatorId;
    if (filters.assignedToId) query.assignedToId = filters.assignedToId;
    if (filters.overdueOnly) query.dueDate = { $lt: new Date() };

    return TaskModel.find(query).sort({ dueDate: 1 }).exec();
  },
};
