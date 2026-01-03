import { Keypair, Connection, PublicKey } from "@solana/web3.js";
import { x402Client, x402HTTPClient } from "@x402/core/client";
import { registerExactSvmScheme } from "@x402/svm/exact/client";
import { createKeyPairSignerFromBytes } from "@solana/kit";
import fs from "fs";
import { config } from "dotenv";
import * as spl from "@solana/spl-token";

// Load environment variables
config();

const API_URL = process.env.API_URL || "http://localhost:3000";
const WALLET_PATH = process.env.WALLET_PATH || "./test-wallet.json";
const USER_PUBLIC_KEY =
    process.env.USER_PUBLIC_KEY || "EwYpz3rThMENWihdWFGhCF2sKC2765XxFTomgctu6zKN";

/**
 * x402 Payment Testing Client for Solana Devnet
 *
 * This script tests the x402 payment flow by:
 * 1. Making a request to a protected endpoint (expects 402)
 * 2. Extracting payment requirements from the 402 response
 * 3. Creating a payment payload using x402Client
 * 4. Retrying the request with payment signature (expects 200)
 */

async function main() {
    console.log("🚀 Starting x402 Payment Test Client\n");

    try {
        // Load wallet from file
        console.log(`📂 Loading wallet from: ${WALLET_PATH}`);
        const secretKey = JSON.parse(fs.readFileSync(WALLET_PATH, "utf8"));
        const payerKeypair = Keypair.fromSecretKey(Uint8Array.from(secretKey));
        console.log(`✅ Wallet loaded: ${payerKeypair.publicKey.toBase58()}\n`);

        // Setup Solana connection
        const connection = new Connection(
            "https://api.devnet.solana.com",
            "confirmed"
        );

        // Check wallet balances
        console.log("💰 Checking wallet balances...");
        const solBalance = await connection.getBalance(payerKeypair.publicKey);
        console.log(`   SOL Balance: ${(solBalance / 1e9).toFixed(4)} SOL`);

        // Check USDC balance
        const usdcMint = new PublicKey(
            "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
        );
        try {
            const usdcTokenAccount = await spl.getAssociatedTokenAddress(
                usdcMint,
                payerKeypair.publicKey
            );
            const usdcBalance = await connection.getTokenAccountBalance(
                usdcTokenAccount
            );
            console.log(`   USDC Balance: ${usdcBalance.value.uiAmount || 0} USDC\n`);
        } catch (e) {
            console.log("   USDC Balance: 0 USDC (no token account)\n");
        }

        // Create x402 client
        console.log("🔧 Setting up x402 client...");
        const x402 = new x402Client();

        // Convert Keypair to @solana/kit TransactionSigner
        const signer = await createKeyPairSignerFromBytes(payerKeypair.secretKey);

        // Register Solana payment scheme
        registerExactSvmScheme(x402, { signer });
        console.log("✅ x402 client configured\n");

        // Create HTTP client wrapper for header handling
        const httpClient = new x402HTTPClient(x402);

        // Make request to protected endpoint
        const endpoint = `${API_URL}/api/user/next-suggestion`;
        console.log(`📡 Making initial request to: ${endpoint}`);
        console.log("   Expecting 402 Payment Required...\n");

        // Step 1: Make initial request (expect 402)
        const initialResponse = await fetch(endpoint, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        console.log(`📥 Initial Response Status: ${initialResponse.status} ${initialResponse.statusText}`);

        if (initialResponse.status !== 402) {
            if (initialResponse.status === 200) {
                console.log("\n✅ Endpoint returned 200 (no payment required)");
                const data = await initialResponse.json();
                console.log(JSON.stringify(data, null, 2));
                return;
            }
            console.error(`\n❌ Expected 402, got ${initialResponse.status}`);
            const text = await initialResponse.text();
            console.error("Response:", text);
            return;
        }

        // Step 2: Extract payment requirements from 402 response
        console.log("\n💳 Processing payment requirements...");
        const responseBody = await initialResponse.json();

        const paymentRequired = httpClient.getPaymentRequiredResponse(
            (name) => initialResponse.headers.get(name),
            responseBody
        );

        console.log(`   x402 Version: ${paymentRequired.x402Version}`);
        console.log(`   Available payment options: ${paymentRequired.accepts.length}`);

        for (const req of paymentRequired.accepts) {
            console.log(`   - ${req.scheme} on ${req.network}: ${req.asset}`);
            console.log(`     Pay to: ${req.payTo}`);
            console.log(`     Amount: ${req.maxAmountRequired || req.amount || 'N/A'}`);
        }

        // Step 3: Create payment payload
        console.log("\n🔐 Creating payment payload...");
        const paymentPayload = await httpClient.createPaymentPayload(paymentRequired);
        console.log("   Payment payload created successfully");

        // Step 4: Get payment headers
        const paymentHeaders = httpClient.encodePaymentSignatureHeader(paymentPayload);
        console.log("   Payment signature encoded\n");

        // Step 5: Retry request with payment
        console.log("📡 Making authenticated request with payment...");
        const paidResponse = await fetch(endpoint, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...paymentHeaders,
            },
        });

        console.log(`📥 Response Status: ${paidResponse.status} ${paidResponse.statusText}`);

        if (paidResponse.status === 200) {
            const data = await paidResponse.json();
            console.log("\n✅ SUCCESS! Payment flow completed.");
            console.log("\n📊 Response Data:");
            console.log(JSON.stringify(data, null, 2));

            // Check settlement response
            try {
                const settleResponse = httpClient.getPaymentSettleResponse(
                    (name) => paidResponse.headers.get(name)
                );
                console.log("\n💰 Settlement Response:");
                console.log(JSON.stringify(settleResponse, null, 2));
            } catch (e) {
                console.log("\n💰 No settlement response in headers");
            }

            // Verify payment in treasury wallet
            console.log("\n💳 Verifying payment in treasury wallet...");
            const treasuryWallet = new PublicKey(
                "2QQoF2aAW2sfWboXKpm5pSF5QwfLGgz8MJHfi3uVR2KV"
            );
            const treasuryUsdcAccount = await spl.getAssociatedTokenAddress(
                usdcMint,
                treasuryWallet
            );
            try {
                const treasuryBalance = await connection.getTokenAccountBalance(
                    treasuryUsdcAccount
                );
                console.log(
                    `   Treasury USDC Balance: ${treasuryBalance.value.uiAmount || 0} USDC`
                );
            } catch (e) {
                console.log("   Treasury account not found or has no balance");
            }

            console.log("\n🎉 Test completed successfully!");
        } else {
            console.error(`\n❌ Payment failed with status: ${paidResponse.status}`);
            const text = await paidResponse.text();
            console.error("Response:", text);
        }
    } catch (error) {
        console.error("\n❌ Error during payment test:");
        console.error(error);
        process.exit(1);
    }
}

// Run the test
main();
