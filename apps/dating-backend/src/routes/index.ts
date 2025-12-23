import { Router } from "express";
import userRouter from "../modules/user/user.routes";
import { prisma } from "@repo/database";

const router = Router();

router.use("/", userRouter);

/**
 * Health check endpoint to verify server and database connectivity.
 *
 * @returns 200 if healthy, 500 if database connection fails
 */
router.get("/health", async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      success: true,
      message: "Server and database are healthy",
    });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(500).json({
      success: false,
      error: "Database connection failed",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

export default router;
