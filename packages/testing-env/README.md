# x402 Payment Testing Client

Test client for verifying x402 payment flow on Solana devnet USDC.

## Setup

### 1. Install Dependencies

Dependencies are already installed via bun:
```bash
bun install
```

### 2. Configure Wallet

Create a `test-wallet.json` file with your Solana wallet's private key:

```json
[123,45,67,89,...]
```

**Format:** Array of 64 numbers representing the private key bytes.

**How to get your private key:**
- From Phantom: Export private key → Convert to byte array
- From Solana CLI: `solana-keygen recover` then copy from `~/.config/solana/id.json`

### 3. Fund Your Wallet

Ensure your test wallet has:
- **SOL**: For transaction fees (~0.01 SOL minimum)
  - Get from: https://solfaucet.com/
- **USDC (Devnet)**: For making payments (~1 USDC minimum)
  - Get from: https://spl-token-faucet.com/

### 4. Configure Environment

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

Edit `.env`:
```env
API_URL=http://localhost:3000
WALLET_PATH=./test-wallet.json
USER_PUBLIC_KEY=<your_wallet_public_key>
```

## Running the Test

### Start the Backend Server

In the root directory:
```bash
bun dev
```

### Run the Payment Test

In this directory:
```bash
bun run test:payment
```

## Expected Output

```
🚀 Starting x402 Payment Test Client

📂 Loading wallet from: ./test-wallet.json
✅ Wallet loaded: ABC123...

💰 Checking wallet balances...
   SOL Balance: 0.5000 SOL
   USDC Balance: 10.0 USDC

🔧 Setting up x402 paywall client...
✅ x402 client configured

📡 Making request to: http://localhost:3000/api/user/.../next-suggestion
   Expecting 402 Payment Required...

📥 Response Status: 200 OK

✅ SUCCESS! Payment flow completed.

📊 Response Data:
{
  "success": true,
  "message": "Next suggestion fetched successfully",
  "data": { ... }
}

💳 Verifying payment in treasury wallet...
   Treasury USDC Balance: 0.3 USDC

🎉 Test completed successfully!
```

## How It Works

1. **Initial Request**: Client makes GET request to protected endpoint
2. **402 Response**: Server returns 402 Payment Required with payment options
3. **x402 Handles Payment**: `@x402/paywall` client automatically:
   - Detects 402 response
   - Reads payment requirements
   - Creates and sends USDC payment transaction on Solana
   - Obtains payment proof
4. **Retry with Proof**: Client retries request with payment proof
5. **Success**: Server validates payment and returns 200 with data

## Troubleshooting

### "Insufficient funds" error
- Ensure wallet has both SOL (for fees) and USDC (for payment)
- Check balances on [Solana Explorer](https://explorer.solana.com/?cluster=devnet)

### "Wallet file not found"
- Create `test-wallet.json` with your private key array
- Update `WALLET_PATH` in `.env`

### "Connection refused"
- Ensure backend server is running (`bun dev` in root directory)
- Check `API_URL` in `.env` matches server address

### "Payment not received"
- Check treasury wallet on Solana Explorer
- Verify USDC token account exists
- Review transaction signature in output logs

## Files

- `x402-payment-test.ts` - Main test client script
- `.env` - Environment configuration (gitignored)
- `.env.example` - Example environment configuration
- `test-wallet.json` - Your wallet private key (gitignored)
- `test-wallet.json.example` - Example wallet format

## Security Notes

⚠️ **NEVER commit `test-wallet.json` or `.env` to version control!**

These files are already in `.gitignore`. They contain sensitive private keys and should only be used for local testing on devnet.
