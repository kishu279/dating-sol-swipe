import { Router } from "express";
import * as userController from "./user.controller";
import verificationPayment from "../../../lib/backend-verification-payment";
import type { NextFunction, Request, Response } from "express";
import { HTTPFacilitatorClient } from "@x402/core/http";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { registerExactSvmScheme } from "@x402/svm/exact/server";
import { MOCK_DATA, type ScrollDataType } from "../../../constants/scroll-data";

const router = Router();

// User creation and profile management
router.post("/user", userController.createUser);
router.post("/user/profile", userController.createProfile);
router.put("/user/profile", userController.updateProfile);

// PAYMENT MIDDLEWARE TESTING ROUTE - MUST BE BEFORE /user/:publicKey
const walletAddress = "2QQoF2aAW2sfWboXKpm5pSF5QwfLGgz8MJHfi3uVR2KV"; // seller public key

// Create facilitator client (testnet)
const facilitatorClient = new HTTPFacilitatorClient({
  url: "https://x402.org/facilitator",
});

const server = new x402ResourceServer(facilitatorClient);
registerExactSvmScheme(server);

router.use(
  paymentMiddleware(
    {
      "GET /user/next-suggestion": {
        accepts: [
          {
            scheme: "exact",
            price: "$0.1",
            network: "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
            payTo: walletAddress,
            extra: {
              asset: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU", // USDC devnet token mint
            },
          },
        ],
        description: "Get the new suggestions according to the preferences",
        mimeType: "application/json",
      },
    },
    server
  )
);

// Get the next suggestion - protected by payment middleware
router.get(
  "/user/next-suggestion",
  userController.getNextSuggestion
);

// User retrieval - MUST BE AFTER specific routes like /user/next-suggestion
router.get("/user/:publicKey", userController.getUserById);

// User preferences management
router.post("/user/:publicKey/preferences", userController.setUserPreferences);
router.get("/user/:publicKey/preferences", userController.getUserPreferences);

// User prompts
router.get("/user/:publicKey/prompts", userController.getPrompts);
router.post("/user/:publicKey/prompts", userController.ansPrompts);

export default router;

async function transactionMiddleware(req: Request, res: Response, next: NextFunction) {
  const { publicKey } = req.params;
  try {
    // verification logic with the jwt token from payment middleware

    // Simulate payment verification logic
    // const paymentResponse = await verificationPayment.swipe(publicKey!);

    // const verification = await verificationPayment.verifySwipes(
    //   paymentResponse.signature
    // );

    // if (verification.isValid) {
    //   console.log(`✓ Swipe completed and verified successfully`);
    //   next();
    // } else {
    //   console.error(
    //     `⚠️  ${publicKey} Swipe executed but verification failed: ${verification.error || verification.status}`
    //   );

    //   return res.status(402).json({
    //     error: "Payment required to access this resource.",
    //     message: "Payment verification failed.",
    //   });
    // }


  } catch (error) {
    return res
      .status(402)
      .json({ error: "Payment required to access this resource." });
  }
}