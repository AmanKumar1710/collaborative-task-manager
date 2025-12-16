import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  taskFormSchema,
  type TaskFormValues,
} from "../validation/taskSchemas";
import { useQuery } from "@tanstack/react-query";
import { fetchUsers, type AppUser } from "../api/users";


interface TaskFormProps {
  initialValues?: Partial<TaskFormValues>;
  submitLabel: string;
  onSubmit: (values: TaskFormValues) => void;
  isSubmitting?: boolean;
}

export function TaskForm({
  initialValues,
  submitLabel,
  onSubmit,
  isSubmitting,
}: TaskFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: initialValues?.title ?? "",
      description: initialValues?.description ?? "",
      dueDate: initialValues?.dueDate ?? "",
      priority: initialValues?.priority ?? "Medium",
      status: initialValues?.status ?? "To Do",
      assignedToId: initialValues?.assignedToId ?? "",
    },
  });

  const { data: users, isLoading: usersLoading } = useQuery<AppUser[]>({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-700">
          Title
        </label>
        <input
          className="w-full rounded border px-3 py-2 text-sm"
          {...register("title")}
        />
        {errors.title && (
          <p className="text-xs text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-700">
          Description
        </label>
        <textarea
          className="w-full rounded border px-3 py-2 text-sm"
          rows={3}
          {...register("description")}
        />
        {errors.description && (
          <p className="text-xs text-red-600">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">
            Due date
          </label>
          <input
            type="datetime-local"
            className="w-full rounded border px-3 py-2 text-sm"
            {...register("dueDate")}
          />
          {errors.dueDate && (
            <p className="text-xs text-red-600">{errors.dueDate.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">
            Priority
          </label>
          <select
            className="w-full rounded border px-3 py-2 text-sm"
            {...register("priority")}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">
            Status
          </label>
          <select
            className="w-full rounded border px-3 py-2 text-sm"
            {...register("status")}
          >
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Review">Review</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-700">
          Assigned to
        </label>
        <select
          className="w-full rounded border px-3 py-2 text-sm"
          {...register("assignedToId")}
        >
          <option value="">
            {usersLoading ? "Loading users..." : "Select a user"}
          </option>
          {users?.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.email})
            </option>
          ))}
        </select>
        {errors.assignedToId && (
          <p className="text-xs text-red-600">
            {errors.assignedToId.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded bg-slate-900 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {isSubmitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
