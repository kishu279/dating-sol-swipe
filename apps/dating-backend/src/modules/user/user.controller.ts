import type { Request, Response } from "express";
import { prisma } from "@repo/database";

/**
 * Creates a new user in the database with the provided wallet public key.
 *
 * @param req - Express request object containing walletPublicKey in the body
 * @param res - Express response object
 * @returns 201 if successful, 500 if an error occurs
 */
export const createUser = async (req: Request, res: Response) => {
  const { walletPublicKey } = req.body;

  try {
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
 * @param req - Express request object containing userId, name, age, bio, gender, and orientation
 * @param res - Express response object
 * @returns 201 if successful, 404 if user not found, 500 if an error occurs
 */
export const createProfile = async (req: Request, res: Response) => {
  const { userId, name, age, bio, gender, orientation } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: "User not found",
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

/**
 * Updates an existing profile for a user.
 *
 * @param req - Express request object containing user
 * @param res - Express response object
 * @returns 200 if successful, 500 if an error occurs
 */
export const updateProfile = async (req: Request, res: Response) => {
  const { userId, name, age, bio, gender, orientation } = req.body;

  try {
    const profile = await prisma.profile.update({
      where: { userId },
      data: {
        displayName: name,
        bio,
        age,
        gender,
        orientation,
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
 * Fetches all users from the database.
 *
 * @param req - Express request object
 * @param res - Express response object
 * @returns 200 with the list of users, 500 if an error occurs
 */
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        walletPubKey: true,
      },
    });

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch users",
    });
  }
};

/**
 * Fetches a specific user by their ID, including their profile and preferences.
 *
 * @param req - Express request object containing the user ID in params
 * @param res - Express response object
 * @returns 200 if user found, 404 if user not found, 500 if an error occurs
 */
export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
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
 * @param req - Express request object containing user ID in params and preferences in body
 * @param res - Express response object
 * @returns 200 if successful, 500 if an error occurs
 */
export const setUserPreferences = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { preferredGenders, ageMin, ageMax, distanceRange } = req.body;

  try {
    const preferences = await prisma.preferences.upsert({
      where: { userId: id },
      create: {
        userId: id,
        preferredGenders,
        ageMax,
        ageMin,
        maxDistanceKm: +distanceRange,
      },
      update: {
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
 * @param req - Express request object containing user ID in params
 * @param res - Express response object
 * @returns 200 if successful, 404 if preferences not found, 500 if an error occurs
 */
export const getUserPreferences = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const preferences = await prisma.preferences.findUnique({
      where: { userId: id },
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
