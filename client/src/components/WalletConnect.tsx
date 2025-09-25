import React from 'react';
import { useWallet } from '../lib/stores/useWallet';

export const WalletConnect: React.FC = () => {
  const {
    isConnected,
    address,
    balance,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    setError
  } = useWallet();

  const handleConnect = async () => {
    setError(null);
    await connectWallet();
  };

  if (isConnected && address) {
    return (
      <div className="bg-black/80 backdrop-blur-sm rounded-xl border border-purple-500/30 p-4 max-w-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-bold">Wallet Connected</h3>
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="text-sm">
            <span className="text-gray-400">Address:</span>
            <p className="text-white font-mono text-xs">
              {address.slice(0, 6)}...{address.slice(-4)}
            </p>
          </div>
          
          {balance && (
            <div className="text-sm">
              <span className="text-gray-400">Balance:</span>
              <p className="text-white font-bold">{balance} ETH</p>
            </div>
          )}
        </div>
        
        <button
          onClick={disconnectWallet}
          className="w-full py-2 px-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300 rounded-lg transition-all duration-200"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="bg-black/80 backdrop-blur-sm rounded-xl border border-purple-500/30 p-4 max-w-sm">
      <div className="text-center mb-4">
        <h3 className="text-white font-bold mb-2">Connect Wallet</h3>
        <p className="text-gray-400 text-sm">Connect your crypto wallet to make real contributions</p>
      </div>
      
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}
      
      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 font-bold"
      >
        {isConnecting ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Connecting...</span>
          </div>
        ) : (
          'Connect Wallet'
        )}
      </button>
      
      <p className="text-xs text-gray-500 mt-2 text-center">
        Supports MetaMask and other Web3 wallets
      </p>
    </div>
  );
};