# x402 AI Gateway

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![Base Network](https://img.shields.io/badge/Base-Network-0052FF.svg)](https://base.org)

**Pay for AI API access with cryptocurrency**

A minimal OpenAI proxy that accepts x402 cryptocurrency payments. No OpenAI subscription required—just pay with your crypto wallet using USDC on Base network.

> 🚀 **Want a hosted solution?** Check out our managed platform with production-ready infrastructure, rate limiting, analytics, and 99.9% uptime SLA.

> ⚠️ **Security Notice**: This is a self-hosted solution that handles API keys and private keys. Please read our [Security Policy](SECURITY.md) before deploying to production.

## What is this?

This is a simple HTTP proxy that:
1. Receives OpenAI API requests
2. Requires x402 cryptocurrency payment (USDC on Base)
3. Verifies payment with facilitator
4. Forwards request to OpenAI
5. Returns the response

Perfect for:
- Building AI agents with crypto payments
- Enabling pay-per-use AI access
- Web3 applications needing AI capabilities
- International users without credit cards

## Features

- ✅ x402 payment protocol integration
- ✅ USDC payments on Base network (testnet & mainnet)
- ✅ Automatic cost estimation
- ✅ OpenAI API forwarding
- ✅ React frontend with wallet integration
- ✅ Docker deployment
- ✅ Dev mode for testing

## Table of Contents

- [Quick Start](#quick-start)
- [Detailed Setup Guide](#detailed-setup-guide)
  - [Option 1: Local Python Development](#option-2-local-python-development)
  - [Option 2: Full Stack with Frontend](#option-3-full-stack-with-frontend)
- [Getting Testnet USDC](#getting-testnet-usdc)
- [Usage Examples](#usage-examples)
- [Configuration Reference](#configuration-reference)
- [Troubleshooting](#troubleshooting)
- [Architecture](#architecture)
- [Project Structure](#project-structure)

## Quick Start

**TL;DR**: Run the entire stack with Docker in under 5 minutes:

```bash
git clone https://github.com/vrambo8/x402-ai-gateway.git
cd x402-ai-gateway
cp server/.env.example server/.env
# Edit server/.env with your OpenAI API key and wallet address
docker-compose up -d
```

Gateway runs at `http://localhost:8000`, frontend at `http://localhost:5173`

---

## Detailed Setup Guide

### Prerequisites

Before you begin, ensure you have:

- **For Docker deployment**: Docker 20.10+ and Docker Compose 2.0+
- **For local development**: Python 3.11+ and pip
- **For frontend**: Node.js 18+ and npm
- **Required credentials**:
  - OpenAI API key ([get one here](https://platform.openai.com/api-keys))
  - Ethereum wallet address on Base network and CDP credentials for facilitator on mainnet (for receiving payments)
  - Optional: Private key (for making payments as a client)

### Option 1: Docker Deployment (Recommended)

This is the fastest way to get started. Docker handles all dependencies.

#### Step 1: Clone the Repository

```bash
git clone https://github.com/vrambo8/x402-ai-gateway.git
cd x402-ai-gateway
```

#### Step 2: Configure the Server

```bash
# Copy the example environment file
cp server/.env.example server/.env
```

Edit `server/.env` with your preferred text editor:

```bash
nano server/.env  # or vim, code, etc.
```

**Required settings for testnet:**

```env
# OpenAI API Configuration
OPENAI_API_KEY=sk-proj-your-actual-openai-key-here

# Your wallet addresses (can be the same address for both)
X402_TESTNET_WALLET_ADDRESS=0xYourWalletAddressHere
X402_MAINNET_WALLET_ADDRESS=0xYourWalletAddressHere

# x402 Facilitator (leave as default)
X402_FACILITATOR_URL=https://x402.org/facilitator
CDP_API_KEY="CDP_API_KEY" "only needed for mainnet"
CDP_API_KEY_SECRET="CDP_API_KEY_SECRET" "only needed for mainnet"

# Server Configuration
API_PORT=8000
API_HOST=0.0.0.0
LOG_LEVEL=INFO

# Start in development mode (uses testnet + mock OpenAI for testing)
DEV_MODE=true
```

**Important**:
- Replace `sk-proj-your-actual-openai-key-here` with your real OpenAI API key
- Replace `0xYourWalletAddressHere` with your Ethereum wallet address
- Keep `DEV_MODE=true` for testing (uses Base Sepolia testnet)

#### Step 3: Start the Services

```bash
# Start all services in detached mode
docker-compose up -d

# View logs to verify everything is running
docker-compose logs -f
```

You should see output like:
```
api-1  | INFO:     Uvicorn running on http://0.0.0.0:8000
api-1  | INFO:     Application startup complete.
```

Press `Ctrl+C` to exit logs (services keep running).

#### Step 4: Verify the Server is Running

```bash
# Check health endpoint
curl http://localhost:8000/health
```

Expected response:
```json
{"status":"healthy","version":"0.1.0"}
```

#### Step 5: Test the Payment Flow

Try making a request without payment (should return 402):

```bash
curl -v -X POST http://localhost:8000/v1/responses \
  -H "Content-Type: application/json" \
  -d '{
      'model': 'gpt-3.5-turbo', 
      'input': 'Tell me a joke about plumbers', 
      'max_output_tokens': 1000
      }'
```

Expected response:
```
< HTTP/1.1 402 Payment Required
< x-accept-payment: ...
```

This is correct! The server is requesting payment. See [Usage Examples](#usage-examples) for how to make requests with payment.

#### Step 6: Stop the Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (if you want a clean slate)
docker-compose down -v
```

### Option 1: Local Python Development

For development without Docker, you can run the server directly with Python.

#### Step 1: Clone and Setup Environment

```bash
git clone https://github.com/yourusername/x402-ai-gateway.git
cd x402-ai-gateway
```

#### Step 2: Create Python Virtual Environment

```bash
# Create virtual environment
python3 -m venv venv

# Activate it (macOS/Linux)
source venv/bin/activate

# Activate it (Windows)
# venv\Scripts\activate
```

Your terminal should now show `(venv)` prefix.

#### Step 3: Install Dependencies

```bash
# Install all Python dependencies
pip install -r requirements.txt
```

This will install:
- FastAPI (web framework)
- Uvicorn (ASGI server)
- x402 SDK (payment protocol)
- tiktoken (token counting)
- And other dependencies

#### Step 4: Configure Environment

```bash
# Copy environment file
cp server/.env.example server/.env

# Edit with your credentials
nano server/.env
```

Use the same configuration as in [Option 1, Step 2](#step-2-configure-the-server).

#### Step 5: Run the Server

```bash
# From project root
cd server
python main.py
```

Or with uvicorn directly for auto-reload during development:

```bash
cd server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Server will start at `http://localhost:8000`

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

#### Step 6: Test the Server

```bash
# In a new terminal
curl http://localhost:8000/health
```

Expected: `{"status":"healthy","version":"0.1.0"}`

### Option 3: Full Stack with Frontend

Run both the backend gateway and the React frontend for a complete user interface.

#### Backend Setup

Follow either [Option 1](#option-1-local-python-development) above to start the backend.

Verify it's running: `curl http://localhost:8000/health`

#### Frontend Setup

##### Step 2: Navigate to Frontend Directory

```bash
# From project root
cd frontend
```

##### Step 2: Install Dependencies

```bash
npm install
```

This will install:
- React 19
- Vite (build tool)
- Tailwind CSS
- x402-fetch SDK (payment handling)
- ethers.js and viem (wallet management)

##### Step 3: Configure Frontend Environment

```bash
# Copy environment template
cp .env.example .env

# Edit configuration
nano .env
```

**For testnet (recommended for development):**

```env
# Backend API URL
VITE_API_URL=http://localhost:8000

# Development mode (uses Base Sepolia testnet)
VITE_DEV_MODE=true

# Network configuration (auto-set based on DEV_MODE)
# VITE_NETWORK will be "Base Sepolia (Testnet)"
# VITE_CHAIN_ID will be 84532
```

**For mainnet (production):**

```env
VITE_API_URL=http://localhost:8000
VITE_DEV_MODE=false
```

Make sure your backend `server/.env` has the same network settings!

##### Step 4: Start Development Server

```bash
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

Frontend will start at `http://localhost:5173`

##### Step 5: Open in Browser

```bash
# macOS
open http://localhost:5173

# Linux
xdg-open http://localhost:5173

# Windows
start http://localhost:5173

# Or just visit http://localhost:5173 in your browser
```

##### Step 6: Connect Wallet and Start Chatting

1. **Enter your Ethereum private key** in the wallet connection field
   - ⚠️ **For testnet (DEV_MODE=true)**: Use a dedicated test wallet with no real funds
   - ⚠️ **For mainnet (DEV_MODE=false)**: You must use a wallet with real USDC for payments
   - **Security**: Only enter private keys for wallets you control and trust this application with
   - Your wallet address will be displayed once connected

2. **Get USDC for your wallet**
   - **Testnet**: See [Getting Testnet USDC](#getting-testnet-usdc) below
   - **Mainnet**: Fund your wallet with USDC on Base network for actual payments

3. **Select an OpenAI model** from the dropdown
   - Try GPT-3.5 Turbo for fast, cheap responses
   - Or GPT-4o for more advanced capabilities

4. **Type your prompt** and view the estimated cost
   - Costs are shown in USDC
   - Adjust max tokens slider if needed

5. **Click Send**
   - Payment is handled automatically via x402 protocol!
   - You'll see the AI response and payment settlement info

##### Step 7: Build for Production

```bash
# Create optimized production build
npm run build

# Preview the production build locally
npm run preview
```

Build output will be in `frontend/dist/` directory. Deploy this to:
- Vercel: `vercel --prod`
- Netlify: `netlify deploy --prod --dir=dist`
- Any static hosting service

---

## Getting Testnet USDC

To test the payment flow on Base Sepolia testnet, you need testnet USDC.

### Step 1: Get Testnet ETH

You need a small amount of ETH for gas fees on Base Sepolia.

1. Visit [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)
2. Enter your wallet address
3. Request testnet ETH
4. Wait a few seconds for confirmation

### Step 2: Get Testnet USDC

**Option A: Use a faucet** (if available)
- Check [Circle's testnet USDC faucet](https://faucet.circle.com/)
- Or search for "Base Sepolia USDC faucet"

**Option B: Bridge from another testnet**
- Use [Superbridge](https://superbridge.app/) to bridge USDC to Base Sepolia

**Option C: Deploy your own test USDC** (advanced)
- Deploy an ERC-20 token contract for testing

### Step 3: Verify Balance

```bash
# Check your balance on Base Sepolia explorer
open https://sepolia.basescan.org/address/YOUR_WALLET_ADDRESS
```

---

## Usage Examples

### Example 1: Python Client with x402 SDK

The [client/](client/) directory contains a full example using the x402 Python SDK.

#### Setup

```bash
cd client
cp .env.example .env
nano .env
```

Configure your credentials:

```env
# Option 1: Use Coinbase Developer Platform
CDP_API_KEY_ID=your-key-id
CDP_API_KEY_SECRET=your-key-secret
CDP_WALLET_SECRET=your-wallet-secret

# Option 2: Use raw Ethereum private key (without 0x prefix)
ETH_PRIVATE_KEY=your-private-key-here
```

#### Run the Example

```bash
# Make sure server is running first
cd ../server
python main.py

# In another terminal, run the client
cd ../client
python main.py
```

The client will:
1. Connect to the gateway
2. Receive 402 Payment Required
3. Automatically create and sign payment
4. Retry with payment header
5. Receive AI response
6. Display payment settlement info

### Example 2: cURL with Manual Payment Headers

For testing or integration, you can manually construct payment headers.

```bash
# Step 1: Get payment requirements
curl -v http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-3.5-turbo","messages":[{"role":"user","content":"Hi"}]}'

# Note the x-accept-payment header in response
# Step 2: Create payment using x402 SDK or manually
# Step 3: Retry with x-payment header (see x402 docs for format)
```

### Example 3: JavaScript/TypeScript with x402-fetch

```javascript
import { wrapFetchWithPayment } from 'x402-fetch';
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';

// Setup wallet
const account = privateKeyToAccount('0x...');
const wallet = createWalletClient({
  account,
  chain: baseSepolia,
  transport: http()
});

// Wrap fetch with x402 payment handling
const paymentFetch = wrapFetchWithPayment(fetch, { wallet });

// Make request - payment is automatic!
const response = await paymentFetch('http://localhost:8000/v1/chat/completions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: 'Hello!' }]
  })
});

const data = await response.json();
console.log(data);
```

---

## Configuration Reference

### Server Configuration (`server/.env`)

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | - | Yes |
| `X402_TESTNET_WALLET_ADDRESS` | Wallet for receiving testnet payments | `0x000...` | Yes |
| `X402_MAINNET_WALLET_ADDRESS` | Wallet for receiving mainnet payments | `0x000...` | Yes |
| `X402_FACILITATOR_URL` | x402 facilitator endpoint | `https://x402.org/facilitator` | No |
| `API_PORT` | Server port | `8000` | No |
| `API_HOST` | Server host | `0.0.0.0` | No |
| `LOG_LEVEL` | Logging level (DEBUG, INFO, WARNING, ERROR) | `INFO` | No |
| `DEV_MODE` | Use testnet + mock OpenAI responses | `true` | No |

### Frontend Configuration (`frontend/.env`)

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8000` | Yes |
| `VITE_DEV_MODE` | Development mode (testnet) | `true` | No |

When `VITE_DEV_MODE=true`:
- Network: Base Sepolia (Testnet)
- Chain ID: 84532

When `VITE_DEV_MODE=false`:
- Network: Base Mainnet
- Chain ID: 8453

### Client Configuration (`client/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `CDP_API_KEY_ID` | Coinbase Developer Platform API Key ID | One of CDP or ETH |
| `CDP_API_KEY_SECRET` | CDP API Secret | One of CDP or ETH |
| `CDP_WALLET_SECRET` | CDP Wallet Secret | One of CDP or ETH |
| `ETH_PRIVATE_KEY` | Raw Ethereum private key (without 0x) | One of CDP or ETH |

---

## Troubleshooting

### Server Issues

**Problem**: Server won't start - "Port 8000 already in use"

```bash
# Find and kill the process using port 8000
lsof -ti:8000 | xargs kill -9

# Or use a different port in server/.env
API_PORT=8001
```

**Problem**: "OpenAI API key not found"

- Check that `OPENAI_API_KEY` is set in `server/.env`
- Make sure there are no extra spaces or quotes
- Verify the key is valid at https://platform.openai.com/api-keys

**Problem**: Docker containers won't start

```bash
# Check Docker is running
docker ps

# View detailed logs
docker-compose logs

# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Frontend Issues

**Problem**: "Cannot connect to backend"

- Verify backend is running: `curl http://localhost:8000/health`
- Check `VITE_API_URL` in `frontend/.env` matches your backend URL
- Check browser console for CORS errors
- If using Docker, make sure ports are mapped correctly

**Problem**: "Payment failed - insufficient balance"

- Check you have testnet USDC in your wallet
- Verify you're on the correct network (Base Sepolia for testnet)
- Make sure backend and frontend are both configured for same network
- Check wallet has ETH for gas fees

**Problem**: "Network mismatch"

- Frontend `VITE_DEV_MODE` must match backend `DEV_MODE`
- Both should be `true` for testnet or `false` for mainnet
- Restart both services after changing network config

### Payment Issues

**Problem**: "402 Payment Required" but can't create payment

- Ensure your wallet has USDC balance
- Verify you're using the correct chain ID
- Check that x402 facilitator is accessible
- Review browser/terminal logs for detailed error messages

**Problem**: "Payment verification failed"

- Make sure the payment was signed with the correct private key
- Verify the payment network matches the server network
- Check that payment amount covers the request cost
- Ensure payment hasn't expired (check timestamp)

### General Tips

1. **Check logs first**: Most issues are revealed in logs
   - Server: `docker-compose logs api` or terminal output
   - Frontend: Browser developer console (F12)
   - Client: Terminal output

2. **Verify network consistency**: All components must use same network
   - Check `DEV_MODE` in `server/.env`
   - Check `VITE_DEV_MODE` in `frontend/.env`
   - Check wallet is connected to correct network

3. **Start fresh**: When in doubt, restart everything
   ```bash
   docker-compose down -v
   docker-compose up -d
   ```

4. **Test step-by-step**:
   - Health check: `curl http://localhost:8000/health`
   - 402 response: Try request without payment
   - Payment flow: Use provided client examples first

---


## Roadmap

- [x] Basic x402 payment integration
- [x] OpenAI proxy forwarding
- [x] Token-based cost calculation
- [x] Docker deployment
- [x] React frontend with wallet integration
- [ ] Support more AI providers (Anthropic, Google, Mistral)
- [ ] Multi-currency support (ETH, SOL)
- [ ] Client SDKs (JavaScript, Python)
- [ ] MetaMask/WalletConnect integration

## Security

Please read our [Security Policy](SECURITY.md) for:
- Vulnerability reporting procedures
- Security best practices for deployment
- Credential management guidelines
- Known security considerations

**CRITICAL**: Never commit `.env` files or files containing API keys, private keys, or wallet secrets to version control.

## Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md)

Areas for contribution:
- Support for additional AI providers
- Escrow model implementation
- Client SDK development
- Documentation improvements
- Testing and bug fixes
- UI/UX enhancements

## Use Cases

- **AI Agent Platforms**: Allow users to pay for AI access with crypto wallets
- **Developer Tools**: Monetize AI API access without traditional payment infrastructure
- **Micropayments**: Pay-per-use pricing for AI services
- **Web3 Applications**: Integrate AI capabilities with blockchain-native payments
- **International Access**: Enable global AI access without credit cards

## License

MIT License - see [LICENSE](LICENSE)

## Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/x402-ai-gateway/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/x402-ai-gateway/discussions)

## Learn More

- [x402 Protocol](https://x402.org)
- [Base Network](https://base.org)
- [OpenAI API](https://platform.openai.com/docs)
- [Coinbase Developer Platform](https://docs.cdp.coinbase.com/)

---

Built with ❤️ for the Web3 + AI community
