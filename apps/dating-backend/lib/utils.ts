import fs from "fs";
import * as anchor from "@coral-xyz/anchor";
import { Connection, Keypair } from "@solana/web3.js";
import { config } from "dotenv";

// Load environment variables from .env file
config();

// Load environment variables
if (!process.env.WALLET_PATH) {
  throw new Error("WALLET_PATH environment variable is not set");
}

if (!process.env.RPC_URL) {
  throw new Error("RPC_URL environment variable is not set");
}

// get the secret
const secret = JSON.parse(fs.readFileSync(process.env.WALLET_PATH, "utf8")); // for local testing

// get the key pair for the provider backend
const backendKeypair = Keypair.fromSecretKey(Uint8Array.from(secret));

const connection = new Connection(process.env.RPC_URL, "confirmed"); // devnet rpc connection

const wallet = new anchor.Wallet(backendKeypair);

const provider = new anchor.AnchorProvider(connection, wallet, {
  commitment: "confirmed",
});

anchor.setProvider(provider);
export { provider, connection, wallet }; // one time connection and wallet export
