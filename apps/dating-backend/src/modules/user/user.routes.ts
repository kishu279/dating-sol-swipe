import { Router } from "express";
import * as userController from "./user.controller";

const router = Router();

// User creation and profile management
router.post("/create-user", userController.createUser);
router.post("/create-profile", userController.createProfile);

// User retrieval
router.get("/users", userController.getUsers);
router.get("/users/:id", userController.getUserById);

// User preferences management
router.post("/users/:id/preferences", userController.setUserPreferences);
router.get("/users/:id/preferences", userController.getUserPreferences);

export default router;
