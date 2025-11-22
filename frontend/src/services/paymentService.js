import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia, base } from 'viem/chains';

// Get dev mode from environment (defaults to true for safety)
export const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'false' ? false : true;

// Auto-determine chain ID based on dev mode, but allow override
export const CHAIN_ID = import.meta.env.VITE_CHAIN_ID
  ? parseInt(import.meta.env.VITE_CHAIN_ID)
  : (DEV_MODE ? 84532 : 8453);

// Auto-determine network name
export const NETWORK_NAME = import.meta.env.VITE_NETWORK
  || (DEV_MODE ? 'Base Sepolia (Testnet)' : 'Base Mainnet');

// Get the appropriate basescan URL based on chain ID
export const BASESCAN_URL = CHAIN_ID === 8453
  ? 'https://basescan.org'
  : 'https://sepolia.basescan.org';

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
