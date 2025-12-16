import { z } from "zod";

export const taskPriorityEnum = z.enum(["Low", "Medium", "High", "Urgent"]);
export const taskStatusEnum = z.enum(["To Do", "In Progress", "Review", "Completed"]);

export const createTaskSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1),
  dueDate: z.string().datetime(), // ISO string from frontend
  priority: taskPriorityEnum,
  status: taskStatusEnum,
  assignedToId: z.string().min(1),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = createTaskSchema.partial().extend({
  status: taskStatusEnum.optional(),
  priority: taskPriorityEnum.optional(),
});

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
