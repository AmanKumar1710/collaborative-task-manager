import mongoose, { Schema, Document, Types } from "mongoose";

export type TaskPriority = "Low" | "Medium" | "High" | "Urgent";
export type TaskStatus = "To Do" | "In Progress" | "Review" | "Completed";

export interface ITask extends Document {
  title: string;
  description: string;
  dueDate: Date;
  priority: TaskPriority;
  status: TaskStatus;
  creatorId: Types.ObjectId;
  assignedToId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, required: true, trim: true },
    dueDate: { type: Date, required: true },
    priority: {
      type: String,
      required: true,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium",
    },
    status: {
      type: String,
      required: true,
      enum: ["To Do", "In Progress", "Review", "Completed"],
      default: "To Do",
    },
    creatorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    assignedToId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const TaskModel = mongoose.model<ITask>("Task", TaskSchema);
