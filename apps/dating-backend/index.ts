import express from "express";
import type { Request, Response } from "express";
import apiRoutes from "./src/routes";

const app = express();

app.use(express.json());

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
  try {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting the server:", error);
  }
}

main();
