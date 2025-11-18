import { wrapFetchWithPayment } from 'x402-fetch';
import { createViemWalletClient, parsePaymentResponse } from './paymentService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Send a prompt to the AI gateway with automatic payment handling
 * @param {string} model - OpenAI model ID
 * @param {string} prompt - User prompt text
 * @param {number} maxTokens - Maximum output tokens
 * @param {import('ethers').Wallet} wallet - Ethers.js wallet instance
 * @returns {Promise<Object>} Response with data and payment status
 */
export async function sendPrompt(model, prompt, maxTokens, wallet) {
  try {
    console.log('=== sendPrompt DEBUG START ===');
    console.log('Request parameters:', { model, promptLength: prompt.length, maxTokens });

    if (!wallet) {
      throw new Error('Wallet not connected. Please connect your wallet first.');
    }

    const requestBody = {
      model,
      input: prompt,
      max_output_tokens: maxTokens,
    };

    console.log('Wallet details:', {
      address: wallet.address,
      hasPrivateKey: !!wallet.privateKey,
    });

    // Create viem wallet client from ethers wallet
    console.log('Creating viem wallet client...');
    const viemClient = createViemWalletClient(wallet);
    console.log('Viem client created:', {
      account: viemClient.account.address,
      chain: viemClient.chain.name,
    });

    // Wrap fetch with x402 payment handling
    console.log('Wrapping fetch with x402 payment handling...');
    const fetchWithPayment = wrapFetchWithPayment(fetch, viemClient, {
      maxValue: 1.0, // Maximum 1 USDC per request (adjust as needed)
    });
    console.log('Fetch wrapped successfully');

    // Make request - x402-fetch automatically handles 402 responses
    const url = `${API_BASE_URL}/v1/responses`;
    console.log('Making request to:', url);
    console.log('Request body:', requestBody);

    const response = await fetchWithPayment(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Response received:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries([...response.headers.entries()]),
    });

    if (!response.ok) {
      console.error('Response NOT OK - Status:', response.status);

      // Try to get error details
      let errorData = {};
      try {
        const text = await response.text();
        console.error('Error response body (raw):', text);
        errorData = JSON.parse(text);
        console.error('Error response body (parsed):', errorData);
      } catch (parseError) {
        console.error('Could not parse error response:', parseError);
      }

      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    // Parse payment response from header if present
    const paymentResponseHeader = response.headers.get('X-PAYMENT-RESPONSE');
    console.log('Payment response header (base64):', paymentResponseHeader);

    let paymentStatus = null;
    if (paymentResponseHeader) {
      paymentStatus = parsePaymentResponse(paymentResponseHeader);
      console.log('Parsed payment status:', paymentStatus);

      if (paymentStatus) {
        console.log('Transaction hash:', paymentStatus.transaction);
        console.log('Refund amount:', paymentStatus.refund_amount);
      }
    }

    const data = await response.json();
    console.log('Response data received:', {
      hasChoices: !!data.choices,
      hasText: !!data.text,
      hasUsage: !!data.usage,
    });

    console.log('=== sendPrompt DEBUG END (SUCCESS) ===');

    return {
      success: true,
      data,
      paymentStatus,
    };
  } catch (error) {
    console.error('=== sendPrompt DEBUG END (ERROR) ===');
    console.error('API Error caught:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Check if the API server is healthy
 * @returns {Promise<boolean>} True if server is healthy
 */
export async function healthCheck() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
}
