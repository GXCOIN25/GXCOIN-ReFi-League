import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useHeroes } from "@/lib/stores/useHeroes";
import { useContribution } from "@/lib/stores/useContribution";
import { Sparkles, Star, Zap, Award, Crown } from "lucide-react";

export default function NFTPreview() {
  const [selectedNFT, setSelectedNFT] = useState<string | null>(null);
  const { heroes, nftBadges, unlockNFTBadge } = useHeroes();
  const { currentRank, impactMetrics } = useContribution();

  // Generate dynamic NFT previews based on rank and impact
  const generateNFTPreview = (heroId: string, level: number) => {
    const hero = heroes.find(h => h.id === heroId);
    if (!hero) return null;

    const rarity = level > 3 ? 'Legendary' : level > 1 ? 'Rare' : 'Common';
    const attributes = {
      power: Math.min(level * 10 + Math.floor(impactMetrics.carbonOffset / 10), 100),
      impact: Math.min(level * 15 + Math.floor(impactMetrics.plasticRemoved / 100), 100),
      rarity: level * 20
    };

    return {
      hero,
      level,
      rarity,
      attributes,
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

                    {/* NFT Visual Representation */}
                    <div 
                      className={`w-full h-32 rounded-lg mb-3 bg-gradient-to-br ${nft.hero.gradient} flex items-center justify-center relative overflow-hidden`}
                    >
                      <div className="absolute inset-0 bg-black/20" />
                      <div className="relative z-10 text-center">
                        <div className="text-3xl font-bold text-white mb-1">
                          {nft.hero.name}
                        </div>
                        <div className="text-sm text-white/80">
                          {nft.hero.nftBadge}
                        </div>
                      </div>
                      
                      {/* Evolution Effects */}
                      {nft.evolution === 'Legendary' && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent animate-pulse" />
                      )}
                    </div>

                    {/* NFT Info */}
                    <div className="space-y-2">
                      <h3 className="font-bold text-white">{nft.hero.title}</h3>
                      <div className="text-xs text-gray-400">
                        Evolution: <span className="text-white">{nft.evolution}</span>
                      </div>
                      
                      {/* Attributes */}
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center">
                          <div className="text-red-400 font-bold">{nft.attributes.power}</div>
                          <div className="text-gray-400">Power</div>
                        </div>
                        <div className="text-center">
                          <div className="text-blue-400 font-bold">{nft.attributes.impact}</div>
                          <div className="text-gray-400">Impact</div>
                        </div>
                        <div className="text-center">
                          <div className="text-purple-400 font-bold">{nft.attributes.rarity}</div>
                          <div className="text-gray-400">Rarity</div>
                        </div>
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
            <Button 
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500"
              size="lg"
              onClick={() => {
                heroes.forEach(hero => {
                  unlockNFTBadge(hero.id, Math.min(Math.floor(currentRank.impactMultiplier), 5));
                });
              }}
            >
              <Award className="h-4 w-4 mr-2" />
              Mint Current Collection
            </Button>
            <p className="text-xs text-gray-400">
              Your NFTs will evolve as you make more impact
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
