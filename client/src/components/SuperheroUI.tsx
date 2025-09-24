import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useHeroes } from "@/lib/stores/useHeroes";
import { useContribution } from "@/lib/stores/useContribution";
import { Zap, Shield, Crown, Star, Award } from "lucide-react";

export default function SuperheroUI() {
  const { currentRank, totalContribution, getProgressToNext, getNextRank } = useContribution();
  const nextRank = getNextRank();
  const progress = getProgressToNext();

  const getRankIcon = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'recruit': return <Shield className="h-4 w-4" />;
      case 'defender': return <Zap className="h-4 w-4" />;
      case 'guardian': return <Star className="h-4 w-4" />;
      case 'champion': return <Crown className="h-4 w-4" />;
      case 'legend': return <Award className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  return (
    <div className="fixed top-4 left-4 z-50 space-y-4 max-w-sm">
      {/* Current Rank Display */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-black/80 border-green-500/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-green-400">
              {getRankIcon(currentRank.tier)}
              {currentRank.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300">Total Contribution:</span>
              <Badge variant="outline" style={{ color: currentRank.color, borderColor: currentRank.color }}>
                ${totalContribution.toLocaleString()}
              </Badge>
            </div>
            
            {nextRank && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Progress to {nextRank.name}:</span>
                  <span className="text-green-400">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                <div className="text-xs text-gray-400 text-center">
                  ${(nextRank.minContribution - totalContribution).toLocaleString()} remaining
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Hero Selection Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="bg-black/60 border-blue-500/30 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-blue-300 mb-2">Click on heroes to explore</p>
            <p className="text-xs text-gray-400">Discover their powers and impact</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
