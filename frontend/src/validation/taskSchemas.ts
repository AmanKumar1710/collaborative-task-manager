import { z } from "zod";

export const taskPriorityEnum = z.enum(["Low", "Medium", "High", "Urgent"]);
export const taskStatusEnum = z.enum([
  "To Do",
  "In Progress",
  "Review",
  "Completed",
]);

export const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().min(1, "Description is required"),
  dueDate: z.string().min(1, "Due date is required"),
  priority: taskPriorityEnum,
  status: taskStatusEnum,
  assignedToId: z.string().min(1, "Assignee is required"),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;
