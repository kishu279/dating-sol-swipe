import type { Request, Response } from "express";
import { prisma } from "@repo/database";
import { setUserPreferencesParamsSchema, setUserPreferencesBodySchema, getUserPreferencesParamsSchema } from "../../../lib/validation-schema";

/**
 * Sets user preferences for a specific user.
 *
 * @route POST /user/:publicKey/preferences
 * @param {string} publicKey - Wallet public key (in URL params).
 * @body {string[]} preferredGenders - Array of preferred genders.
 * @body {number} ageMin - Minimum preferred age.
 * @body {number} ageMax - Maximum preferred age.
 * @body {string} locationScope - Location scope for matching.
 * @returns {200} Preferences set successfully. Returns preferencesId and message.
 * @returns {500} On error. Returns error message.
 */
export const setUserPreferences = async (req: Request, res: Response) => {
    const paramsValidation = setUserPreferencesParamsSchema.safeParse(req.params);
    if (!paramsValidation.success) {
        res.status(400).json({
            success: false,
            error: paramsValidation.error.issues[0]?.message || "Invalid params",
        });
        return;
    }

    const bodyValidation = setUserPreferencesBodySchema.safeParse(req.body);
    if (!bodyValidation.success) {
        res.status(400).json({
            success: false,
            error: bodyValidation.error.issues[0]?.message || "Invalid body",
        });
        return;
    }

    const { publicKey } = paramsValidation.data;
    const { preferredGenders, ageMin, ageMax, locationScope } = bodyValidation.data;

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
                locationScope
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
    const paramsValidation = getUserPreferencesParamsSchema.safeParse(req.params);
    if (!paramsValidation.success) {
        res.status(400).json({
            success: false,
            error: paramsValidation.error.issues[0]?.message || "Invalid params",
        });
        return;
    }

    const { publicKey } = paramsValidation.data;

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
