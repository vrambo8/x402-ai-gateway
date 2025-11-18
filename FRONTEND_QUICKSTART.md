# Frontend Quick Start Guide

## What's Been Built

A complete React-based frontend for the x402 AI Gateway with:

- ✅ Clean chat interface with message history
- ✅ Real-time cost estimation before sending requests
- ✅ Wallet connection via private key input
- ✅ Model selection with pricing information
- ✅ Automatic x402 payment handling
- ✅ Token usage and refund tracking
- ✅ Responsive design with Tailwind CSS

## Project Structure

```
x402-frontend/
├── src/
│   ├── components/
│   │   ├── ChatInterface.jsx      # Main chat UI
│   │   ├── CostEstimator.jsx      # Cost display
│   │   ├── ModelSelector.jsx      # Model selection
│   │   └── WalletConnect.jsx      # Wallet connection
│   ├── services/
│   │   ├── apiClient.js           # API communication
│   │   └── paymentService.js      # x402 payment handling
│   ├── utils/
│   │   ├── models.js              # Model pricing data
│   │   └── tokenCounter.js        # Token estimation
│   ├── App.jsx                    # Main app
│   └── index.css                  # Tailwind styles
├── .env                           # Environment config
├── .env.example                   # Config template
├── package.json
└── README.md                      # Full documentation
```

## Quick Start (2 minutes)

### 1. Start the Backend

```bash
cd server
python -m uvicorn main:app --reload
# Backend will run on http://localhost:8000
```

### 2. Start the Frontend

In a new terminal:

```bash
cd x402-frontend
npm run dev
# Frontend will run on http://localhost:5173
```

### 3. Open in Browser

Navigate to http://localhost:5173

### 4. Connect Wallet

- Enter a testnet Ethereum private key
- ⚠️ **Security**: Only use test keys with no real funds!

### 5. Start Chatting

- Select a model (start with GPT-4o Mini for lower costs)
- Type your prompt
- View the estimated cost
- Click "Send"

## Configuration

The frontend is pre-configured for testnet in `.env`:

```env
VITE_API_URL=http://localhost:8000
VITE_NETWORK=Base Sepolia (Testnet)
VITE_CHAIN_ID=84532
```

To switch to mainnet, edit `.env`:

```env
VITE_NETWORK=Base Mainnet
VITE_CHAIN_ID=8453
```

**Important**: Make sure your backend is also configured for the same network!

## How It Works

Uses the official **x402-fetch SDK** for automatic payment handling:

1. **User enters prompt** → Frontend estimates cost
2. **User confirms** → `wrapFetchWithPayment()` sends request
3. **SDK detects 402** → Automatically creates & signs payment
4. **SDK retries** → Sends request with payment header
5. **Backend verifies** → Calls OpenAI and settles payment
6. **Response returned** → With usage stats and refund info

All payment logic is automatic - just wrap fetch with the SDK!

## Production Build

```bash
cd x402-frontend
npm run build
```

Output is in `dist/` directory - deploy to any static hosting service.

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool (fast, modern)
- **Tailwind CSS** - Utility-first styling
- **x402-fetch** - Official x402 SDK for automatic payment handling
- **viem** - Ethereum library for wallet operations
- **ethers.js v6** - Wallet management

## Next Steps

See [x402-frontend/README.md](x402-frontend/README.md) for:
- Detailed documentation
- Troubleshooting guide
- Deployment options
- Security considerations
- Future enhancements

## Need Help?

- **API not responding?** Check backend is running: `curl http://localhost:8000/health`
- **Payment fails?** Ensure wallet has USDC on the correct network
- **Build errors?** Try `rm -rf node_modules && npm install`

Enjoy using your crypto-powered AI gateway! 🚀
