import type { Request, Response } from "express";
import { prisma } from "@repo/database";
import { MOCK_DATA, type ScrollDataType } from "../../../constants/scroll-data";
import { validateLocation, isValidCountry, isValidState } from "../../constants/locations";

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
          ...(user.preferences?.preferredGenders?.length > 0
            ? { gender: { in: user.preferences.preferredGenders } }
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

    const suggestion = candidates[0];
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


/**
 * Creates a like from one user to another. Detects mutual match and creates Match record.
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
  const { publicKey } = req.params;
  const { toWhom }: { toWhom: string } = req.body;

  try {
    // Validate input
    if (!toWhom) {
      return res.status(400).json({
        success: false,
        error: "toWhom (target publicKey) is required",
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

    // Find the target user (to)
    const toUser = await prisma.user.findUnique({
      where: { walletPubKey: toWhom },
    });

    if (!toUser) {
      return res.status(404).json({
        success: false,
        error: "Target user not found",
      });
    }

    // Check if like already exists
    const existingLike = await prisma.like.findUnique({
      where: {
        fromUserId_toUserId: {
          fromUserId: fromUser.id,
          toUserId: toUser.id,
        },
      },
    });

    if (existingLike) {
      return res.status(409).json({
        success: false,
        error: "You have already liked this user",
      });
    }

    // Create the like
    const like = await prisma.like.create({
      data: {
        fromUserId: fromUser.id,
        toUserId: toUser.id,
      },
    });

    // Check if the other user has already liked this user (mutual match)
    const mutualLike = await prisma.like.findUnique({
      where: {
        fromUserId_toUserId: {
          fromUserId: toUser.id,
          toUserId: fromUser.id,
        },
      },
    });

    const isMatch = !!mutualLike;

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
      likeId: like.id,
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
 * Gets all likes received by a user (people who liked them).
 *
 * @route GET /user/:publicKey/likes
 * @param {string} publicKey - The user's wallet public key (in URL params).
 * @returns {200} Returns count and list of users who liked this user.
 * @returns {404} If user not found.
 * @returns {500} On error.
 */
export const getLikes = async (req: Request, res: Response) => {
  const { publicKey } = req.params;

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

    // Get all likes received by this user
    const receivedLikes = await prisma.like.findMany({
      where: { toUserId: user.id },
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
      data: receivedLikes.map((like) => ({
        likeId: like.id,
        likedAt: like.createdAt,
        user: {
          id: like.fromUser.id,
          walletPubKey: like.fromUser.walletPubKey,
          displayName: like.fromUser.profile?.displayName ?? "Anonymous",
          profileImage: like.fromUser.photos[0]?.url ?? null,
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
  const { publicKey } = req.params;

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