import { useState, useEffect } from 'react';
import WalletConnect from './components/WalletConnect';
import ModelSelector from './components/ModelSelector';
import ChatInterface from './components/ChatInterface';
import { healthCheck } from './services/apiClient';

function App() {
  const [wallet, setWallet] = useState(null);
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
  const [apiHealthy, setApiHealthy] = useState(null);

  useEffect(() => {
    // Check API health on mount
    const checkHealth = async () => {
      const healthy = await healthCheck();
      setApiHealthy(healthy);
    };

    checkHealth();
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Animated background gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <header className="relative backdrop-blur-xl bg-white/5 border-b border-white/10 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                x402 AI Gateway
              </h1>
              <p className="text-sm text-slate-400 mt-1">Pay-per-use AI with cryptocurrency</p>
            </div>
            <div className="flex items-center gap-3">
              {apiHealthy !== null && (
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md ${
                  apiHealthy
                    ? 'bg-emerald-500/10 border border-emerald-500/30'
                    : 'bg-red-500/10 border border-red-500/30'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${apiHealthy ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></div>
                  <span className={`text-sm font-medium ${apiHealthy ? 'text-emerald-400' : 'text-red-400'}`}>
                    {apiHealthy ? 'Online' : 'Offline'}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <WalletConnect onWalletConnected={setWallet} />
            <ModelSelector selectedModel={selectedModel} onModelChange={setSelectedModel} />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto h-full">
          {!wallet ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-12 max-w-md">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
                  <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-white mb-3">Connect Your Wallet</h2>
                <p className="text-slate-400">Enter your wallet credentials above to start using the AI gateway</p>
              </div>
            </div>
          ) : (
            <ChatInterface selectedModel={selectedModel} wallet={wallet} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative backdrop-blur-xl bg-white/5 border-t border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto text-center text-xs text-slate-500">
          <p className="flex items-center justify-center gap-2 flex-wrap">
            <span className="text-slate-400">Powered by x402 Protocol</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">Network: {import.meta.env.VITE_NETWORK || 'Base Sepolia (Testnet)'}</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">Built with React + Tailwind</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
