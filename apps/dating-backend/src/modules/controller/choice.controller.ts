
import type { Request, Response } from "express";
import { prisma } from "@repo/database";
import { likeUserParamsSchema, likeUserBodySchema, reportUserParamsSchema, reportUserBodySchema, getLikesParamsSchema, getMatchesParamsSchema } from "../../../lib/validation-schema";


/**
 * Creates a like (swipe) from one user to another. Detects mutual match and creates Match record.
 *
 * @route POST /user/:publicKey/like
 * @param {string} publicKey - The liker's wallet public key (in URL params).
 * @body {string} toWhom - The wallet public key of the user being liked.
 * @returns {200} Like created successfully. Returns isMatch status.
 * @returns {400} If trying to like self or missing toWhom.
 * @returns {404} If either user not found.
 * @returns {409} If like already exists.
 * @returns {500} On error.
 */
export const likeUser = async (req: Request, res: Response) => {
    const paramsValidation = likeUserParamsSchema.safeParse(req.params);
    if (!paramsValidation.success) {
        return res.status(400).json({
            success: false,
            error: paramsValidation.error.issues[0]?.message || "Invalid params",
        });
    }

    const bodyValidation = likeUserBodySchema.safeParse(req.body);
    if (!bodyValidation.success) {
        return res.status(400).json({
            success: false,
            error: bodyValidation.error.issues[0]?.message || "Invalid body",
        });
    }

    const { publicKey } = paramsValidation.data;
    const { toWhom } = bodyValidation.data;

    try {
        if (publicKey === toWhom) {
            return res.status(400).json({
                success: false,
                error: "Cannot like yourself",
            });
        }

        if (publicKey === toWhom) {
            return res.status(400).json({
                success: false,
                error: "Cannot like yourself",
            });
        }

        // Find the current user (from)
        const fromUser = await prisma.user.findUnique({
            where: { walletPubKey: publicKey },
        });

        if (!fromUser) {
            return res.status(404).json({
                success: false,
                error: "User not found",
            });
        }

        // Find the target user (to) - by id or walletPubKey
        const toUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { id: toWhom },
                    { walletPubKey: toWhom }
                ]
            },
        });

        if (!toUser) {
            return res.status(404).json({
                success: false,
                error: "Target user not found",
            });
        }

        // Check if swipe already exists
        const existingSwipe = await prisma.swipe.findUnique({
            where: {
                fromUserId_toUserId: {
                    fromUserId: fromUser.id,
                    toUserId: toUser.id,
                },
            },
        });

        if (existingSwipe) {
            return res.status(409).json({
                success: false,
                error: "You have already swiped on this user",
            });
        }

        // Create the swipe with LIKE action
        const swipe = await prisma.swipe.create({
            data: {
                fromUserId: fromUser.id,
                toUserId: toUser.id,
                action: "LIKE",
            },
        });

        // Check if the other user has already liked this user (mutual match)
        const mutualSwipe = await prisma.swipe.findFirst({
            where: {
                fromUserId: toUser.id,
                toUserId: fromUser.id,
                action: "LIKE",
            },
        });

        const isMatch = !!mutualSwipe;

        // If mutual match, create a Matches record
        if (isMatch) {
            // Check if match record already exists (in either direction)
            const existingMatch = await prisma.matches.findFirst({
                where: {
                    OR: [
                        { firstPersonId: fromUser.id, secondPersonId: toUser.id },
                        { firstPersonId: toUser.id, secondPersonId: fromUser.id },
                    ],
                },
            });

            if (!existingMatch) {
                await prisma.matches.create({
                    data: {
                        firstPersonId: fromUser.id,
                        secondPersonId: toUser.id,
                    },
                });
                console.log(`[MATCH] 🎉 New match created: ${publicKey} <-> ${toWhom}`);
            }
        }

        console.log(`[LIKE] ${publicKey} liked ${toWhom}. Match: ${isMatch}`);

        return res.status(200).json({
            success: true,
            message: isMatch ? "It's a match! 🎉" : "User liked successfully",
            isMatch,
            swipeId: swipe.id,
        });
    } catch (error) {
        console.error("Error liking user:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to like user",
        });
    }
};

/**
 * Reports/dislikes a user. Creates a DISLIKE swipe or updates an existing swipe to DISLIKE.
 * This ensures the user won't be shown again in suggestions.
 *
 * @route POST /user/:publicKey/report
 * @param {string} publicKey - The reporter's wallet public key (in URL params).
 * @body {string} toWhom - The wallet public key of the user being reported.
 * @returns {200} User reported successfully. Returns swipeId.
 * @returns {400} If trying to report self or missing toWhom.
 * @returns {404} If either user not found.
 * @returns {500} On error.
 */
