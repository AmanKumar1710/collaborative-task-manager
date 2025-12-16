import { Server } from "socket.io";
import type { Server as HttpServer } from "http";

let io: Server | null = null;

export function initSocket(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    // client should emit "join" with the current user id
    socket.on("join", (userId: string) => {
      if (userId) {
        socket.join(`user:${userId}`);
      }
    });

    socket.on("disconnect", () => {
      // no-op for now
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
}
