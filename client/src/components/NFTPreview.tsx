import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useHeroes } from "@/lib/stores/useHeroes";
import { useContribution } from "@/lib/stores/useContribution";
import { Sparkles, Star, Zap, Award, Crown, ShoppingCart } from "lucide-react";
import TokenBadge, { TokenSymbol } from "./TokenBadge";

interface NFTPreviewProps {
  onMintNFT?: (heroId: string, level: number) => void;
}

export default function NFTPreview({ onMintNFT }: NFTPreviewProps = {}) {
  const [selectedNFT, setSelectedNFT] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const { heroes, nftBadges, unlockNFTBadge } = useHeroes();
  const { currentRank, impactMetrics } = useContribution();

  // Helper function to validate token symbol for TokenBadge
  const getValidTokenSymbol = (heroSymbol: string): TokenSymbol => {
    if (['WTR', 'HEMP', 'GPWR', 'BATT', 'GCCT'].includes(heroSymbol)) {
      return heroSymbol as TokenSymbol;
    }
    return "GCCT"; // fallback
  };

  // Helper function to get NFT badge name from hero
  const getNFTBadgeName = (heroName: string): string => {
    if (heroName.includes("AQUA")) return "Water Guardian Badge";
    if (heroName.includes("HEMP")) return "Green Builder Badge";
    if (heroName.includes("VOLTRA")) return "Energy Warrior Badge";
    if (heroName.includes("GRAPHENE")) return "Tech Titan Badge";
    if (heroName.includes("TRADER")) return "Market Master Badge";
    return "Eco-Warrior Badge";
  };

  // Generate dynamic NFT previews based on rank and impact
  const generateNFTPreview = (heroId: string, level: number) => {
    const hero = heroes.find(h => h.id === heroId);
    if (!hero) return null;

    const rarity = level > 3 ? 'Legendary' : level > 1 ? 'Rare' : 'Common';
    
    // Enhanced attribute calculation based on currentRank and impactMetrics
    const rankMultiplier = currentRank.impactMultiplier;
    const baseAttributes = {
      power: Math.min(
        level * 8 + 
        Math.floor(impactMetrics.carbonOffset / 100) + 
        Math.floor(impactMetrics.renewableEnergy / 200) +
        (rankMultiplier * 10), 
        100
      ),
      impact: Math.min(
        level * 12 + 
        Math.floor(impactMetrics.plasticRemoved / 1000) + 
        Math.floor(impactMetrics.waterPurified / 5000) + 
        Math.floor(impactMetrics.treesPlanted * 5) +
        (rankMultiplier * 8), 
        100
      ),
      rarity: Math.min(
        level * 15 + 
        Math.floor((impactMetrics.carbonOffset + impactMetrics.plasticRemoved) / 10000) +
        (rankMultiplier * 12),
        100
      )
    };

    return {
      hero,
      level,
      rarity: rarity as 'Common' | 'Rare' | 'Legendary',
      attributes: baseAttributes,
      evolution: level > 3 ? 'Legendary' : level > 1 ? 'Evolved' : 'Base'
    };
  };

  const nftPreviews = heroes.map(hero => 
    generateNFTPreview(hero.id, Math.min(Math.floor(currentRank.impactMultiplier), 5))
  ).filter((nft): nft is NonNullable<typeof nft> => nft !== null);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Legendary': return 'from-yellow-400 via-orange-500 to-red-500';
      case 'Rare': return 'from-purple-400 via-blue-500 to-indigo-500';
      case 'Common': return 'from-gray-400 via-gray-500 to-gray-600';
      default: return 'from-gray-400 via-gray-500 to-gray-600';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'Legendary': return <Crown className="h-4 w-4" />;
      case 'Rare': return <Star className="h-4 w-4" />;
      case 'Common': return <Zap className="h-4 w-4" />;
      default: return <Sparkles className="h-4 w-4" />;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <Card className="bg-black/80 backdrop-blur-sm border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Sparkles className="h-6 w-6 text-purple-400" />
            Dynamic NFT Collection
          </CardTitle>
          <p className="text-gray-400">
            Your NFT badges evolve with your impact and contributions
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Collection Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-900/50 rounded-lg">
              <div className="text-lg font-bold text-purple-400">
                {nftPreviews.length}
              </div>
              <div className="text-xs text-gray-400">Total NFTs</div>
            </div>
            <div className="text-center p-3 bg-gray-900/50 rounded-lg">
              <div className="text-lg font-bold text-yellow-400">
                {nftPreviews.filter(n => n.rarity === 'Legendary').length}
              </div>
              <div className="text-xs text-gray-400">Legendary</div>
            </div>
            <div className="text-center p-3 bg-gray-900/50 rounded-lg">
              <div className="text-lg font-bold text-blue-400">
                {nftPreviews.filter(n => n.rarity === 'Rare').length}
              </div>
              <div className="text-xs text-gray-400">Rare</div>
            </div>
            <div className="text-center p-3 bg-gray-900/50 rounded-lg">
              <div className="text-lg font-bold text-green-400">
                {Math.round(currentRank.impactMultiplier * 100)}%
              </div>
              <div className="text-xs text-gray-400">Evolution</div>
            </div>
          </div>

          {/* NFT Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nftPreviews.map((nft, index) => (
              <motion.div
                key={`${nft.hero.id}-${nft.level}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="cursor-pointer"
                onClick={() => setSelectedNFT(nft.hero.id)}
              >
                <Card className="overflow-hidden relative">
                  {/* Animated Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${getRarityColor(nft.rarity)} opacity-20 animate-pulse`} />
                  
                  <CardContent className="p-4 relative z-10">
                    {/* NFT Header */}
                    <div className="flex justify-between items-start mb-3">
                      <Badge 
                        variant="outline" 
                        className={`bg-gradient-to-r ${getRarityColor(nft.rarity)} text-white border-0`}
                      >
                        {getRarityIcon(nft.rarity)}
                        <span className="ml-1">{nft.rarity}</span>
                      </Badge>
                      <span className="text-xs text-gray-400">Level {nft.level}</span>
                    </div>

                    {/* NFT Visual Representation - TokenBadge */}
                    <div className="w-full h-44 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden bg-gray-900/50">
                      <div className="flex flex-col items-center gap-2">
                        <TokenBadge
                          tokenSymbol={getValidTokenSymbol(nft.hero.symbol)}
                          attributes={nft.attributes}
                          rarity={nft.rarity}
                          level={nft.level}
                          size="lg"
                          className="drop-shadow-lg"
                          animated={true}
                        />
                        <div className="text-center">
                          <div className="text-sm font-bold text-white">
                            {nft.hero.name}
                          </div>
                          <div className="text-xs text-gray-400">
                            {getNFTBadgeName(nft.hero.name)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* NFT Info */}
                    <div className="space-y-2">
                      <h3 className="font-bold text-white">{nft.hero.title}</h3>
                      <div className="text-xs text-gray-400">
                        Evolution: <span className="text-white">{nft.evolution}</span>
                      </div>
                      
                      {/* Attribute Summary - Now integrated into TokenBadge */}
                      <div className="text-xs text-center text-gray-400">
                        Attributes dynamically displayed in badge progress arcs
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Evolution Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="p-6 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg border border-purple-500/30"
          >
            <h3 className="text-lg font-bold text-white mb-3">
              🧬 NFT Evolution System
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-purple-400 font-medium">Dynamic Attributes</div>
                <p className="text-gray-300">NFTs evolve based on your real impact metrics</p>
              </div>
              <div>
                <div className="text-blue-400 font-medium">Rank Integration</div>
                <p className="text-gray-300">Higher ranks unlock legendary evolutions</p>
              </div>
              <div>
                <div className="text-green-400 font-medium">Tradeable Rewards</div>
                <p className="text-gray-300">Proof-of-impact badges with market value</p>
              </div>
            </div>
          </motion.div>

          {/* Mint Action */}
          <div className="text-center space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500"
                size="lg"
                onClick={() => {
                  setLocation('/');
                  setTimeout(() => {
                    const gameTab = document.querySelector('[data-value="game"]') as HTMLElement;
                    if (gameTab) gameTab.click();
                  }, 500);
                }}
              >
                <Award className="h-4 w-4 mr-2" />
                Unlock Collection
              </Button>
              
              {onMintNFT && (
                <Button 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                  size="lg"
                  onClick={() => {
                    const heroToMint = heroes[0];
                    if (heroToMint) {
                      onMintNFT(heroToMint.id, Math.min(Math.floor(currentRank.impactMultiplier), 5));
                    }
                  }}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Mint NFT on Blockchain
                </Button>
              )}
              
              <Button 
                className="bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-500 hover:to-yellow-500"
                size="lg"
                onClick={() => {
                  // Check for purchasable heroes in priority order
                  const aquaHero = heroes.find(hero => 
                    hero.id === 'aqua_wtr' || 
                    hero.id.toLowerCase().includes('aqua') || 
                    hero.id.toLowerCase().includes('wtr')
                  );
                  const anchorHero = heroes.find(hero => hero.id === 'gxcoin_anchor');
                  const battHero = heroes.find(hero => hero.id === 'graphene_batt');
                  
                  if (aquaHero) {
                    window.location.href = 'https://buy.stripe.com/00w14fblMdFZg98dSc83C0u';
                  } else if (anchorHero) {
                    window.location.href = 'https://buy.stripe.com/00w8wHfC2fO7g98dSc83C0y';
                  } else if (battHero) {
                    window.location.href = 'https://buy.stripe.com/dRm4grgG6fO78GG29u83C0x';
                  } else {
                    alert('AQUA ($WTR), GXCOIN Anchor, and GRAPHENE ($BATT) NFTs available for purchase! Check the Heroes tab.');
                  }
                }}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Purchase dNFT
              </Button>
            </div>
            <p className="text-xs text-gray-400">
              {onMintNFT ? 'Unlock badges in-app or mint real NFTs on blockchain' : 'Your NFTs will evolve as you make more impact'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
