import idl from "./escrow_sol_dating.json";
import { PublicKey } from "@solana/web3.js";
import { provider } from "./utils";
import * as anchor from "@coral-xyz/anchor";
import * as spl from "@solana/spl-token";
import * as web3 from "@solana/web3.js";

/**
 * VerificationPayment class handles escrow-based payment verification
 * for the dating app swipe functionality on Solana
 */
class VerificationPayment {
  private program: anchor.Program;
  private provider: anchor.AnchorProvider;
  private programId: PublicKey;

  constructor() {
    this.programId = new PublicKey(process.env.PROGRAM_ID!);
    this.provider = provider;
    this.program = new anchor.Program(idl as anchor.Idl, this.provider);
  }

  /**
   * Execute a swipe transaction for a user
   * @param userPubkey - The public key of the user performing the swipe
   * @returns Transaction signature and account information
   */
  public async swipe(userPubkey: string) {
    try {
      const user = new PublicKey(userPubkey);

      // Get the PDA for escrow profile
      const [escrow_profile_pda, escrow_profile_bump] =
        await anchor.web3.PublicKey.findProgramAddressSync(
          [Buffer.from("escrow-profile"), user.toBuffer()],
          this.program.programId
        );

      const [escrowConfigPda, escrowConfigBump] =
        anchor.web3.PublicKey.findProgramAddressSync(
          [
            Buffer.from("escrow-config"),
            this.provider.wallet.publicKey.toBuffer(),
          ],
          this.program.programId
        );

      const treasuryAta = await spl.getOrCreateAssociatedTokenAccount(
        this.provider.connection,
        this.provider.wallet.payer!,
        spl.NATIVE_MINT,
        this.provider.wallet.publicKey
      );

      const escrow_user_vault_pda = await spl.getAssociatedTokenAddress(
        spl.NATIVE_MINT,
        escrow_profile_pda,
        true // allowOwnerOffCurve: true because escrow_profile is a PDA
      );

      const tx = await this.program.methods
        .swipe()
        .accountsPartial({
          depositor: user,
          escrowConfig: escrowConfigPda,
          escrowProfile: escrow_profile_pda,
          treasury: treasuryAta.address,
          escrowUserVault: escrow_user_vault_pda,
          mint: spl.NATIVE_MINT,
          systemProgram: anchor.web3.SystemProgram.programId,
          associatedTokenProgram: spl.ASSOCIATED_TOKEN_PROGRAM_ID,
          tokenProgram: spl.TOKEN_PROGRAM_ID,
        })
        .signers([this.provider.wallet.payer!])
        .rpc();

      console.log("Swipe transaction signature:", tx);

      // Get the escrow profile account data
      const escrowProfileAccount =
        await this.program.account.escrowProfile.fetch(escrow_profile_pda);
      console.log("Depositor Account:", {
        nonce: escrowProfileAccount.nonce.abs().toNumber(),
        bump: escrowProfileAccount.bump,
      });

      // Get the treasury balance
      const treasuryAccount = await spl.getAssociatedTokenAddress(
        spl.NATIVE_MINT,
        this.provider.wallet.publicKey
      );
      console.log("Treasury Account:", treasuryAccount.toBase58());

      const treasuryAccountInfo =
        await this.provider.connection.getAccountInfo(treasuryAccount);
      console.log(
        "Treasury Account Info:",
        treasuryAccountInfo.lamports / web3.LAMPORTS_PER_SOL
      );

      return {
        signature: tx,
        nonce: escrowProfileAccount.nonce.abs().toNumber(),
        bump: escrowProfileAccount.bump,
        treasuryBalance: treasuryAccountInfo.lamports / web3.LAMPORTS_PER_SOL,
      };
    } catch (error) {
      console.error("Error during swipe transaction:", error);
      console.error("User pubkey:", userPubkey);
      throw error;
    }
  }

  /**
   * Check on-chain for existing escrow configs
   * @returns List of all escrow config accounts
   */
  public async testConnection() {
    try {
      const accounts = await this.program.account.escrowConfig.all();
      console.log("Found escrow configs:", accounts.length);
      return accounts;
    } catch (error) {
      console.error("Error testing connection:", error);
      throw error;
    }
  }