export const reportUser = async (req: Request, res: Response) => {
    console.log("DEBUG: Reporting user");

    const paramsValidation = reportUserParamsSchema.safeParse(req.params);
    if (!paramsValidation.success) {
        return res.status(400).json({
            success: false,
            error: paramsValidation.error.issues[0]?.message || "Invalid params",
        });
    }

    const bodyValidation = reportUserBodySchema.safeParse(req.body);
    if (!bodyValidation.success) {
        return res.status(400).json({
            success: false,
            error: bodyValidation.error.issues[0]?.message || "Invalid body",
        });
    }

    const { publicKey } = paramsValidation.data;
    const { toWhom } = bodyValidation.data;

    try {
        if (publicKey === toWhom) {
            return res.status(400).json({
                success: false,
                error: "Cannot report yourself",
            });
        }

        if (publicKey === toWhom) {
            return res.status(400).json({
                success: false,
                error: "Cannot report yourself",
            });
        }

        // Find the current user (from)
        const fromUser = await prisma.user.findUnique({
            where: { walletPubKey: publicKey },
        });

        if (!fromUser) {
            return res.status(404).json({
                success: false,
                error: "User not found",
            });
        }

        // Find the target user (to)
        const toUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { id: toWhom },
                    { walletPubKey: toWhom }
                ]
            },
        });

        if (!toUser) {
            return res.status(404).json({
                success: false,
                error: "Target user not found",
            });
        }

        // Upsert: Create new swipe as DISLIKE, or update existing swipe to DISLIKE
        const swipe = await prisma.swipe.upsert({
            where: {
                fromUserId_toUserId: {
                    fromUserId: fromUser.id,
                    toUserId: toUser.id,
                },
            },
            update: {
                action: "DISLIKE",
            },
            create: {
                fromUserId: fromUser.id,
                toUserId: toUser.id,
                action: "DISLIKE",
            },
        });

        console.log(`[REPORT] ${publicKey} reported/disliked ${toWhom}`);

        return res.status(200).json({
            success: true,
            message: "User reported successfully",
            swipeId: swipe.id,
        });

    } catch (error) {
        console.error("Error reporting user:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to report user",
        });
    }
};

/**
 * Gets all likes received by a user (people who swiped LIKE on them).
 *
 * @route GET /user/:publicKey/likes
 * @param {string} publicKey - The user's wallet public key (in URL params).
 * @returns {200} Returns count and list of users who liked this user.
 * @returns {404} If user not found.
 * @returns {500} On error.
 */
export const getLikes = async (req: Request, res: Response) => {
    const paramsValidation = getLikesParamsSchema.safeParse(req.params);
    if (!paramsValidation.success) {
        return res.status(400).json({
            success: false,
            error: paramsValidation.error.issues[0]?.message || "Invalid params",
        });
    }

    const { publicKey } = paramsValidation.data;

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

        // Get all swipes with LIKE action received by this user
        const receivedLikes = await prisma.swipe.findMany({
            where: {
                toUserId: user.id,
                action: "LIKE"
            },
            include: {
                fromUser: {
                    include: {
                        profile: true,
                        photos: { orderBy: { order: "asc" }, take: 1 },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return res.status(200).json({
            success: true,
            count: receivedLikes.length,
            data: receivedLikes.map((swipe) => ({
                swipeId: swipe.id,
                likedAt: swipe.createdAt,
                user: {
                    id: swipe.fromUser.id,
                    walletPubKey: swipe.fromUser.walletPubKey,
                    displayName: swipe.fromUser.profile?.displayName ?? "Anonymous",
                    profileImage: swipe.fromUser.photos[0]?.url ?? null,
                },
            })),
        });
    } catch (error) {
        console.error("Error fetching likes:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to fetch likes",
        });
    }
};


/**
 * Gets all mutual matches for a user.
 *
 * @route GET /user/:publicKey/matches
 * @param {string} publicKey - The user's wallet public key (in URL params).
 * @returns {200} Returns count and list of matched users.
 * @returns {404} If user not found.
 * @returns {500} On error.
 */
export const getMatches = async (req: Request, res: Response) => {
    const paramsValidation = getMatchesParamsSchema.safeParse(req.params);
    if (!paramsValidation.success) {
        return res.status(400).json({
            success: false,
            error: paramsValidation.error.issues[0]?.message || "Invalid params",
        });
    }

    const { publicKey } = paramsValidation.data;

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

        // Get all matches where this user is either firstPerson or secondPerson
        const matches = await prisma.matches.findMany({
            where: {
                OR: [{ firstPersonId: user.id }, { secondPersonId: user.id }],
            },
            include: {
                firstPerson: {
                    include: {
                        profile: true,
                        photos: { orderBy: { order: "asc" }, take: 1 },
                    },
                },
                secondPerson: {
                    include: {
                        profile: true,
                        photos: { orderBy: { order: "asc" }, take: 1 },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        // Return the OTHER person in each match
        return res.status(200).json({
            success: true,
            count: matches.length,
            data: matches.map((match) => {
                const otherUser =
                    match.firstPersonId === user.id
                        ? match.secondPerson
                        : match.firstPerson;
                return {
                    matchId: match.id,
                    matchedAt: match.createdAt,
                    user: {
                        id: otherUser.id,
                        walletPubKey: otherUser.walletPubKey,
                        displayName: otherUser.profile?.displayName ?? "Anonymous",
                        profileImage: otherUser.photos[0]?.url ?? null,
                        profile: otherUser.profile,
                    },
                };
            }),
        });
    } catch (error) {
        console.error("Error fetching matches:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to fetch matches",
        });
    }
};