# x402 AI Gateway Frontend

A minimal React frontend for the x402 AI Gateway - a cryptocurrency-powered proxy for OpenAI's API.

## Features

- 💬 **Chat Interface**: Simple, clean chat UI for interacting with AI models
- 💰 **Cost Estimation**: Real-time cost calculation before sending requests
- 🔐 **Wallet Integration**: Connect using Ethereum private keys (testnet recommended)
- 🤖 **Model Selection**: Choose from multiple OpenAI models with pricing info
- 📊 **Usage Tracking**: View token usage and refund information for each request
- ⚡ **x402 Payment Protocol**: Automatic payment handling with escrow and refunds

## Tech Stack

- **React 18** with Vite
- **Tailwind CSS** for styling
- **x402-fetch** - Official x402 SDK for automatic payment handling
- **viem** - Ethereum library for wallet operations
- **ethers.js v6** - Wallet management

## Prerequisites

- Node.js 18+ and npm
- A running instance of the x402-ai-gateway server
- An Ethereum wallet with some USDC on Base Sepolia (testnet) or Base (mainnet)

## Installation

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

```bash
cp .env.example .env
```

Edit `.env` to match your setup:

```env
# API Configuration
VITE_API_URL=http://localhost:8000

# Network Configuration
VITE_NETWORK=Base Sepolia (Testnet)
VITE_CHAIN_ID=84532
```

## Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Production Build

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

The build outputs to the `dist/` directory and can be deployed to any static hosting service.

## Usage

### 1. Start the Backend

Make sure the x402-ai-gateway server is running:

```bash
cd ../server
python -m uvicorn main:app --reload
```

### 2. Connect Your Wallet

- Enter your Ethereum private key in the wallet connection field
- **⚠️ Security**: Only use testnet private keys! Never use mainnet keys with real funds
- The wallet address will be displayed once connected

### 3. Select a Model

Choose from available OpenAI models:
- **Fast & Affordable**: GPT-4o Mini, GPT-3.5 Turbo
- **Advanced**: GPT-4o, GPT-4 Turbo, GPT-4
- **Reasoning**: o1, o1-preview, o1-mini

### 4. Start Chatting

- Type your prompt in the text area
- View estimated cost before sending
- Adjust max tokens if needed
- Press "Send" or Enter to submit
- Payment will be handled automatically via x402 protocol

## Configuration

### Switching Between Testnet and Mainnet

**Testnet (Base Sepolia):**
```env
VITE_NETWORK=Base Sepolia (Testnet)
VITE_CHAIN_ID=84532
```

**Mainnet (Base):**
```env
VITE_NETWORK=Base Mainnet
VITE_CHAIN_ID=8453
```

Make sure your backend server is also configured for the same network!

### Changing API URL

If your backend is running on a different host/port:

```env
VITE_API_URL=http://your-server:8000
```

## Project Structure

```
x402-frontend/
├── src/
│   ├── components/
│   │   ├── ChatInterface.jsx      # Main chat UI with message history
│   │   ├── CostEstimator.jsx      # Real-time cost estimation display
│   │   ├── ModelSelector.jsx      # Model selection dropdown
│   │   └── WalletConnect.jsx      # Wallet connection component
│   ├── services/
│   │   ├── apiClient.js           # Gateway API communication
│   │   └── paymentService.js      # x402 payment creation & parsing
│   ├── utils/
│   │   ├── models.js              # Model pricing data
│   │   └── tokenCounter.js        # Token estimation utilities
│   ├── App.jsx                    # Main app component
│   ├── main.jsx                   # React entry point
│   └── index.css                  # Global styles with Tailwind
├── .env.example                   # Environment variable template
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## How It Works

### Payment Flow (Using x402-fetch SDK)

The frontend uses the official **x402-fetch** SDK which automatically handles the entire payment flow:

1. **Initial Request**: `wrapFetchWithPayment()` makes request to gateway
2. **402 Detection**: SDK automatically detects HTTP 402 response
3. **Payment Creation**: SDK creates and signs payment using viem wallet client
4. **Automatic Retry**: SDK automatically retries request with payment header
5. **API Call**: Gateway verifies payment and calls OpenAI
6. **Settlement**: Gateway settles payment and issues refund if needed
7. **Response**: Frontend receives AI response + payment settlement info

All payment logic is handled by the SDK - you just use it like regular fetch!

### Cost Estimation

- Uses approximate token counting (~4 characters per token)
- Calculates cost based on model pricing and max output tokens
- Actual cost may be lower if response is shorter than max tokens
- Refunds are automatic via x402 escrow system

## Security Considerations

- **Never commit `.env` file** - it's in `.gitignore` by default
- **Use testnet keys only** during development
- **Private keys are stored in memory** only - not persisted
- **Clear browser cache** after disconnecting wallet
- **Consider using MetaMask** integration for production (future enhancement)

## Troubleshooting

### API Connection Issues

- Check that the backend server is running: `curl http://localhost:8000/health`
- Verify `VITE_API_URL` in `.env` matches your backend URL
- Check browser console for CORS errors

### Payment Failures

- Ensure wallet has sufficient USDC balance
- Verify you're on the correct network (testnet vs mainnet)
- Check that backend and frontend are configured for same network
- Review browser console for detailed error messages

### Build Errors

- Delete `node_modules` and run `npm install` again
- Clear Vite cache: `rm -rf node_modules/.vite`
- Ensure Node.js version is 18 or higher

## Future Enhancements

- [ ] MetaMask/WalletConnect integration for better UX
- [ ] Transaction history and analytics
- [ ] Multi-model comparison
- [ ] Export conversation history
- [ ] Dark mode support
- [ ] Mobile responsive improvements
- [ ] Better token counting (integrate tiktoken WASM)

## Deployment Options

### Vercel
```bash
npm run build
vercel --prod
```

### Netlify
```bash
npm run build
netlify deploy --prod --dir=dist
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
RUN npm install -g serve
CMD ["serve", "-s", "dist", "-p", "3000"]
```

## License

MIT License - see the main project LICENSE file

## Contributing

Contributions are welcome! Please see the main project CONTRIBUTING.md for guidelines.

## Support

For issues and questions:
- Check the main x402-ai-gateway README
- Review server logs for backend issues
- Open an issue on GitHub