  /**
   * Verify a swipe transaction by its signature
   * @param txSignature - The transaction signature to verify
   * @returns Verification result with transaction details
   */
  public async verifySwipes(txSignature: string) {
    try {
      // Validate signature format
      if (!txSignature || txSignature.length < 80) {
        throw new Error("Invalid transaction signature format");
      }

      console.log(
        `\n🔍 Verifying transaction: ${txSignature.substring(0, 20)}...`
      );

      // Fetch the transaction with retry logic
      const tx = await this.provider.connection.getParsedTransaction(
        txSignature,
        {
          maxSupportedTransactionVersion: 0,
          commitment: "confirmed",
        }
      );

      // Check if transaction exists
      if (!tx) {
        console.error("❌ Transaction not found or not yet confirmed");
        return {
          isValid: false,
          signature: txSignature,
          error: "Transaction not found or not yet confirmed on the blockchain",
          status: "NOT_FOUND",
        };
      }

      // Check if transaction was successful
      const isSuccess = tx.meta?.err === null;

      if (!isSuccess) {
        console.error("❌ Transaction failed:", tx.meta?.err);
        return {
          isValid: false,
          signature: txSignature,
          error: tx.meta?.err,
          status: "FAILED",
          blockTime: tx.blockTime,
          slot: tx.slot,
        };
      }

      // Extract relevant transaction details
      const computeUnitsConsumed = tx.meta?.computeUnitsConsumed || 0;
      const fee = tx.meta?.fee || 0;
      const logMessages = tx.meta?.logMessages || [];

      // Check if it's a swipe instruction
      const isSwipeInstruction = logMessages.some((log) =>
        log.includes("Instruction: Swipe")
      );

      console.log("✅ Transaction verified successfully");
      console.log(`   - Status: Success`);
      console.log(`   - Compute Units: ${computeUnitsConsumed}`);
      console.log(`   - Fee: ${fee / web3.LAMPORTS_PER_SOL} SOL`);
      console.log(`   - Is Swipe: ${isSwipeInstruction ? "Yes" : "No"}`);

      return {
        isValid: true,
        signature: txSignature,
        status: "SUCCESS",
        blockTime: tx.blockTime,
        slot: tx.slot,
        computeUnitsConsumed,
        fee: fee / web3.LAMPORTS_PER_SOL,
        isSwipeInstruction,
        preBalances: tx.meta?.preBalances,
        postBalances: tx.meta?.postBalances,
        logMessages: logMessages.filter(
          (log) => log.includes("Program log:") || log.includes("Error")
        ),
      };
    } catch (error) {
      console.error("❌ Error verifying transaction:", error);

      return {
        isValid: false,
        signature: txSignature,
        error: error instanceof Error ? error.message : String(error),
        status: "ERROR",
      };
    }
  }
}

const verificationPayment = new VerificationPayment();

export default verificationPayment; // global singleton instance

// TESTING MAIN FUNCTION
async function main() {
  try {
    const verificationPayment = new VerificationPayment();

    for (let i = 1; i <= 2; i++) {
      try {
        console.log(`\n=== Swipe #${i} ===`);
        const response = await verificationPayment.swipe(
          "EwYpz3rThMENWihdWFGhCF2sKC2765XxFTomgctu6zKN"
        );

        // Verify the transaction
        const verification = await verificationPayment.verifySwipes(
          response.signature
        );

        if (verification.isValid) {
          console.log(`✓ Swipe #${i} completed and verified successfully`);
        } else {
          console.error(
            `⚠️  Swipe #${i} executed but verification failed: ${verification.error || verification.status}`
          );
        }
      } catch (error) {
        console.error(`✗ Swipe #${i} failed, continuing with next swipe...`);
        // Continue to next swipe even if this one fails
      }
    }

    console.log("\n=== All swipes completed ===");
  } catch (error) {
    console.error("Fatal error in main:", error);
    process.exit(1);
  }
}

main();
