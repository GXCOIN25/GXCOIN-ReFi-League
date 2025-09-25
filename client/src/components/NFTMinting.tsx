import React, { useState } from 'react';
import { Zap, Star, Award, Gem } from 'lucide-react';
import { useWallet } from '../lib/stores/useWallet';
import { useUser } from '../lib/stores/useUser';
import { useHeroes } from '../lib/stores/useHeroes';

interface NFTMintingProps {
  heroId: string;
  level: number;
  onClose: () => void;
}

export const NFTMinting: React.FC<NFTMintingProps> = ({ heroId, level, onClose }) => {
  const { isConnected, address, sendTransaction } = useWallet();
  const { currentUser } = useUser();
  const { unlockNFTBadge } = useHeroes();
  const [isMinting, setIsMinting] = useState(false);
  const [mintingStage, setMintingStage] = useState<'prepare' | 'minting' | 'success' | 'error'>('prepare');
  const [transactionHash, setTransactionHash] = useState<string>('');
  const [error, setError] = useState<string>('');

  const heroNames = {
    'aqua': 'AQUA Ocean Guardian',
    'hemp': 'HEMP Earth Protector',
    'voltra': 'VOLTRA Energy Champion',
    'graphene': 'GRAPHENE Tech Innovator',
    'trader': 'TRADER Market Strategist'
  };

  const rarityLevels = [
    { name: 'Bronze', color: 'from-amber-600 to-amber-700', icon: Award },
    { name: 'Silver', color: 'from-gray-400 to-gray-500', icon: Star },
    { name: 'Gold', color: 'from-yellow-400 to-yellow-500', icon: Zap },
    { name: 'Platinum', color: 'from-blue-400 to-blue-500', icon: Gem },
    { name: 'Diamond', color: 'from-purple-400 to-purple-500', icon: Gem }
  ];

  const currentRarity = rarityLevels[Math.min(level - 1, rarityLevels.length - 1)];
  const IconComponent = currentRarity.icon;
  const mintingCost = (level * 0.001).toFixed(3); // ETH cost based on level

  const handleMint = async () => {
    if (!isConnected || !address || !currentUser) {
      setError('Please connect your wallet and log in');
      return;
    }

    // Enforce testnet-only operation
    try {
      const { provider } = useWallet.getState();
      if (provider) {
        const network = await provider.getNetwork();
        const chainId = Number(network.chainId);
        
        // Only allow testnets (Sepolia: 11155111, Goerli: 5, Mumbai: 80001, BSC Testnet: 97)
        const allowedTestnets = [11155111, 5, 80001, 97];
        if (!allowedTestnets.includes(chainId)) {
          setError(
            `MAINNET BLOCKED: You are on network ${chainId}. ` +
            'Please switch to a testnet (Sepolia: 11155111, Goerli: 5) to use demo features.'
          );
          return;
        }
      }
    } catch (error) {
      setError('Unable to verify network. Please ensure you are connected to a testnet.');
      return;
    }

    // Final confirmation for demo transaction
    const confirmDemo = window.confirm(
      'DEMO: This will send testnet ETH to create a demo badge. Continue?'
    );
    
    if (!confirmDemo) {
      return;
    }

    setIsMinting(true);
    setMintingStage('minting');
    setError('');

    try {
      // DEMO: Sends ETH to demo address and creates local badge
      // Production would call actual NFT smart contract
      const demoTreasuryAddress = '0x742d35cc6634c0532925a3b8d951d6bdbbbbbb'; // Demo treasury
      
      setMintingStage('minting');
      const txHash = await sendTransaction(demoTreasuryAddress, mintingCost);
      setTransactionHash(txHash);

      // Create NFT badge in our system (demo implementation)
      await unlockNFTBadge(heroId, level);

      setMintingStage('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Minting failed');
      setMintingStage('error');
    } finally {
      setIsMinting(false);
    }
  };

  const handleClose = () => {
    if (!isMinting) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-purple-500/30 p-6 max-w-md w-full">
        {mintingStage === 'prepare' && (
          <>
            <div className="text-center mb-6">
              <div className={`w-20 h-20 rounded-full bg-gradient-to-r ${currentRarity.color} flex items-center justify-center mx-auto mb-4`}>
                <IconComponent className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Mint NFT Badge</h2>
              <p className="text-gray-300">{heroNames[heroId as keyof typeof heroNames]}</p>
              <p className="text-lg font-semibold text-purple-400">{currentRarity.name} Level {level}</p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-3 mb-4">
                <p className="text-yellow-300 text-sm font-medium">
                  ⚠️ DEMO MODE: This mints demo badges only. Use testnets only (Sepolia, Goerli).
                </p>
              </div>
              
              <div className="bg-black/50 rounded-lg p-4 border border-gray-700">
                <h3 className="text-white font-semibold mb-2">NFT Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Hero:</span>
                    <span className="text-white">{heroNames[heroId as keyof typeof heroNames]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Rarity:</span>
                    <span className="text-purple-400">{currentRarity.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Level:</span>
                    <span className="text-white">{level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Minting Cost:</span>
                    <span className="text-green-400">{mintingCost} ETH</span>
                  </div>
                </div>
              </div>

              {!isConnected && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-3 rounded-lg text-sm">
                  Please connect your wallet to mint this NFT
                </div>
              )}
              
              <div className="bg-blue-500/10 border border-blue-500/50 text-blue-300 p-3 rounded-lg text-sm">
                <strong>Testnet Only:</strong> This demo only works on testnets (Sepolia, Goerli). Mainnet is blocked.
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleClose}
                className="flex-1 py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleMint}
                disabled={!isConnected || isMinting}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 font-bold"
              >
                Mint NFT
              </button>
            </div>
          </>
        )}

        {mintingStage === 'minting' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Minting NFT...</h2>
            <p className="text-gray-300 mb-4">Please confirm the transaction in your wallet</p>
            <div className="bg-black/50 rounded-lg p-4 border border-gray-700">
              <p className="text-sm text-gray-400">Transaction Status:</p>
              <p className="text-white">Processing on blockchain...</p>
            </div>
          </div>
        )}

        {mintingStage === 'success' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">NFT Minted Successfully!</h2>
            <p className="text-gray-300 mb-4">Your {currentRarity.name} {heroNames[heroId as keyof typeof heroNames]} NFT has been minted</p>
            
            {transactionHash && (
              <div className="bg-black/50 rounded-lg p-4 border border-gray-700 mb-4">
                <p className="text-sm text-gray-400 mb-1">Transaction Hash:</p>
                <p className="text-xs text-green-400 font-mono break-all">{transactionHash}</p>
              </div>
            )}
            
            <button
              onClick={handleClose}
              className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-bold"
            >
              View in Collection
            </button>
          </div>
        )}

        {mintingStage === 'error' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">✕</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Minting Failed</h2>
            <p className="text-gray-300 mb-4">{error}</p>
            
            <div className="flex space-x-3">
              <button
                onClick={handleClose}
                className="flex-1 py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => setMintingStage('prepare')}
                className="flex-1 py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};