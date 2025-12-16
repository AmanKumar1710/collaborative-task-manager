import { apiClient } from "../lib/apiClient";

export type TaskPriority = "Low" | "Medium" | "High" | "Urgent";
export type TaskStatus = "To Do" | "In Progress" | "Review" | "Completed";

export interface Task {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  creatorId: string;
  assignedToId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedToId?: string;
  creatorId?: string;
  overdueOnly?: boolean;
}

export async function fetchTasks(filters: TaskFilters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.append("status", filters.status);
  if (filters.priority) params.append("priority", filters.priority);
  if (filters.assignedToId) params.append("assignedToId", filters.assignedToId);
  if (filters.creatorId) params.append("creatorId", filters.creatorId);
  if (filters.overdueOnly) params.append("overdueOnly", "true");

  const res = await apiClient.get("/tasks", { params });
  return res.data.tasks as Task[];
}

export interface CreateTaskPayload {
  title: string;
  description: string;
  dueDate: string; // ISO string
  priority: TaskPriority;
  status: TaskStatus;
  assignedToId: string;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  dueDate?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  assignedToId?: string;
}

export async function createTask(payload: CreateTaskPayload) {
  const res = await apiClient.post("/tasks", payload);
  return res.data.task as Task;
}

export async function updateTask(id: string, payload: UpdateTaskPayload) {
  const res = await apiClient.put(`/tasks/${id}`, payload);
  return res.data.task as Task;
}

export async function deleteTask(id: string) {
  await apiClient.delete(`/tasks/${id}`);
}
