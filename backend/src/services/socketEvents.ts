import { getIO } from "../config/socket";
import { ITask } from "../models/Task";

export function emitTaskUpdated(task: ITask) {
  const io = getIO();
  io.emit("taskUpdated", {
    _id: task._id.toString(),
    title: task.title,
    description: task.description,
    dueDate: task.dueDate,
    priority: task.priority,
    status: task.status,
    creatorId: task.creatorId.toString(),
    assignedToId: task.assignedToId.toString(),
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  });
}

export function emitTaskAssigned(task: ITask) {
  const io = getIO();
  const userRoom = `user:${task.assignedToId.toString()}`;

  io.to(userRoom).emit("taskAssigned", {
    _id: task._id.toString(),
    title: task.title,
    description: task.description,
    dueDate: task.dueDate,
    priority: task.priority,
    status: task.status,
    creatorId: task.creatorId.toString(),
    assignedToId: task.assignedToId.toString(),
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  });
}
