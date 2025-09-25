import React, { useState } from 'react';
import { useWallet } from '../lib/stores/useWallet';
import { Wallet, Copy, ExternalLink, RefreshCw } from 'lucide-react';

export const WalletConnect: React.FC = () => {
  const {
    isConnected,
    address,
    balance,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    getBalance,
    setError
  } = useWallet();
  
  console.log('WalletConnect render:', { isConnected, address, balance, isConnecting, error });
  
  const [copySuccess, setCopySuccess] = useState(false);

  const handleConnect = async () => {
    setError(null);
    try {
      await connectWallet();
    } catch (err) {
      console.error('Wallet connection error:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    }
  };
  
  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };
  
  const openEtherscan = () => {
    if (address) {
      window.open(`https://etherscan.io/address/${address}`, '_blank');
    }
  };
  
  const refreshBalance = async () => {
    await getBalance();
  };

  if (isConnected && address) {
    return (
      <div className="bg-black/80 backdrop-blur-sm rounded-xl border border-purple-500/30 p-4 max-w-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-bold">Wallet Connected</h3>
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
        </div>
        
        <div className="space-y-3 mb-4">
          <div className="bg-gray-900/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Address:</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={copyAddress}
                  className="p-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                  title="Copy address"
                >
                  <Copy className="w-3 h-3 text-gray-300" />
                </button>
                <button
                  onClick={openEtherscan}
                  className="p-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                  title="View on Etherscan"
                >
                  <ExternalLink className="w-3 h-3 text-gray-300" />
                </button>
              </div>
            </div>
            <p className="text-white font-mono text-xs break-all">
              {address}
            </p>
            {copySuccess && (
              <p className="text-green-400 text-xs mt-1">Address copied!</p>
            )}
          </div>
          
          {balance && (
            <div className="bg-gray-900/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-400 text-sm">Balance:</span>
                <button
                  onClick={refreshBalance}
                  className="p-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                  title="Refresh balance"
                >
                  <RefreshCw className="w-3 h-3 text-gray-300" />
                </button>
              </div>
              <p className="text-white font-bold text-lg">{balance} ETH</p>
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
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Wallet className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-white font-bold mb-2">Connect Your Wallet</h3>
        <p className="text-gray-400 text-sm">Connect your crypto wallet to make real contributions and mint NFTs</p>
      </div>
      
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}
      
      <div className="space-y-3">
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
            <div className="flex items-center justify-center space-x-2">
              <Wallet className="w-4 h-4" />
              <span>Connect Wallet</span>
            </div>
          )}
        </button>
        
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-2">
            Supported Wallets:
          </p>
          <div className="flex justify-center space-x-2 text-xs text-gray-400">
            <span className="bg-gray-800 px-2 py-1 rounded">MetaMask</span>
            <span className="bg-gray-800 px-2 py-1 rounded">WalletConnect</span>
            <span className="bg-gray-800 px-2 py-1 rounded">Coinbase</span>
          </div>
        </div>
      </div>
    </div>
  );
};