# Implementation Notes

## Payment Service Integration

The frontend has been updated to use the **official x402-fetch SDK** for payment handling, replacing the custom implementation.

### Changes Made

#### 1. Dependencies Added

- **x402-fetch** (v0.6.1+) - Official Coinbase x402 SDK for automatic 402 payment handling
- **viem** - Modern Ethereum library for wallet operations and signing

#### 2. Updated Files

**`src/services/paymentService.js`**
- Removed custom payment creation logic
- Added `createViemWalletClient()` - Converts ethers.js wallet to viem wallet client
- Kept helper functions: `parsePaymentResponse()` and `formatPaymentStatus()`
- Uses viem's `createWalletClient()` and `privateKeyToAccount()` for wallet operations

**`src/services/apiClient.js`**
- Now uses `wrapFetchWithPayment()` from x402-fetch SDK
- Automatic 402 detection and payment handling
- Simplified code - SDK handles all retry logic
- Added `maxValue` option (1.0 USDC per request limit)

### How It Works

```javascript
// Create viem wallet client from ethers wallet
const viemClient = createViemWalletClient(wallet);

// Wrap fetch with x402 payment handling
const fetchWithPayment = wrapFetchWithPayment(fetch, viemClient, {
  maxValue: 1.0, // Max 1 USDC per request
});

// Use it like regular fetch - SDK handles 402 automatically
const response = await fetchWithPayment(url, options);
```

### Benefits

1. **Official SDK** - Using Coinbase's official implementation
2. **Automatic** - No manual 402 detection or retry logic needed
3. **Robust** - Well-tested payment flow handling
4. **Maintainable** - SDK updates handled by Coinbase team
5. **Simpler Code** - Reduced custom code by ~60%

### Configuration

The SDK respects the chain ID from environment variables:
- **Base Sepolia** (testnet): Chain ID 84532
- **Base Mainnet**: Chain ID 8453

Set in `.env`:
```env
VITE_CHAIN_ID=84532  # Testnet
# or
VITE_CHAIN_ID=8453   # Mainnet
```

### Security Notes

- Private keys are converted to viem accounts in-memory only
- No additional storage or persistence added
- SDK handles payment signing securely using viem
- Max payment limit prevents excessive charges

### Testing

Build verification:
```bash
npm run build
# ✓ Built successfully with x402-fetch and viem
```

The frontend maintains the same UI/UX - only the underlying payment mechanism changed from custom to SDK-based.

### Future Enhancements

With x402-fetch, we can easily:
- Add payment history tracking (SDK provides hooks)
- Implement custom payment selectors
- Add payment confirmation UI
- Track payment failures and retries
