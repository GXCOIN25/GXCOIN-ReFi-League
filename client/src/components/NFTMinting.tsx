import React, { useState, useEffect } from 'react';
import { Zap, Star, Award, Gem, Shield, CheckCircle, AlertCircle, ExternalLink, Clock, Info, Database, Coins } from 'lucide-react';
import { useWallet } from '../lib/stores/useWallet';
import { useUser } from '../lib/stores/useUser';
import { useHeroes } from '../lib/stores/useHeroes';
import { HeroType, getHeroTypeFromSymbol } from '../contracts/ERC721';
import { gameHeroes } from '../data/gameHeroes';
import { isDemoMode, getModeDescription, nftConfig } from '../config/nftConfig';

interface NFTMintingProps {
  heroId: string;
  level: number;
  onClose: () => void;
}

export const NFTMinting: React.FC<NFTMintingProps> = ({ heroId, level, onClose }) => {
  const { 
    isConnected, 
    address, 
    chainId, 
    heroNFTContract, 
    mintHeroNFT, 
    getTransactionStatus,
    isTestnet,
    sendTransaction
  } = useWallet();
  const { currentUser } = useUser();
  const { unlockNFTBadge } = useHeroes();
  const [isMinting, setIsMinting] = useState(false);
  const [mintingStage, setMintingStage] = useState<'prepare' | 'minting' | 'waiting' | 'success' | 'error'>('prepare');
  const [transactionHash, setTransactionHash] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [estimatedGas, setEstimatedGas] = useState<string>('0.002');
  const [contractAddress, setContractAddress] = useState<string>('');
  const [progress, setProgress] = useState<string>('');
  
  // Find hero data from gameHeroes
  const heroData = gameHeroes.find(hero => hero.id === heroId);
  const heroType = heroData ? getHeroTypeFromSymbol(heroData.symbol) : null;
  
  // Get hero names from data
  const getHeroName = () => {
    if (!heroData) return 'Unknown Hero';
    return heroData.name;
  };
  
  // Get network name
  const getNetworkName = () => {
    const networks: Record<number, string> = {
      11155111: 'Sepolia',
      5: 'Goerli',
      80001: 'Mumbai',
      97: 'BSC Testnet',
      1: 'Ethereum Mainnet',
      137: 'Polygon',
      56: 'BSC Mainnet'
    };
    return chainId ? networks[chainId] || `Network ${chainId}` : 'Unknown Network';
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
  const mintingCost = (level * 0.001).toFixed(3);
  
  // Get estimated gas and contract info on component mount
  useEffect(() => {
    const getContractInfo = async () => {
      if (heroNFTContract && heroType) {
        try {
          const heroTypeId = heroType === 'WTR' ? 0 : heroType === 'HEMP' ? 1 : heroType === 'GPWR' ? 2 : heroType === 'BATT' ? 3 : 4;
          const cost = await heroNFTContract.getHeroMintCost(heroTypeId, level);
          setEstimatedGas(parseFloat(cost).toFixed(4));
          
          // Get contract address for display
          const contractAddr = heroNFTContract['contract'].target as string;
          setContractAddress(contractAddr);
        } catch (error) {
          console.warn('Could not get contract info (demo mode):', error);
        }
      }
    };
    
    getContractInfo();
  }, [heroNFTContract, heroType, level]);

  const handleMint = async () => {
    if (!isConnected || !address || !currentUser) {
      setError('Please connect your wallet and log in');
      return;
    }

    if (!heroData || !heroType) {
      setError('Invalid hero data');
      return;
    }

    // Enforce testnet-only operation
    if (!isTestnet()) {
      setError(
        `MAINNET BLOCKED: You are on ${getNetworkName()}. ` +
        'Please switch to a testnet (Sepolia, Goerli, Mumbai, BSC Testnet) to mint demo NFTs.'
      );
      return;
    }

    // Final confirmation for minting
    const confirmMint = window.confirm(
      heroNFTContract
        ? `Mint ${getHeroName()} Level ${level} NFT for ${estimatedGas} ETH?`
        : `DEMO: This will create a demo ${getHeroName()} NFT badge for ${mintingCost} ETH. Continue?`
    );
    
    if (!confirmMint) {
      return;
    }

    setIsMinting(true);
    setMintingStage('minting');
    setError('');
    setProgress('Preparing transaction...');

    try {
      let txHash: string;
      
      if (heroNFTContract) {
        // Use actual smart contract minting
        setProgress('Calling smart contract...');
        txHash = await mintHeroNFT(heroType, level, heroData);
      } else {
        // Fallback to demo mode - send ETH to demo address
        setProgress('Sending demo transaction...');
        const demoTreasuryAddress = '0x742d35cc6634c0532925a3b8d951d6bdbbbbbb';
        txHash = await sendTransaction(demoTreasuryAddress, mintingCost);
      }
      
      setTransactionHash(txHash);
      setMintingStage('waiting');
      setProgress('Transaction submitted, waiting for confirmation...');
      
      // Monitor transaction status
      let confirmed = false;
      let attempts = 0;
      const maxAttempts = 30; // 5 minutes at 10-second intervals
      
      const checkStatus = async () => {
        try {
          attempts++;
          setProgress(`Checking transaction status (${attempts}/${maxAttempts})...`);
          
          const status = await getTransactionStatus(txHash);
          
          if (status.status === 'confirmed') {
            confirmed = true;
            setProgress('Transaction confirmed! Creating NFT badge...');
            
            // Create NFT badge in our system
            await unlockNFTBadge(heroId, level);
            
            setMintingStage('success');
            setProgress('NFT badge created successfully!');
          } else if (status.status === 'failed') {
            throw new Error('Transaction failed on blockchain');
          } else if (attempts >= maxAttempts) {
            throw new Error('Transaction timeout - please check manually');
          } else {
            // Continue monitoring
            setTimeout(checkStatus, 10000); // Check every 10 seconds
          }
        } catch (error) {
          if (!confirmed) {
            setError(error instanceof Error ? error.message : 'Transaction monitoring failed');
            setMintingStage('error');
          }
        }
      };
      
      // Start monitoring after 5 seconds
      setTimeout(checkStatus, 5000);
      
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-purple-500/30 p-6 max-w-md w-full">
        {isDemoMode() && (
          <div className="bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-yellow-500/20 border-2 border-yellow-500/50 rounded-xl p-4 mb-6 animate-pulse">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Database className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-yellow-300 font-bold text-lg">🎮 DEMO MODE</h3>
                  <span className="px-2 py-0.5 bg-yellow-500/30 text-yellow-200 text-xs rounded-full border border-yellow-500/50">
                    TEST ONLY
                  </span>
                </div>
                <p className="text-yellow-200/90 text-sm leading-relaxed mb-2">
                  {getModeDescription()}
                </p>
                <div className="bg-black/30 rounded-lg p-3 space-y-1.5">
                  <div className="flex items-center space-x-2 text-xs">
                    <Database className="w-3.5 h-3.5 text-yellow-400" />
                    <span className="text-yellow-100">Stored in database, not blockchain</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs">
                    <Coins className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-green-100">Free to mint (no real ETH required)</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs">
                    <Info className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-blue-100">Use testnet for blockchain simulation</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {mintingStage === 'prepare' && (
          <>
            <div className="text-center mb-6">
              <div className={`w-20 h-20 rounded-full bg-gradient-to-r ${currentRarity.color} flex items-center justify-center mx-auto mb-4`}>
                <IconComponent className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Mint NFT Badge</h2>
              <p className="text-gray-300">{getHeroName()}</p>
              <p className="text-lg font-semibold text-purple-400">{currentRarity.name} Level {level}</p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-3 mb-4">
                <p className="text-yellow-300 text-sm font-medium">
                  ⚠️ DEMO MODE: This mints demo badges only. Use testnets only (Sepolia, Goerli).
                </p>
              </div>
              
              <div className="bg-black/50 rounded-lg p-4 border border-gray-700 mb-4">
                <h3 className="text-white font-semibold mb-3">NFT Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Hero:</span>
                    <span className="text-white font-medium">{getHeroName()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Symbol:</span>
                    <span className="text-purple-400">{heroData?.symbol || 'N/A'}</span>
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
                    <span className="text-green-400">{heroNFTContract ? estimatedGas : mintingCost} ETH</span>
                  </div>
                  {heroData?.stats && (
                    <div className="border-t border-gray-600 pt-2 mt-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Power: {heroData.stats.power}</span>
                        <span className="text-gray-400">Health: {heroData.stats.health}</span>
                        <span className="text-gray-400">Speed: {heroData.stats.speed}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-4 mb-4">
                <h4 className="text-blue-300 font-medium mb-2">Network Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Network:</span>
                    <span className={`${isTestnet() ? 'text-green-400' : 'text-red-400'}`}>
                      {getNetworkName()} {isTestnet() ? '✓' : '⚠️'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Contract Mode:</span>
                    <span className={`${heroNFTContract ? 'text-green-400' : 'text-yellow-400'}`}>
                      {heroNFTContract ? 'Smart Contract' : 'Demo Mode'}
                    </span>
                  </div>
                  {contractAddress && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Contract:</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-300 font-mono">
                          {contractAddress.slice(0, 6)}...{contractAddress.slice(-4)}
                        </span>
                        <button
                          onClick={() => window.open(`https://${isTestnet() ? 'sepolia.' : ''}etherscan.io/address/${contractAddress}`, '_blank')}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {!isConnected && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-3 rounded-lg text-sm">
                  Please connect your wallet to mint this NFT
                </div>
              )}
              
              <div className={`${isTestnet() ? 'bg-green-500/10 border-green-500/50 text-green-300' : 'bg-red-500/10 border-red-500/50 text-red-300'} p-3 rounded-lg text-sm`}>
                <div className="flex items-center space-x-2">
                  {isTestnet() ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>
                    <strong>{isTestnet() ? 'Testnet Ready:' : 'Network Warning:'}</strong> {' '}
                    {isTestnet() 
                      ? `Connected to ${getNetworkName()}. Ready to mint!`
                      : `Please switch to a testnet to mint demo NFTs.`
                    }
                  </span>
                </div>
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
                disabled={!isConnected || isMinting || !isTestnet()}
                className={`flex-1 py-3 px-4 bg-gradient-to-r ${isTestnet() ? 'from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700' : 'from-gray-600 to-gray-700'} disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 font-bold relative`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <span>{!isConnected ? 'Connect Wallet' : !isTestnet() ? 'Switch to Testnet' : `Mint ${getHeroName()} NFT`}</span>
                  {isDemoMode() && isConnected && isTestnet() && (
                    <span className="px-2 py-0.5 bg-yellow-500/30 text-yellow-200 text-xs rounded-full border border-yellow-500/50">
                      DEMO
                    </span>
                  )}
                </div>
              </button>
            </div>
          </>
        )}

        {mintingStage === 'minting' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Initiating Mint...</h2>
            <p className="text-gray-300 mb-4">Please confirm the transaction in your wallet</p>
            <div className="bg-black/50 rounded-lg p-4 border border-gray-700">
              <p className="text-sm text-gray-400">Status:</p>
              <p className="text-white">{progress}</p>
            </div>
          </div>
        )}

        {mintingStage === 'waiting' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Minting in Progress...</h2>
            <p className="text-gray-300 mb-4">Transaction submitted to blockchain</p>
            
            <div className="bg-black/50 rounded-lg p-4 border border-gray-700 mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-400">Transaction Hash:</p>
                <button
                  onClick={() => window.open(`https://${isTestnet() ? 'sepolia.' : ''}etherscan.io/tx/${transactionHash}`, '_blank')}
                  className="text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                >
                  <span className="text-xs">View</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
              <p className="text-xs text-blue-400 font-mono break-all">{transactionHash}</p>
            </div>
            
            <div className="bg-blue-500/10 border border-blue-500/50 text-blue-300 p-3 rounded-lg text-sm mb-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>{progress}</span>
              </div>
            </div>
            
            <div className="bg-yellow-500/10 border border-yellow-500/50 text-yellow-300 p-3 rounded-lg text-sm">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4" />
                <span>This may take 1-5 minutes on testnet</span>
              </div>
            </div>
          </div>
        )}

        {mintingStage === 'success' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">🎉 NFT Minted Successfully!</h2>
            <p className="text-gray-300 mb-4">
              Your <span className="text-purple-400">{currentRarity.name}</span> {' '}
              <span className="text-yellow-400">{getHeroName()}</span> NFT has been minted!
            </p>
            
            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <span className="text-2xl">{heroData?.avatar || '🦸'}</span>
                <div className="text-center">
                  <p className="text-white font-bold">{getHeroName()}</p>
                  <p className="text-green-400 text-sm">Level {level} • {currentRarity.name}</p>
                </div>
              </div>
              
              {transactionHash && (
                <div className="border-t border-green-500/20 pt-3 mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm text-gray-400">Transaction:</p>
                    <button
                      onClick={() => window.open(`https://${isTestnet() ? 'sepolia.' : ''}etherscan.io/tx/${transactionHash}`, '_blank')}
                      className="text-green-400 hover:text-green-300 flex items-center space-x-1"
                    >
                      <span className="text-xs">View on Explorer</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-xs text-green-400 font-mono break-all">{transactionHash}</p>
                </div>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleClose}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg transition-colors font-bold"
              >
                View in Collection
              </button>
              {contractAddress && (
                <button
                  onClick={() => window.open(`https://${isTestnet() ? 'testnets.' : ''}opensea.io/assets/${contractAddress}`, '_blank')}
                  className="py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  <span>OpenSea</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              )}
            </div>
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
                onClick={() => {
                  setMintingStage('prepare');
                  setError('');
                  setTransactionHash('');
                  setProgress('');
                }}
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