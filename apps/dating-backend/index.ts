import express from "express";
import type { Request, Response } from "express";
import apiRoutes from "./src/routes";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "*",
    allowedHeaders: ["Content-Type", "Authorization", "X-Request-ID"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// Logging middleware
app.use((req, res, next) => {
  const requestId = req.headers["x-request-id"] || "internal";
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.url} - ID: ${requestId}`
  );
  next();
});

// API Routes
app.use("/api", apiRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Dating App Backend is running!");
});

async function main() {
  const PORT = process.env.PORT || 3000;
  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  server.on("error", (error) => {
    console.error("Error starting the server:", error);
    process.exit(1);
  });

  const gracefulShutdown = () => {
    console.log("Received shutdown signal, closing server...");
    server.close(() => {
      console.log("Server closed");
      process.exit(0);
    });
  };

  process.on("SIGTERM", gracefulShutdown);
  process.on("SIGINT", gracefulShutdown);
}

main();
