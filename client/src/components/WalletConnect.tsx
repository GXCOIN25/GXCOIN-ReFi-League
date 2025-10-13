import React, { useState, useEffect } from 'react';
import { useWallet, type WalletType } from '../lib/stores/useWallet';
import { Wallet, Copy, ExternalLink, RefreshCw, AlertTriangle, CheckCircle, Globe, HelpCircle } from 'lucide-react';

interface WalletConnectProps {
  onOpenOnboarding?: () => void;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({ onOpenOnboarding }) => {
  const {
    isConnected,
    address,
    balance,
    isConnecting,
    error,
    chainId,
    availableWallets,
    connectWallet,
    disconnectWallet,
    switchToTestnet,
    getBalance,
    isTestnet,
    setError
  } = useWallet();
  
  console.log('WalletConnect render:', { isConnected, address, balance, isConnecting, error, chainId, availableWallets });
  
  const [copySuccess, setCopySuccess] = useState(false);
  const [showNetworkHelper, setShowNetworkHelper] = useState(false);

  const handleConnect = async (walletType?: WalletType) => {
    setError(null);
    try {
      await connectWallet(walletType);
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
    if (address && chainId) {
      const baseUrl = isTestnet() ? 'sepolia.etherscan.io' : 'etherscan.io';
      window.open(`https://${baseUrl}/address/${address}`, '_blank');
    }
  };
  
  const refreshBalance = async () => {
    await getBalance();
  };
  
  const getNetworkName = () => {
    const networks: Record<number, string> = {
      11155111: 'Sepolia Testnet',
      5: 'Goerli Testnet',
      80001: 'Mumbai Testnet',
      97: 'BSC Testnet',
      1: 'Ethereum Mainnet',
      137: 'Polygon Mainnet',
      56: 'BSC Mainnet'
    };
    return chainId ? networks[chainId] || `Chain ${chainId}` : 'Unknown Network';
  };
  
  const handleSwitchNetwork = async () => {
    try {
      await switchToTestnet();
    } catch (error) {
      console.error('Failed to switch network:', error);
    }
  };

  if (isConnected && address) {
    return (
      <div className="bg-black/80 backdrop-blur-sm rounded-xl border border-purple-500/30 p-4 max-w-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-bold">Wallet Connected</h3>
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
        </div>
        
        {/* Network Status */}
        <div className={`mb-3 p-3 rounded-lg border ${
          isTestnet() ? 'bg-green-500/10 border-green-500/30' : 'bg-yellow-500/10 border-yellow-500/30'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              {isTestnet() ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
              )}
              <span className={`text-sm font-medium ${isTestnet() ? 'text-green-300' : 'text-yellow-300'}`}>
                Network
              </span>
            </div>
            <button
              onClick={() => setShowNetworkHelper(!showNetworkHelper)}
              className="text-gray-400 hover:text-white p-1"
            >
              <Globe className="w-4 h-4" />
            </button>
          </div>
          <p className={`text-xs ${isTestnet() ? 'text-green-300' : 'text-yellow-300'}`}>
            {getNetworkName()}
          </p>
          {!isTestnet() && (
            <button
              onClick={handleSwitchNetwork}
              className="mt-2 w-full py-1 px-3 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/50 text-yellow-300 rounded text-xs transition-colors"
            >
              Switch to Sepolia Testnet
            </button>
          )}
        </div>
        
        {/* Network Helper */}
        {showNetworkHelper && (
          <div className="mb-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <h4 className="text-blue-300 font-medium text-sm mb-2">Network Information</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Status:</span>
                <span className={`${isTestnet() ? 'text-green-400' : 'text-red-400'}`}>
                  {isTestnet() ? '✓ Testnet (Safe for Demo)' : '⚠️ Mainnet (Real Money)'}
                </span>
              </div>
              <div className="border-t border-blue-500/20 pt-2">
                <p className="text-blue-200 text-xs">
                  {isTestnet() 
                    ? 'Perfect! You\'re on a testnet. NFT minting and transactions are safe to try.'
                    : 'Warning: You\'re on mainnet. Please switch to a testnet for demo purposes.'
                  }
                </p>
              </div>
            </div>
          </div>
        )}
        
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
                  title={`View on ${isTestnet() ? 'Sepolia ' : ''}Etherscan`}
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
              <p className="text-white font-bold text-lg">
                {balance} {isTestnet() ? 'Test ETH' : 'ETH'}
              </p>
              {isTestnet() && parseFloat(balance) < 0.01 && (
                <p className="text-yellow-400 text-xs mt-1">
                  Need test ETH? Visit{' '}
                  <a 
                    href="https://sepoliafaucet.com" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="underline hover:text-yellow-300"
                  >
                    Sepolia Faucet
                  </a>
                </p>
              )}
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

  // Show wallet selection if multiple wallets detected
  if (error === 'multiple_wallets_available' && availableWallets.length > 1) {
    return (
      <div className="bg-black/80 backdrop-blur-sm rounded-xl border border-purple-500/30 p-4 max-w-sm">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-white font-bold mb-2">Choose Your Wallet</h3>
          <p className="text-gray-400 text-sm">Multiple wallets detected. Select one to connect:</p>
        </div>

        <div className="space-y-3">
          {availableWallets.map((wallet) => (
            <button
              key={wallet.type}
              onClick={() => handleConnect(wallet.type)}
              disabled={isConnecting}
              className="w-full py-4 px-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20 hover:from-purple-600/40 hover:to-blue-600/40 border border-purple-500/30 hover:border-purple-500/60 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 flex items-center justify-between group"
            >
              <div className="flex items-center space-x-3">
                {wallet.type === 'metamask' && (
                  <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🦊</span>
                  </div>
                )}
                {wallet.type === 'coinbase' && (
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🔵</span>
                  </div>
                )}
                <span className="font-bold">{wallet.name}</span>
              </div>
              <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>

        <button
          onClick={() => setError(null)}
          className="w-full mt-4 py-2 px-4 bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded-lg transition-all duration-200 text-sm"
        >
          Cancel
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
      
      {/* Safety Notice */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4">
        <div className="flex items-start space-x-2">
          <CheckCircle className="w-4 h-4 text-blue-400 mt-0.5" />
          <div>
            <p className="text-blue-300 text-sm font-medium mb-1">Demo Mode Ready</p>
            <p className="text-blue-200 text-xs">
              Will automatically connect to Sepolia testnet for safe NFT minting and transactions.
            </p>
          </div>
        </div>
      </div>
      
      {error && error !== 'multiple_wallets_available' && (
        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg mb-4">
          <div className="p-3">
            <div className="flex items-start space-x-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-yellow-300 text-sm font-medium mb-1">Wallet Not Detected</p>
                <p className="text-yellow-200 text-xs">
                  {error.includes('install') 
                    ? 'Wallet extensions like MetaMask don\'t work in embedded previews. Please open this app in a new browser tab.'
                    : error
                  }
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                // Add a URL parameter to skip welcome screen and go straight to wallet
                const url = new URL(window.location.href);
                url.searchParams.set('skipWelcome', 'true');
                url.searchParams.set('tab', 'wallet');
                const finalUrl = url.toString();
                console.log('🔗 Opening new tab with URL:', finalUrl);
                console.log('📍 Current location:', window.location.href);
                window.open(finalUrl, '_blank');
              }}
              className="w-full py-2 px-4 bg-yellow-500/30 hover:bg-yellow-500/40 border border-yellow-500/50 text-yellow-100 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open in New Tab</span>
            </button>
            <p className="text-yellow-200/70 text-xs mt-2 text-center">
              Your wallet extension will work there
            </p>
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        <button
          onClick={() => handleConnect()}
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
        
        <div className="text-center pt-2 border-t border-gray-700">
          <p className="text-xs text-gray-500">
            🔒 Testnet-only for safety • Real impact tracking • Patent-backed heroes
          </p>
        </div>

        {onOpenOnboarding && (
          <div className="text-center pt-3 border-t border-gray-700">
            <button
              onClick={onOpenOnboarding}
              className="inline-flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors group"
              title="Click here to learn how to set up MetaMask"
            >
              <HelpCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>New to crypto? Learn how to get started</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};