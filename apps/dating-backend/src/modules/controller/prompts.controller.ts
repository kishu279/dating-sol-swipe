import type { Request, Response } from "express";
import { prisma } from "@repo/database";
import { getPromptsParamsSchema, ansPromptsParamsSchema, ansPromptsBodySchema } from "../../../lib/validation-schema";

/**
 * Fetches all available prompts for users to answer.
 *
 * @route GET /user/:publicKey/prompts
 * @param {string} publicKey - Wallet public key (in URL params, not used in query).
 * @returns {200} Returns array of prompts.
 * @returns {500} On error. Returns error message.
 */
export const getPrompts = async (req: Request, res: Response) => {
    const paramsValidation = getPromptsParamsSchema.safeParse(req.params);
    if (!paramsValidation.success) {
        res.status(400).json({
            success: false,
            error: paramsValidation.error.issues[0]?.message || "Invalid params",
        });
        return;
    }

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
    const paramsValidation = ansPromptsParamsSchema.safeParse(req.params);
    if (!paramsValidation.success) {
        return res.status(400).json({
            success: false,
            error: paramsValidation.error.issues[0]?.message || "Invalid params",
        });
    }

    const bodyValidation = ansPromptsBodySchema.safeParse(req.body);
    if (!bodyValidation.success) {
        return res.status(400).json({
            success: false,
            error: bodyValidation.error.issues[0]?.message || "Invalid body",
        });
    }

    const { publicKey } = paramsValidation.data;
    const { answers } = bodyValidation.data;

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

        console.log("[DEBUG] Received answers:", answers);

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
            error: "Failed to answer prompts",
        });
    }
};
