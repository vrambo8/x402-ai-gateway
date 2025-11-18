import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia, base } from 'viem/chains';

const CHAIN_ID = parseInt(import.meta.env.VITE_CHAIN_ID || '84532');

/**
 * Create a viem wallet client from ethers.js wallet
 * @param {import('ethers').Wallet} ethersWallet - Ethers.js wallet instance
 * @returns {Object} Viem wallet client
 */
export function createViemWalletClient(ethersWallet) {
  // Get the chain based on configured chain ID
  const chain = CHAIN_ID === 8453 ? base : baseSepolia;

  // Convert private key to viem account
  const account = privateKeyToAccount(ethersWallet.privateKey);

  // Create wallet client
  const walletClient = createWalletClient({
    account,
    chain,
    transport: http(),
  });

  return walletClient;
}

/**
 * Parse payment response from base64 header
 * @param {string} base64Response - Base64 encoded payment response
 * @returns {Object|null} Parsed payment response
 */
export function parsePaymentResponse(base64Response) {
  try {
    const decoded = atob(base64Response);
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Error parsing payment response:', error);
    return null;
  }
}

/**
 * Format payment status for display
 * @param {Object} paymentResponse - Payment response object
 * @returns {Object|null} Formatted payment status
 */
export function formatPaymentStatus(paymentResponse) {
  if (!paymentResponse) return null;

  return {
    settled: paymentResponse.settled || false,
    amountCharged: paymentResponse.amount_charged,
    refundAmount: paymentResponse.refund_amount,
    transactionHash: paymentResponse.transaction_hash,
  };
}
