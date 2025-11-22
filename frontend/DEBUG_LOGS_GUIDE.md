# Frontend Debug Logs Guide

## Overview
Comprehensive logging has been added to the frontend to debug the 402 status code issue with the x402 package.

## Files Modified
1. [src/services/apiClient.js](src/services/apiClient.js) - Added detailed logging throughout the request flow
2. [src/components/ChatInterface.jsx](src/components/ChatInterface.jsx) - Added logging at the UI layer

## What to Look For

### 1. Request Initialization
Look for logs starting with `=== ChatInterface: Sending prompt ===`:
- Verify the correct model is selected
- Check max tokens configuration
- Confirm wallet is connected with valid address

### 2. Wallet Setup
Check the wallet creation logs:
```
Wallet details: { address, hasPrivateKey }
Viem client created: { account, chain }
```
**Key checks:**
- Private key is present (should be true)
- Viem account address matches the wallet address
- Chain is correct (Base Sepolia or Base Mainnet)

### 3. x402 Wrapper Setup
Look for:
```
Wrapping fetch with x402 payment handling...
Fetch wrapped successfully
```
**Key checks:**
- Wrapper is created without errors
- maxValue is set to 1.0 USDC

### 4. **CRITICAL: Response Status**
This is where the 402 issue should be visible:
```javascript
Response received: {
  status: 402,  // ← This is the problem!
  statusText: "Payment Required",
  ok: false,
  headers: { ... }
}
```

**What should happen:**
- x402-fetch should **automatically** intercept 402 responses
- It should extract payment details from headers
- Make the payment transaction
- Retry the request with payment proof
- Return the final successful response (status 200)

**If you see status: 402 in the logs:**
This means x402-fetch is NOT handling the payment flow automatically. Possible causes:
1. x402-fetch package not installed correctly
2. Payment headers missing/malformed from backend
3. Wallet client configuration issue
4. Network/RPC issue preventing transaction

### 5. Payment Headers to Check
When status is 402, look at the headers in the response:
```javascript
headers: {
  'x-payment-address': '...',    // Payment recipient address
  'x-payment-amount': '...',     // Amount in USDC
  'x-payment-chain-id': '...',   // Chain ID
  'x-payment-token': '...',      // Token contract address
  // ... other payment headers
}
```

### 6. Successful Response
If everything works, you should see:
```javascript
Response received: {
  status: 200,
  ok: true,
  headers: {
    'x-payment-response': '...',  // Base64 encoded payment proof
    ...
  }
}
```

### 7. Error Details
If request fails, check:
```
Error response body (raw): ...
Error response body (parsed): ...
```

## How to Use

1. **Open browser console** (F12 or Cmd+Option+I)
2. **Clear console** for clean logs
3. **Send a test prompt** in the chat
4. **Look for the debug sections** marked with `===`
5. **Focus on the "Response received" log** - this shows if 402 is being handled

## Key Questions to Answer

1. **Is the response actually 402?**
   - Look at `Response received: { status: ... }`

2. **Are payment headers present?**
   - Check the headers object in the response log

3. **Is x402-fetch being called?**
   - If you see "Response received" with status 402, it means x402-fetch returned that response instead of handling it

4. **What error message appears?**
   - Check both console logs and the UI error message

## Next Steps Based on Findings

### If you see status: 402 in logs
- x402-fetch is NOT intercepting the payment flow
- Check if x402-fetch is properly installed: `npm list x402-fetch`
- Verify the backend is sending correct payment headers
- Check browser console for any x402-fetch internal errors

### If you see network errors
- Backend might not be running
- CORS issues
- Wrong API URL in .env

### If you see wallet errors
- Private key might be invalid
- Wrong chain configuration
- RPC endpoint issues

## Testing Checklist

- [ ] Console shows "sendPrompt DEBUG START"
- [ ] Wallet details are logged correctly
- [ ] Viem client created successfully
- [ ] Request is sent to correct URL
- [ ] Response status is logged
- [ ] Response headers are visible
- [ ] Payment headers are present (if 402)
- [ ] Error details are captured (if failed)
