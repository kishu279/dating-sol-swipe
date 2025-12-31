import { Router } from "express";
import * as userController from "./user.controller";

const router = Router();

// User creation and profile management
router.post("/user", userController.createUser);
router.post("/user/profile", userController.createProfile);
router.put("/user/profile", userController.updateProfile);

// User retrieval
router.get("/user/:publicKey", userController.getUserById);

// User preferences management
router.post("/user/:publicKey/preferences", userController.setUserPreferences);
router.get("/user/:publicKey/preferences", userController.getUserPreferences);

// User prompts
router.get("/user/:publicKey/prompts", userController.getPrompts);
router.post("/user/:publicKey/prompts", userController.ansPrompts);

// PAYMENT MIDDLEWARE TESTING ROUTE

import { paymentMiddleware } from "@x402/express";
import { x402ResourceServer, HTTPFacilitatorClient } from "@x402/core/server";
import { registerExactSvmScheme } from "@x402/svm/exact/server";

// payer wallet
const walletAddress = "Cw2VW7tg7inFCLDSQBy52LyKHKZiqALe2JNadGnQFacL"; // seller public key

// Create facilitator client (testnet)
const facilitatorClient = new HTTPFacilitatorClient({
  url: "https://x402.org/facilitator",
});

// Create resource server and register EVM scheme
const server = new x402ResourceServer(facilitatorClient);
registerExactSvmScheme(server);

router.use(
  paymentMiddleware(
    {
      "GET /api/user/:publicKey/next-suggestion": {
        accepts: [
          {
            scheme: "exact",
            price: "$0.001", // USDC amount in dollars
            // network: "********", // Base Sepolia (CAIP-2 format)

            // network: "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp", // Solana mainnet

            network: "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
            payTo: walletAddress,
          },
        ],
        description: "Get the new suggestions according to the preferences",
        mimeType: "application/json",
      },
    },
    server
  )
);

// Get the next suggestion
router.get(
  "/user/:publicKey/next-suggestion",
  userController.getNextSuggestion
);

export default router;
