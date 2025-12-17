import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import { connectDatabase } from "./config/database";
import { ENV } from "./config/env";
import apiRouter from "./routes";
import { initSocket } from "./config/socket";

async function bootstrap() {
  const app = express();
  const httpServer = http.createServer(app);
  const io = initSocket(httpServer);

  app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://collaborative-task-manager-gilt.vercel.app",
      "https://collaborative-task-manager-mpqgy3cbb-amanakumar1710s-projects.vercel.app"
    ],
    credentials: true,
  })
);

  app.use(express.json());
  app.use(cookieParser());

  app.use("/api", apiRouter);

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", env: ENV.NODE_ENV });
  });

  await connectDatabase();

  httpServer.listen(ENV.PORT, () => {
    console.log(`API server (with Socket.io) listening on port ${ENV.PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});
