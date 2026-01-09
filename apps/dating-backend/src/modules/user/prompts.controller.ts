import type { Request, Response } from "express";
import { prisma } from "@repo/database";

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
            error: "Failed to answer prompts",
        });
    }
};
