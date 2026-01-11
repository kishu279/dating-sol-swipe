import * as z from "zod";

// ==================== COMMON SCHEMAS ====================

/**
 * Reusable schema for wallet public key (used in params and body)
 */
export const publicKeySchema = z.string().min(1, "Public key is required");

// ==================== USER SCHEMAS ====================

/**
 * POST /user
 * Create a new user
 */
export const createUserBodySchema = z.object({
    walletPublicKey: z.string().min(1, "Wallet public key is required"),
});

/**
 * GET /user/:publicKey
 * Get user by public key
 */
export const getUserByIdParamsSchema = z.object({
    publicKey: publicKeySchema,
});

// ==================== PROFILE SCHEMAS ====================

/**
 * POST /user/profile
 * Create a new profile
 */
export const createProfileBodySchema = z.object({
    publicKey: z.string().min(1, "Public key is required"),
    name: z.string().min(1, "Name is required"),
    age: z.number().int().min(18, "Must be at least 18").max(120, "Age must be realistic"),
    bio: z.string().optional(),
    gender: z.enum(["MALE", "FEMALE", "NON_BINARY", "OTHER"]),
    orientation: z.string().min(1, "Orientation is required"),
    heightCm: z.number().int().min(50).max(300).optional(),
    hobbies: z.array(z.string()).optional(),
    country: z.string().optional(),
    state: z.string().optional(),
    city: z.string().optional(),
    profession: z.string().optional(),
    religion: z.string().optional(),
});

/**
 * PUT /user/profile
 * Update an existing profile
 */
export const updateProfileBodySchema = z.object({
    publicKey: z.string().min(1, "Public key is required"),
    name: z.string().min(1, "Name is required").optional(),
    age: z.number().int().min(18, "Must be at least 18").max(120, "Age must be realistic").optional(),
    bio: z.string().optional(),
    gender: z.enum(["MALE", "FEMALE", "NON_BINARY", "OTHER"]).optional(),
    orientation: z.string().min(1, "Orientation is required").optional(),
    heightCm: z.number().int().min(50).max(300).optional(),
    hobbies: z.array(z.string()).optional(),
    country: z.string().optional(),
    state: z.string().optional(),
    city: z.string().optional(),
    profession: z.string().optional(),
    religion: z.string().optional(),
});

// ==================== PREFERENCES SCHEMAS ====================

/**
 * POST /user/:publicKey/preferences
 * Set user preferences
 */
export const setUserPreferencesParamsSchema = z.object({
    publicKey: publicKeySchema,
});

export const setUserPreferencesBodySchema = z.object({
    preferredGenders: z.array(z.enum(["MALE", "FEMALE", "NON_BINARY", "OTHER"])),
    ageMin: z.number().int().min(18, "Minimum age must be at least 18").optional(),
    ageMax: z.number().int().max(120, "Maximum age must be realistic").optional(),
    locationScope: z.enum(["SAME_CITY", "SAME_STATE", "SAME_COUNTRY", "ANY"]),
});

/**
 * GET /user/:publicKey/preferences
 * Get user preferences
 */
export const getUserPreferencesParamsSchema = z.object({
    publicKey: publicKeySchema,
});

// ==================== PROMPTS SCHEMAS ====================

/**
 * GET /user/:publicKey/prompts
 * Get available prompts
 */
export const getPromptsParamsSchema = z.object({
    publicKey: publicKeySchema,
});

/**
 * POST /user/:publicKey/prompts
 * Answer prompts
 */
export const ansPromptsParamsSchema = z.object({
    publicKey: publicKeySchema,
});

export const ansPromptsBodySchema = z.object({
    answers: z.array(
        z.object({
            promptId: z.string().min(1, "Prompt ID is required"),
            answer: z.string().min(1, "Answer is required"),
        })
    ).min(1, "At least one answer is required"),
});

// ==================== SUGGESTION SCHEMAS ====================

/**
 * GET /user/:publicKey/next-suggestion
 * Get next user suggestion
 */
export const getNextSuggestionParamsSchema = z.object({
    publicKey: publicKeySchema,
});

// ==================== CHOICE/SWIPE SCHEMAS ====================

/**
 * POST /user/swipe/:publicKey/like
 * Like a user
 */
export const likeUserParamsSchema = z.object({
    publicKey: publicKeySchema,
});

export const likeUserBodySchema = z.object({
    toWhom: z.string().min(1, "Target user public key (toWhom) is required"),
});

/**
 * POST /user/swipe/:publicKey/report
 * Report/dislike a user
 */
export const reportUserParamsSchema = z.object({
    publicKey: publicKeySchema,
});

export const reportUserBodySchema = z.object({
    toWhom: z.string().min(1, "Target user public key (toWhom) is required"),
});

/**
 * GET /user/swipe/:publicKey/likes
 * Get received likes
 */
export const getLikesParamsSchema = z.object({
    publicKey: publicKeySchema,
});

/**
 * GET /user/swipe/:publicKey/matches
 * Get all matches
 */
export const getMatchesParamsSchema = z.object({
    publicKey: publicKeySchema,
});

// ==================== TYPE EXPORTS ====================

export type CreateUserBody = z.infer<typeof createUserBodySchema>;
export type GetUserByIdParams = z.infer<typeof getUserByIdParamsSchema>;

export type CreateProfileBody = z.infer<typeof createProfileBodySchema>;
export type UpdateProfileBody = z.infer<typeof updateProfileBodySchema>;

export type SetUserPreferencesParams = z.infer<typeof setUserPreferencesParamsSchema>;
export type SetUserPreferencesBody = z.infer<typeof setUserPreferencesBodySchema>;
export type GetUserPreferencesParams = z.infer<typeof getUserPreferencesParamsSchema>;

export type GetPromptsParams = z.infer<typeof getPromptsParamsSchema>;
export type AnsPromptsParams = z.infer<typeof ansPromptsParamsSchema>;
export type AnsPromptsBody = z.infer<typeof ansPromptsBodySchema>;

export type GetNextSuggestionParams = z.infer<typeof getNextSuggestionParamsSchema>;

export type LikeUserParams = z.infer<typeof likeUserParamsSchema>;
export type LikeUserBody = z.infer<typeof likeUserBodySchema>;
export type ReportUserParams = z.infer<typeof reportUserParamsSchema>;
export type ReportUserBody = z.infer<typeof reportUserBodySchema>;
export type GetLikesParams = z.infer<typeof getLikesParamsSchema>;
export type GetMatchesParams = z.infer<typeof getMatchesParamsSchema>;