import { useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext";
import type { Task } from "../api/tasks";

interface Notification {
  id: string;
  task: Task;
}

export function AssignmentNotifications() {
  const { socket } = useSocket();
  const [items, setItems] = useState<Notification[]>([]);

  useEffect(() => {
    if (!socket) return;

    const handler = (task: Task) => {
      setItems((prev) => [
        { id: `${task._id}-${Date.now()}`, task },
        ...prev,
      ]);
    };

    socket.on("taskAssigned", handler);

    return () => {
      socket.off("taskAssigned", handler);
    };
  }, [socket]);

  if (items.length === 0) return null;

  const latest = items[0];

  return (
    <div className="fixed bottom-4 right-4 max-w-sm rounded-lg bg-slate-900 px-4 py-3 text-xs text-white shadow-lg">
      <div className="font-semibold mb-1">New task assigned to you</div>
      <div className="text-[11px]">
        <div className="font-medium">{latest.task.title}</div>
        <div className="line-clamp-2 text-slate-200">
          {latest.task.description}
        </div>
      </div>
    </div>
  );
}
