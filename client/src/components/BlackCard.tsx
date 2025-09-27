import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useContribution } from "@/lib/stores/useContribution";
import { CreditCard, Star, Shield, Crown, Zap } from "lucide-react";

export default function BlackCard() {
  const [isRevealed, setIsRevealed] = useState(false);
  const { currentRank } = useContribution();

  const cardFeatures = [
    "$500,000 spending power limit",
    "Bitcoin cashback on all purchases", 
    "VIP Concierge services 24/7",
    "Self-custody security protocol",
    "Global premium event access",
    "Real-time impact dashboard",
    "Patent licensing profit sharing",
    "Eco-warrior reward multipliers"
  ];

  const rankTiers = [
    { name: "Bronze Recruit", color: "#cd7f32", contribution: "175+" },
    { name: "Silver Defender", color: "#c0c0c0", contribution: "500+" },
    { name: "Gold Guardian", color: "#ffd700", contribution: "1,000+" },
    { name: "Platinum Champion", color: "#e5e4e2", contribution: "5,000+" },
    { name: "Diamond Legend", color: "#b9f2ff", contribution: "10,000+" }
  ];

  // Check if user prefers reduced motion
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div
        className="relative perspective-1000"
        initial={{ rotateY: 0 }}
        animate={{ rotateY: isRevealed ? 180 : 0 }}
        transition={{ duration: prefersReducedMotion ? 0.2 : 0.8, ease: "easeInOut" }}
        style={{ 
          transformStyle: "preserve-3d",
          height: "256px", // Fixed height to prevent layout shift
          width: "100%"
        }}
      >
        {/* Front of Card */}
        <motion.div
          className="absolute inset-0 backface-hidden"
          style={{ 
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            zIndex: isRevealed ? 1 : 2
          }}
        >
          <Card className="h-64 bg-gradient-to-br from-gray-900 via-black to-gray-800 border-yellow-500/50 overflow-hidden">
            <CardContent className="h-full flex flex-col justify-center items-center text-center p-6 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-transparent to-purple-500/10" />
              
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="relative z-10"
              >
                <CreditCard className="h-12 w-12 text-yellow-400 mb-4" />
              </motion.div>
              
              <h3 className="text-xl font-bold text-white mb-2">
                GXCOIN PLATINUM BLACK CARD
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Patent-powered crypto BLACK CARD for eco-warriors
              </p>
              
              <Button 
                onClick={() => {
                  if (process.env.NODE_ENV !== 'production') {
                    console.log('Revealing card features...');
                  }
                  setIsRevealed(true);
                }}
                className="bg-gradient-to-r from-yellow-600 to-yellow-400 hover:from-yellow-500 hover:to-yellow-300 min-h-[44px] min-w-[160px] touch-manipulation"
              >
                Reveal Card Features
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Back of Card */}
        <motion.div
          className="absolute inset-0 backface-hidden"
          style={{ 
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            zIndex: isRevealed ? 2 : 1
          }}
        >
          <Card className="h-64 bg-black border-yellow-500 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-purple-500/5 to-blue-500/5" />
            
            <CardContent className="h-full p-4 relative z-10">
              <div className="flex justify-between items-start mb-4">
                <Badge 
                  className="text-xs"
                  style={{ 
                    backgroundColor: currentRank.color + '20',
                    color: currentRank.color,
                    borderColor: currentRank.color
                  }}
                >
                  {currentRank.name}
                </Badge>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    if (process.env.NODE_ENV !== 'production') {
                      console.log('Hiding card features...');
                    }
                    setIsRevealed(false);
                  }}
                  className="text-yellow-400 hover:text-yellow-300 min-h-[44px] min-w-[44px] touch-manipulation"
                >
                  ↻
                </Button>
              </div>

              <div className="space-y-2">
                <h4 className="text-white font-bold text-sm mb-2">BLACK CARD Benefits:</h4>
                <div className="max-h-36 overflow-y-auto space-y-1">
                  {cardFeatures.map((feature, index) => (
                    <motion.div
                      key={feature}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * index }}
                      className="flex items-center gap-2 text-xs"
                    >
                      <Star className="h-2 w-2 text-yellow-400 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="absolute bottom-4 right-4">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                  <div className="w-2 h-2 bg-yellow-300 rounded-full" />
                  <div className="w-2 h-2 bg-yellow-200 rounded-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Card Actions */}
      {/* Hero Rank Progression */}
      <motion.div 
        className="mt-6 bg-gray-900/50 rounded-lg p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <h4 className="text-white font-bold text-sm mb-3 text-center">Hero Rank Progression</h4>
        <div className="space-y-2">
          {rankTiers.map((tier, index) => (
            <div 
              key={tier.name}
              className={`flex items-center justify-between p-2 rounded text-xs ${
                tier.name === currentRank.name 
                  ? 'bg-yellow-500/20 border border-yellow-500/30' 
                  : 'bg-gray-800/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: tier.color }}
                />
                <span className="text-white font-medium">{tier.name}</span>
              </div>
              <span className="text-gray-400">${tier.contribution}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Card Actions */}
      <motion.div 
        className="mt-4 space-y-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        <Button className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white min-h-[44px] touch-manipulation">
          <CreditCard className="h-4 w-4 mr-2" />
          Apply for BLACK CARD
        </Button>
        <p className="text-center text-xs text-gray-400">
          Available for Platinum+ ranks • Patent-powered rewards included
        </p>
      </motion.div>
    </div>
  );
}
