import { useState } from "react";
import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  type Task,
  type TaskStatus,
  type TaskPriority,
} from "../api/tasks";
import { useAuth } from "../context/AuthContext";
import { TaskForm } from "../components/TaskForm";
import { type TaskFormValues } from "../validation/taskSchemas";
import { useSocket } from "../context/SocketContext";


type ViewMode = "assigned" | "created" | "overdue";

const statusOptions: TaskStatus[] = ["To Do", "In Progress", "Review", "Completed"];
const priorityOptions: TaskPriority[] = ["Low", "Medium", "High", "Urgent"];

function DashboardPage() {
  const { user } = useAuth();
  const [view, setView] = useState<ViewMode>("assigned");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "">("");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "">("");
  const [showCreate, setShowCreate] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showEdit, setShowEdit] = useState(false);

  const queryClient = useQueryClient();
  const { socket } = useSocket();
  
  useEffect(() => {
    if (!socket) return;

    const handleTaskUpdated = (updated: Task) => {
      queryClient.setQueriesData<Task[] | undefined>(
        { queryKey: ["tasks"] },
        (old) => {
          if (!old) return old;
          const exists = old.some((t) => t._id === updated._id);
          if (!exists) {
            return old.concat(updated);
          }
          return old.map((t) => (t._id === updated._id ? updated : t));
        }
      );
    };

    socket.on("taskUpdated", handleTaskUpdated);

    return () => {
      socket.off("taskUpdated", handleTaskUpdated);
    };
  }, [socket, queryClient]);

  const { data, isLoading } = useQuery({
    queryKey: ["tasks", view, statusFilter, priorityFilter, user?.id],
    queryFn: () => {
      if (!user) return Promise.resolve([] as Task[]);

      const baseFilters: any = {};

      if (view === "assigned") {
        baseFilters.assignedToId = user.id;
      } else if (view === "created") {
        baseFilters.creatorId = user.id;
      } else if (view === "overdue") {
        baseFilters.assignedToId = user.id;
        baseFilters.overdueOnly = true;
      }

      if (statusFilter) baseFilters.status = statusFilter;
      if (priorityFilter) baseFilters.priority = priorityFilter;

      return fetchTasks(baseFilters);
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: (values: TaskFormValues) =>
      createTask({
        ...values,
        dueDate: new Date(values.dueDate).toISOString(),
      }),
    onSuccess: () => {
      setShowCreate(false);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: TaskFormValues }) =>
      updateTask(id, {
        ...values,
        dueDate: new Date(values.dueDate).toISOString(),
      }),
    onSuccess: () => {
      setShowEdit(false);
      setEditingTask(null);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const tasks = data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="rounded bg-slate-900 px-3 py-1.5 text-sm font-medium text-white"
        >
          Create task
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded border bg-white p-1 text-sm">
          <button
            type="button"
            onClick={() => setView("assigned")}
            className={`px-3 py-1 rounded ${
              view === "assigned" ? "bg-slate-900 text-white" : "text-slate-700"
            }`}
          >
            Assigned to me
          </button>
          <button
            type="button"
            onClick={() => setView("created")}
            className={`px-3 py-1 rounded ${
              view === "created" ? "bg-slate-900 text-white" : "text-slate-700"
            }`}
          >
            Created by me
          </button>
          <button
            type="button"
            onClick={() => setView("overdue")}
            className={`px-3 py-1 rounded ${
              view === "overdue" ? "bg-slate-900 text-white" : "text-slate-700"
            }`}
          >
            Overdue
          </button>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <div>
            <label className="block text-xs text-slate-600">Status</label>
            <select
              className="rounded border px-2 py-1"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as TaskStatus | "")}
            >
              <option value="">All</option>
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-600">Priority</label>
            <select
              className="rounded border px-2 py-1"
              value={priorityFilter}
              onChange={(e) =>
                setPriorityFilter(e.target.value as TaskPriority | "")
              }
            >
              <option value="">All</option>
              {priorityOptions.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {showCreate && (
        <div className="mt-3 rounded-lg border bg-white p-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">New task</h2>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
          </div>

          <TaskForm
            submitLabel="Create task"
            isSubmitting={createMutation.isPending}
            onSubmit={(values) => createMutation.mutate(values)}
          />
        </div>
      )}

      {showEdit && editingTask && (
        <div className="mt-3 rounded-lg border bg-white p-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">Edit task</h2>
            <button
              type="button"
              onClick={() => {
                setShowEdit(false);
                setEditingTask(null);
              }}
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              Close
            </button>
          </div>

          <TaskForm
            submitLabel="Update task"
            isSubmitting={updateMutation.isPending}
            initialValues={{
              title: editingTask.title,
              description: editingTask.description,
              dueDate: editingTask.dueDate.slice(0, 16), // for datetime-local input
              priority: editingTask.priority,
              status: editingTask.status,
              assignedToId: editingTask.assignedToId,
            }}
            onSubmit={(values) =>
              updateMutation.mutate({ id: editingTask._id, values })
            }
          />
        </div>
      )}

      <div className="mt-2 rounded-lg border bg-white">
        <div className="grid grid-cols-12 border-b bg-slate-50 px-4 py-2 text-xs font-medium text-slate-600">
          <div className="col-span-4">Title</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Priority</div>
          <div className="col-span-2">Due date</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {isLoading && (
          <div className="space-y-1 p-4">
            {[...Array(3)].map((_, idx) => (
              <div
                key={idx}
                className="h-8 animate-pulse rounded bg-slate-100"
              />
            ))}
          </div>
        )}

        {!isLoading && tasks.length === 0 && (
          <div className="p-4 text-sm text-slate-500">
            No tasks found for this view.
          </div>
        )}

        {!isLoading &&
          tasks.map((task) => (
            <div
              key={task._id}
              className="grid grid-cols-12 items-center border-t px-4 py-2 text-sm"
            >
              <div className="col-span-4">
                <div className="font-medium text-slate-900">{task.title}</div>
                <div className="line-clamp-1 text-xs text-slate-500">
                  {task.description}
                </div>
              </div>
              <div className="col-span-2">
                <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                  {task.status}
                </span>
              </div>
              <div className="col-span-2">
                <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                  {task.priority}
                </span>
              </div>
              <div className="col-span-2 text-xs text-slate-700">
                {new Date(task.dueDate).toLocaleDateString()}
              </div>
              <div className="col-span-2 text-right text-xs space-x-2">
                <button
                  className="text-slate-700 hover:text-slate-900"
                  onClick={() => {
                    setEditingTask(task);
                    setShowEdit(true);
                  }}
                >
                  Edit
                </button>
                <button
                  className="text-red-600 hover:text-red-800"
                  onClick={() => {
                    if (confirm("Delete this task?")) {
                      deleteMutation.mutate(task._id);
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default DashboardPage;
