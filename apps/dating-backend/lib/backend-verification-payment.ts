import idl from "./escrow_sol_dating.json";
import { PublicKey } from "@solana/web3.js";
import { provider } from "./utils";
import * as anchor from "@coral-xyz/anchor";
import * as spl from "@solana/spl-token";
import * as web3 from "@solana/web3.js";

// declare program id
const programId = new PublicKey(process.env.PROGRAM_ID!);
const program = new anchor.Program(idl as anchor.Idl, provider);

// cheks on chain is there any config for escrow present or not
// async function testConnection() {
//   const accounts = await program.account.escrowConfig.all();
//   console.log("Found escrow configs:", accounts.length);
// }

// testConnection();
// what i have todo
// 1. config already deployed
//

async function swipe(userPubkey: string) {
  const user = new PublicKey(userPubkey);

  // get the PDA for escrow profile
  const [escrow_profile_pda, escrow_profile_bump] =
    await anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("escrow-profile"), user.toBuffer()],
      program.programId
    );

  const [escrowConfigPda, escrowConfigBump] =
    anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("escrow-config"), provider.wallet.publicKey.toBuffer()],
      program.programId
    );

  const treasuryAta = await spl.getOrCreateAssociatedTokenAccount(
    provider.connection,
    provider.wallet.payer!,
    spl.NATIVE_MINT,
    provider.wallet.publicKey
  );

  const escrow_user_vault_pda = await spl.getAssociatedTokenAddress(
    spl.NATIVE_MINT,
    escrow_profile_pda,
    true // allowOwnerOffCurve: true because escrow_profile is a PDA
  );

  const tx = await program.methods
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
    .signers([provider.wallet.payer!])
    .rpc();

  console.log("Swipe transaction signature:", tx); // transaction signature

  //   get the escrow profile account data
  const escrowProfileAccount =
    await program.account.escrowProfile.fetch(escrow_profile_pda);
  console.log("Depositor Account:", {
    nonce: escrowProfileAccount.nonce.abs().toNumber(),
    bump: escrowProfileAccount.bump,
  });

  //   get the treasury balance
  const treasuryAccount = await spl.getAssociatedTokenAddress(
    spl.NATIVE_MINT,
    provider.wallet.publicKey
  );
  console.log("Treasury Account:", treasuryAccount.toBase58());

  const treasuryAccountInfo =
    await provider.connection.getAccountInfo(treasuryAccount);
  console.log(
    "Treasury Account Info:",
    treasuryAccountInfo.lamports / web3.LAMPORTS_PER_SOL
  );
}


// TESTING MAIN FUNCTION
async function main() {
  await swipe("EwYpz3rThMENWihdWFGhCF2sKC2765XxFTomgctu6zKN"); // user public key
  await swipe("EwYpz3rThMENWihdWFGhCF2sKC2765XxFTomgctu6zKN"); // user public key
  await swipe("EwYpz3rThMENWihdWFGhCF2sKC2765XxFTomgctu6zKN"); // user public key
  await swipe("EwYpz3rThMENWihdWFGhCF2sKC2765XxFTomgctu6zKN"); // user public key
  await swipe("EwYpz3rThMENWihdWFGhCF2sKC2765XxFTomgctu6zKN"); // user public key
}

// main();
