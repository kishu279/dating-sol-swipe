import type { Request, Response } from "express";
import { prisma } from "@repo/database";
import { validateLocation } from "../../constants/locations";

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
    const { publicKey, name, age, bio, gender, orientation, heightCm, hobbies, country, state, city, profession, religion } = req.body;

    try {
        if (!publicKey) {
            res.status(400).json({
                success: false,
                error: "publicKey is required",
            });
            return;
        }

        // Validate location if provided
        if (country && state) {
            const locationValidation = validateLocation(country, state);
            if (!locationValidation.valid) {
                res.status(400).json({
                    success: false,
                    error: locationValidation.error,
                });
                return;
            }
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
                country,
                state,
                city,
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
    const { publicKey, name, age, bio, gender, orientation, heightCm, hobbies, country, state, city, profession, religion } = req.body;

    try {
        // Validate location if provided
        if (country && state) {
            const locationValidation = validateLocation(country, state);
            if (!locationValidation.valid) {
                res.status(400).json({
                    success: false,
                    error: locationValidation.error,
                });
                return;
            }
        }

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
                country,
                state,
                city,
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
