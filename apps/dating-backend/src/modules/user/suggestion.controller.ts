import type { Request, Response } from "express";
import { prisma } from "@repo/database";

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
        // Get the current user with preferences and profile
        const user = await prisma.user.findUnique({
            where: { walletPubKey: publicKey },
            include: {
                preferences: true,
                profile: true,
                swipesGiven: { select: { toUserId: true } }, // Get already swiped users
            }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            });
        }

        if (!user.profile) {
            return res.status(400).json({
                success: false,
                message: "User profile not found. Please create a profile first."
            });
        }

        // Get IDs of users already swiped
        const swipedUserIds = user.swipesGiven.map(s => s.toUserId);

        // Build location filter based on preference scope
        const locationFilter: any = {};
        if (user.preferences?.locationScope && user.profile) {
            switch (user.preferences.locationScope) {
                case 'SAME_CITY':
                    if (user.profile.city) locationFilter.city = user.profile.city;
                    if (user.profile.state) locationFilter.state = user.profile.state;
                    if (user.profile.country) locationFilter.country = user.profile.country;
                    break;
                case 'SAME_STATE':
                    if (user.profile.state) locationFilter.state = user.profile.state;
                    if (user.profile.country) locationFilter.country = user.profile.country;
                    break;
                case 'SAME_COUNTRY':
                    if (user.profile.country) locationFilter.country = user.profile.country;
                    break;
                case 'ANY':
                    // No location filter
                    break;
            }
        }

        // Find candidate users
        const candidates = await prisma.user.findMany({
            where: {
                id: { not: user.id, notIn: swipedUserIds }, // Exclude self and already swiped
                isActive: true,
                profile: {
                    // Gender filter
                    ...(user.preferences?.preferredGenders?.length! > 0
                        ? { gender: { in: user.preferences!.preferredGenders } }
                        : {}),
                    // Age filter
                    ...(user.preferences?.ageMin || user.preferences?.ageMax
                        ? {
                            age: {
                                gte: user.preferences?.ageMin ?? 18,
                                lte: user.preferences?.ageMax ?? 100
                            }
                        }
                        : {}),
                    // Location filter
                    ...locationFilter
                }
            },
            include: {
                profile: true,
                photos: { orderBy: { order: 'asc' } },
                promptAnswers: { include: { prompt: true }, take: 3 }
            },
            orderBy: [
                { isPremium: 'desc' },      // Premium users first
                { lastActiveAt: 'desc' },   // Then most recently active
            ],
            take: 1
        });

        // Update current user's lastActiveAt
        await prisma.user.update({
            where: { id: user.id },
            data: { lastActiveAt: new Date() }
        });

        if (candidates.length === 0) {
            return res.status(200).json({
                success: true,
                data: null,
                message: "No more suggestions available"
            });
        }

        const suggestion = candidates[0]!;
        return res.status(200).json({
            success: true,
            data: {
                id: suggestion.id,
                walletPubKey: suggestion.walletPubKey,
                profile: suggestion.profile,
                photos: suggestion.photos,
                promptAnswers: suggestion.promptAnswers,
            }
        });
    } catch (error) {
        console.error("[Error] ", error);
        return res.status(500).json({
            success: false,
            error: "Failed to get next suggestion",
        })
    }
};
