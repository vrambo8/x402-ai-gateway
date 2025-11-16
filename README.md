# x402 AI Gateway

**Pay for AI API access with cryptocurrency**

A minimal OpenAI proxy that accepts x402 cryptocurrency payments. No OpenAI subscription required—just pay with your crypto wallet using USDC on Base network.

> 🚀 **Want a hosted solution?** Check out our managed platform with production-ready infrastructure, rate limiting, analytics, and 99.9% uptime SLA.

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
- ✅ Docker deployment
- ✅ Dev mode for testing

## Quick Start

### Prerequisites

- Docker and Docker Compose
- OpenAI API key
- Base network wallet address (to receive payments)

### 1. Clone and Configure

```bash
git clone https://github.com/yourusername/x402-ai-gateway.git
cd x402-ai-gateway

# Copy environment files
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Edit `server/.env`:
```env
OPENAI_API_KEY=sk-your-key-here
X402_WALLET_ADDRESS=0xYourWalletAddress
X402_CHAIN_ID=84532  # Testnet, use 8453 for mainnet
DEV_MODE=true  # Uses mock responses for testing
```

### 2. Start the Gateway

```bash
docker-compose up -d

# Check logs
docker-compose logs -f api
```

The gateway is now running at `http://localhost:8000`

### 3. Test It

```bash
# Health check
curl http://localhost:8000/health

# Try an OpenAI request (will return 402 Payment Required)
curl -X POST http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

### 4. Make a Payment

See the [client example](client/) for how to make x402 payments.

## Architecture

```
Client Request
      ↓
x402 Payment Verification
      ↓
OpenAI API Forwarding
      ↓
Response
```

## Development

```bash
# Install dependencies
cd server
pip install -r ../requirements.txt

# Run locally
python main.py
```

## Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key | Required |
| `X402_FACILITATOR_URL` | x402 facilitator endpoint | https://x402.org/facilitator |
| `X402_WALLET_ADDRESS` | Your wallet to receive payments | Required |
| `X402_CHAIN_ID` | Base network: 84532 (testnet) or 8453 (mainnet) | 84532 |
| `DEV_MODE` | Use mock OpenAI responses | true |
| `API_PORT` | Server port | 8000 |
| `LOG_LEVEL` | Logging level | INFO |

## Project Structure

```
server/
├── app/
│   ├── config.py              # Configuration
│   ├── cost/                  # Cost calculation
│   ├── logging/               # Logging setup
│   ├── middlewares/           # Payment & logging middleware
│   ├── payment/               # x402 integration
│   └── routes/                # API endpoints
└── main.py                    # Application entry

client/                        # Example client
```

## Roadmap

- [x] Basic x402 payment integration
- [x] OpenAI proxy forwarding
- [x] Token-based cost calculation
- [x] Docker deployment
- [ ] Support more AI providers (Anthropic, Google, Mistral)
- [ ] Multi-currency support (ETH, SOL)
- [ ] Client SDKs (JavaScript, Python, Go)

## Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md)

Areas for contribution:
- Support for additional AI providers
- Client SDK development
- Documentation improvements
- Testing and bug fixes

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

---

Built with ❤️ for the Web3 + AI community
