import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useContribution } from "@/lib/stores/useContribution";
import { ranks } from "@/data/ranks";
import { Shield, Zap, Star, Crown, Award, Check } from "lucide-react";

export default function RankProgression() {
  const { totalContribution, currentRank } = useContribution();

  const getRankIcon = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'recruit': return <Shield className="h-5 w-5" />;
      case 'defender': return <Zap className="h-5 w-5" />;
      case 'guardian': return <Star className="h-5 w-5" />;
      case 'champion': return <Crown className="h-5 w-5" />;
      case 'legend': return <Award className="h-5 w-5" />;
      default: return <Shield className="h-5 w-5" />;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <Card className="bg-black/80 backdrop-blur-sm border-green-500/30">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-white">
            Eco-Warrior Rank Progression
          </CardTitle>
          <p className="text-center text-gray-400">
            Advance through the ranks by contributing to regenerative finance
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {ranks.map((rank, index) => {
            const isUnlocked = totalContribution >= rank.minContribution;
            const isCurrent = currentRank.id === rank.id;
            const progress = Math.min(
              ((totalContribution - rank.minContribution) / 
               (ranks[index + 1]?.minContribution - rank.minContribution || 1000)) * 100,
              100
            );

            return (
              <motion.div
                key={rank.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative p-4 rounded-lg border-2 transition-all duration-300 ${
                  isCurrent 
                    ? 'border-green-500 bg-green-500/10' 
                    : isUnlocked
                    ? 'border-gray-600 bg-gray-900/50'
                    : 'border-gray-800 bg-gray-900/20'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div 
                    className={`p-3 rounded-full ${
                      isUnlocked ? 'text-white' : 'text-gray-600'
                    }`}
                    style={{ 
                      backgroundColor: isUnlocked ? rank.color + '30' : 'transparent',
                      color: isUnlocked ? rank.color : undefined
                    }}
                  >
                    {isUnlocked && <Check className="absolute top-1 right-1 h-3 w-3 text-green-500" />}
                    {getRankIcon(rank.tier)}
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className={`text-lg font-bold ${isUnlocked ? 'text-white' : 'text-gray-600'}`}>
                          {rank.name}
                        </h3>
                        <p className="text-sm text-gray-400">
                          Minimum contribution: ${rank.minContribution.toLocaleString()}
                        </p>
                      </div>
                      <Badge 
                        variant={isCurrent ? "default" : "outline"}
                        style={{ 
                          backgroundColor: isCurrent ? rank.color : 'transparent',
                          borderColor: rank.color,
                          color: isCurrent ? 'white' : rank.color
                        }}
                      >
                        {rank.cardType}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Benefits:</h4>
                        <ul className="space-y-1 text-xs text-gray-400">
                          {rank.benefits.slice(0, 3).map((benefit, i) => (
                            <li key={i} className="flex items-center gap-1">
                              <div className="w-1 h-1 rounded-full bg-green-500" />
                              {benefit}
                            </li>
                          ))}
                          {rank.benefits.length > 3 && (
                            <li className="text-gray-500">+{rank.benefits.length - 3} more...</li>
                          )}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-300 mb-2">NFT Rewards:</h4>
                        <Badge variant="outline" className="text-xs" style={{ borderColor: rank.color + '50' }}>
                          {rank.nftType}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          Impact Multiplier: {rank.impactMultiplier}x
                        </p>
                      </div>
                    </div>

                    {isUnlocked && !isCurrent && (
                      <div className="text-xs text-green-400 flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Rank Achieved
                      </div>
                    )}

                    {isCurrent && index < ranks.length - 1 && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Progress to next rank:</span>
                          <span className="text-green-400">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-1" />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
