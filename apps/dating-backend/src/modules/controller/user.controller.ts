import type { Request, Response } from "express";
import { prisma } from "@repo/database";
import type { CreateUserBody, GetUserByIdParams } from "../../../lib/validation-schema";
import { publicKeySchema, getUserByIdParamsSchema } from "../../../lib/validation-schema";

/**
 * Creates a new user in the database with the provided wallet public key.
 *
 * @route POST /user
 * @body {string} walletPublicKey - The user's wallet public key.
 * @returns {201} User created successfully. Returns userId and message.
 * @returns {400} If user already exists.
 * @returns {500} On error. Returns error message.
 */
export const createUser = async (req: Request, res: Response) => {
  const { walletPublicKey } = req.body;
  console.log("DEBUG: Creating user with walletPublicKey:", walletPublicKey);

  const checkValidation = publicKeySchema.safeParse(walletPublicKey);

  if (!checkValidation.success) {
    res.status(400).json({
      success: false,
      error: checkValidation.error.message,
    });
    return;
  }

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
 * Fetches a specific user by their wallet public key, including their profile and preferences.
 *
 * @route GET /user/:publicKey
 * @param {string} publicKey - Wallet public key (in URL params).
 * @returns {200} User found. Returns user object with profile and preferences.
 * @returns {404} If user not found.
 * @returns {500} On error. Returns error message.
 */
export const getUserById = async (req: Request, res: Response) => {
  const { publicKey } = req.params;

  const checkValidation = getUserByIdParamsSchema.safeParse(req.params)

  if (!checkValidation.success) {
    res.status(400).json({
      success: false,
      error: checkValidation.error.message,
    });
    return;
  }

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