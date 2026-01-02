import type { Request, Response } from "express";
import { prisma } from "@repo/database";

/**
 * Creates a new user in the database with the provided wallet public key.
 *
 * @route POST /user
 * @body {string} walletPublicKey - The user's wallet public key.
 * @returns {201} User created successfully. Returns userId and message.
 * @returns {200} If user already exists. Returns userId and message.
 * @returns {500} On error. Returns error message.
 */
export const createUser = async (req: Request, res: Response) => {
  const { walletPublicKey } = req.body;
  console.log("DEBUG: Creating user with walletPublicKey:", walletPublicKey);

  try {
    const userExists = await prisma.user.findUnique({
      where: { walletPubKey: walletPublicKey },
    });

    if (userExists) {
      res.status(400).json({
        success: false,
        error: "User already exists",
      });
      return;
    }

    const user = await prisma.user.create({
      data: {
        walletPubKey: walletPublicKey,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    res.status(201).json({
      success: true,
      data: {
        userId: user.id,
        message: "User created successfully",
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create user",
    });
  }
};

/**
 * Creates a new profile for an existing user.
 *
 * @route POST /user/profile
 * @body {string} publicKey - The user's wallet public key.
 * @body {string} name - Display name for the profile.
 * @body {number} age - Age of the user.
 * @body {string} bio - User's bio.
 * @body {string} gender - User's gender.
 * @body {string} orientation - User's orientation.
 * @returns {201} Profile created successfully. Returns profileId and message.
 * @returns {404} If user not found.
 * @returns {500} On error. Returns error message.
 */
export const createProfile = async (req: Request, res: Response) => {
  const { publicKey, name, age, bio, gender, orientation, heightCm, hobbies, location, profession, religion } = req.body;

  try {
    if (!publicKey) {
      res.status(400).json({
        success: false,
        error: "publicKey is required",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { walletPubKey: publicKey },
      include: { profile: true },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: "User not found",
      });
      return;
    }

    if (user.profile) {
      res.status(400).json({
        success: false,
        error: "Profile already exists",
      });
      return;
    }

    const profile = await prisma.profile.create({
      data: {
        userId: user.id,
        displayName: name,
        bio,
        age,
        gender,
        orientation,
        heightCm,
        hobbies,
        location,
        profession,
        religion,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        profileId: profile.id,
        message: "Profile created successfully",
      },
    });
  } catch (error) {
    console.error("Error creating profile:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create profile",
    });
  }
};
// ...existing code...

/**
 * Updates an existing profile for a user.
 *
 * @route PUT /user/profile
 * @body {string} publicKey - The user's wallet public key.
 * @body {string} name - Display name for the profile.
 * @body {number} age - Age of the user.
 * @body {string} bio - User's bio.
 * @body {string} gender - User's gender.
 * @body {string} orientation - User's orientation.
 * @returns {200} Profile updated successfully. Returns profileId and message.
 * @returns {404} If user not found.
 * @returns {500} On error. Returns error message.
 */
export const updateProfile = async (req: Request, res: Response) => {
  const { publicKey, name, age, bio, gender, orientation, heightCm, hobbies, location, profession, religion } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { walletPubKey: publicKey },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: "User not found",
      });
      return;
    }

    const profile = await prisma.profile.update({
      where: { userId: user.id },
      data: {
        displayName: name,
        bio,
        age,
        gender,
        orientation,
        heightCm,
        hobbies,
        location,
        profession,
        religion,
      },
    });

    res.json({
      success: true,
      data: {
        profileId: profile.id,
        message: "Profile updated successfully",
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update profile",
    });
  }
};

/**
 * Fetches a specific user by their wallet public key, including their profile and preferences.
 *
 * @route GET /users/:publicKey
 * @param {string} publicKey - Wallet public key (in URL params).
 * @returns {200} User found. Returns user object with profile and preferences.
 * @returns {404} If user not found.
 * @returns {500} On error. Returns error message.
 */
export const getUserById = async (req: Request, res: Response) => {
  const { publicKey } = req.params;

  console.log("DEBUG: Fetching user with publicKey:", publicKey);

  try {
    const user = await prisma.user.findUnique({
      where: { walletPubKey: publicKey },
      include: {
        profile: true,
        preferences: true,
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: "User not found",
      });
      return;
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch user",
    });
  }
};

/**
 * Sets user preferences for a specific user.
 *
 * @route POST /user/:publicKey/preferences
 * @param {string} publicKey - Wallet public key (in URL params).
 * @body {string[]} preferredGenders - Array of preferred genders.
 * @body {number} ageMin - Minimum preferred age.
 * @body {number} ageMax - Maximum preferred age.
 * @body {number} distanceRange - Maximum distance in km.
 * @returns {200} Preferences set successfully. Returns preferencesId and message.
 * @returns {500} On error. Returns error message.
 */
