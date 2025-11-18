import { useState } from 'react';
import { ethers } from 'ethers';

export default function WalletConnect({ onWalletConnected }) {
  const [privateKey, setPrivateKey] = useState('');
  const [wallet, setWallet] = useState(null);
  const [error, setError] = useState('');

  const handleConnect = () => {
    setError('');

    try {
      // Validate and create wallet from private key
      let formattedKey = privateKey.trim();

      // Add 0x prefix if not present
      if (!formattedKey.startsWith('0x')) {
        formattedKey = '0x' + formattedKey;
      }

      const newWallet = new ethers.Wallet(formattedKey);
      setWallet(newWallet);
      onWalletConnected(newWallet);
      setPrivateKey(''); // Clear input for security
    } catch (err) {
      setError('Invalid private key. Please check and try again.');
      console.error('Wallet connection error:', err);
    }
  };

  const handleDisconnect = () => {
    setWallet(null);
    onWalletConnected(null);
  };

  if (wallet) {
    return (
      <div className="backdrop-blur-xl bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 border border-emerald-400/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-400">Wallet Connected</p>
              <p className="text-xs text-emerald-300/80 font-mono mt-1">
                {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
              </p>
            </div>
          </div>
          <button
            onClick={handleDisconnect}
            className="px-4 py-2 text-sm bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500/30 transition-all backdrop-blur-sm"
          >
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
          <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-slate-200">Connect Wallet</h3>
      </div>
      <p className="text-xs text-slate-400 mb-4">
        Enter your private key to connect (testnet recommended)
      </p>

      <div className="flex gap-2">
        <input
          type="password"
          placeholder="0x... or without prefix"
          value={privateKey}
          onChange={(e) => setPrivateKey(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleConnect()}
          className="flex-1 px-4 py-2.5 backdrop-blur-md bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
        />
        <button
          onClick={handleConnect}
          disabled={!privateKey.trim()}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm hover:from-blue-500 hover:to-blue-400 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed transition-all font-medium shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 disabled:shadow-none"
        >
          Connect
        </button>
      </div>

      {error && (
        <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2">
          <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2">
        <svg className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-xs text-amber-400">
          Never share your private key. Use testnet keys only.
        </p>
      </div>
    </div>
  );
}
