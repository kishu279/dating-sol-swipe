import { Router } from "express";
import * as userController from "../controller/user.controller";
import * as profileController from "../controller/profile.controller";
import * as preferencesController from "../controller/preferences.controller";
import * as promptsController from "../controller/prompts.controller";
import * as suggestionController from "../controller/suggestion.controller";
import * as choiceController from "../controller/choice.controller";

const router = Router();

// ==================== USER ROUTES ====================
// Core user management
router.post("/user", userController.createUser);
router.get("/user/:publicKey", userController.getUserById);

// ==================== PROFILE ROUTES ====================
router.post("/user/profile", profileController.createProfile);
router.put("/user/profile", profileController.updateProfile);

// ==================== PREFERENCES ROUTES ====================
router.post("/user/:publicKey/preferences", preferencesController.setUserPreferences);
router.get("/user/:publicKey/preferences", preferencesController.getUserPreferences);

// ==================== PROMPTS ROUTES ====================
router.get("/user/:publicKey/prompts", promptsController.getPrompts);
router.post("/user/:publicKey/prompts", promptsController.ansPrompts);

// ==================== SUGGESTION ROUTES ====================
router.get("/user/:publicKey/next-suggestion", suggestionController.getNextSuggestion);

// ==================== CHOICE ROUTES (Like/Report/Match) ====================
router.post("/user/swipe/:publicKey/like", choiceController.likeUser);
router.post("/user/swipe/:publicKey/report", choiceController.reportUser);
router.get("/user/swipe/:publicKey/likes", choiceController.getLikes);
router.get("/user/swipe/:publicKey/matches", choiceController.getMatches);

export default router;