export const setUserPreferences = async (req: Request, res: Response) => {
  const { publicKey } = req.params;
  const { preferredGenders, ageMin, ageMax, distanceRange } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { walletPubKey: publicKey },
      include: { preferences: true },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: "User not found",
      });
      return;
    }

    if (user.preferences) {
      res.status(400).json({
        success: false,
        error: "Preferences already exist",
      });
      return;
    }

    const preferences = await prisma.preferences.create({
      data: {
        userId: user.id,
        preferredGenders,
        ageMax,
        ageMin,
        maxDistanceKm: +distanceRange,
      },
    });

    res.json({
      success: true,
      data: {
        preferencesId: preferences.id,
        message: "User preferences set successfully",
      },
    });
  } catch (error) {
    console.error("Error setting user preferences:", error);
    res.status(500).json({
      success: false,
      error: "Failed to set user preferences",
    });
  }
};

/**
 * Fetches user preferences for a specific user.
 *
 * @route GET /user/:publicKey/preferences
 * @param {string} publicKey - Wallet public key (in URL params).
 * @returns {200} Preferences found. Returns preferences object.
 * @returns {404} If preferences not found.
 * @returns {500} On error. Returns error message.
 */
export const getUserPreferences = async (req: Request, res: Response) => {
  const { publicKey } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { walletPubKey: publicKey },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: "User not found",
      });
      return;
    }

    const preferences = await prisma.preferences.findUnique({
      where: { userId: user.id },
    });

    if (!preferences) {
      res.status(404).json({
        success: false,
        error: "User preferences not found",
      });
      return;
    }

    res.json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch user preferences",
    });
  }
};

/**
 * Fetches all available prompts for users to answer.
 *
 * @route GET /user/:publicKey/prompts
 * @param {string} publicKey - Wallet public key (in URL params, not used in query).
 * @returns {200} Returns array of prompts.
 * @returns {500} On error. Returns error message.
 */
export const getPrompts = async (req: Request, res: Response) => {
  const { publicKey } = req.params;

  try {
    const prompts = await prisma.prompt.findMany({});

    res.json({
      success: true,
      data: prompts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch prompts",
    });
  }
};

type ansPromptsBody = {
  answers: {
    promptId: string;
    answer: string;
  }[];
};

/**
 * Submits answers to prompts for a user.
 *
 * @route POST /user/:publicKey/prompts
 * @param {string} publicKey - Wallet public key (in URL params).
 * @body {Array<{promptId: string, answer: string}>} answers - Array of prompt answers.
 * @returns {200} Prompts answered successfully.
 * @returns {400} If publicKey or answers are invalid.
 * @returns {500} On error. Returns error message.
 */
export const ansPrompts = async (req: Request, res: Response) => {
  const { publicKey } = req.params;

  if (!publicKey || typeof publicKey !== "string") {
    return res.status(400).json({
      success: false,
      error: "Missing or invalid public key",
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { walletPubKey: publicKey },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const { answers }: ansPromptsBody = req.body;

    console.log("[DEBUG] Received answers:", answers);

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Answers must be a non-empty array",
      });
    }

    for (const ans of answers) {
      if (!ans.promptId || typeof ans.promptId !== "string") {
        return res.status(400).json({
          success: false,
          error: "Invalid promptId in answers",
        });
      }
      if (!ans.answer || typeof ans.answer !== "string") {
        return res.status(400).json({
          success: false,
          error: "Invalid answer in answers",
        });
      }
    }

    const promptsAns = await prisma.promptAnswer.createMany({
      data: answers.map((ans) => ({
        answer: ans.answer,
        promptId: ans.promptId,
        userId: user.id,
      })),
      skipDuplicates: true,
    });

    console.log("[DEBUG] Prompt answers created:", promptsAns);

    res.status(200).json({
      success: true,
      message: "Prompts answered successfully",
    });
  } catch (error) {
    console.error("Error answering prompts:", error);
    res.status(500).json({
      success: false,
      error: "Failed to ans prompts",
    });
  }
};

/**
 * Gets the next user suggestion for the given user based on preferences.
 *
 * @route GET /user/:publicKey/next-suggestion
 * @param {string} publicKey - Wallet public key (in URL params).
 * @returns {200} Returns user suggestion and preferences.
 * @returns {500} On error. Returns error message.
 */
export const getNextSuggestion = async (req: Request, res: Response) => {
  const { publicKey } = req.params;

  try {
    const userPreferences = await prisma.user.findUnique({
      where: { walletPubKey: publicKey },
      include: { preferences: true },
    });

    console.log({ userPreferences });

    return res.status(200).json({
      success: true,
      data: userPreferences,
      message: "Next suggestion fetched successfully",
    });
  } catch (error) {
    console.error("[Error] ", error);
  }
};
