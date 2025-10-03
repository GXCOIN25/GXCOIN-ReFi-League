import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useContribution } from "@/lib/stores/useContribution";
import { CreditCard, Star, Shield, Crown, Zap } from "lucide-react";

export default function BlackCard() {
  const [isRevealed, setIsRevealed] = useState(false);
  const { currentRank, anchorPower, gxcoinStake, getAnchorMultiplier } = useContribution();

  const anchorMultiplier = getAnchorMultiplier();
  
  // Gate premium benefits based on GXCOIN Anchor Power thresholds
  const getAvailableFeatures = () => {
    const baseFeatures = [
      "Patent licensing profit sharing",
      "Eco-warrior reward multipliers"
    ];
    
    const bronzeFeatures = [
      ...baseFeatures,
      "Real-time impact dashboard",
      "GXCOIN staking rewards"
    ];
    
    const silverFeatures = [
      ...bronzeFeatures,
      "VIP Concierge services 24/7",
      "Self-custody security protocol"
    ];
    
    const goldFeatures = [
      ...silverFeatures,
      "Global premium event access",
      "Bitcoin cashback on all purchases"
    ];
    
    const platinumFeatures = [
      ...goldFeatures,
      "$500,000 spending power limit",
      "Private wealth management"
    ];
    
    // Gate features based on anchor power thresholds
    if (anchorPower >= 10) return platinumFeatures;
    if (anchorPower >= 5) return goldFeatures;
    if (anchorPower >= 2) return silverFeatures;
    if (anchorPower >= 1) return bronzeFeatures;
    return baseFeatures;
  };
  
  const cardFeatures = getAvailableFeatures();

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
              
              {/* GXCOIN Visa Card Image */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative z-10 mb-4"
              >
                <img 
                  src="/gxcoin-visa-card.jpg" 
                  alt="GXCOIN Premium Member Platinum Visa Card" 
                  className="w-48 h-30 object-cover rounded-lg shadow-2xl border border-yellow-500/30"
                  onError={(e) => {
                    // Fallback to icon if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = '<CreditCard className="h-12 w-12 text-yellow-400" />';
                    }
                  }}
                />
              </motion.div>
              
              <h3 className="text-lg font-bold text-white mb-2">
                GXCOIN PREMIUM VISA CARD
              </h3>
              <div className="mb-4 space-y-1">
                <p className="text-gray-400 text-sm">
                  Patent-powered crypto card for eco-warriors
                </p>
                <div className="flex items-center justify-center gap-2 text-green-400 text-xs font-medium">
                  <Crown className="h-3 w-3" />
                  <span>Backed by GXCOIN Anchor</span>
                </div>
              </div>
              
              <Button 
                onClick={() => {
                  if (process.env.NODE_ENV !== 'production') {
                    console.log('Revealing card features...');
                  }
                  setIsRevealed(true);
                }}
                className="bg-gradient-to-r from-yellow-600 to-yellow-400 hover:from-yellow-500 hover:to-yellow-300 min-h-[44px] min-w-[160px] touch-manipulation"
              >
                View Program Details
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
                {/* GXCOIN Anchor Status */}
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-2 mb-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-green-300 font-medium">Anchor Power</span>
                    <span className="text-green-400 font-bold">{anchorPower}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-green-300 font-medium">GXCOIN Stake</span>
                    <span className="text-green-400 font-bold">${gxcoinStake}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-green-300 font-medium">Power Multiplier</span>
                    <span className="text-green-400 font-bold">{anchorMultiplier.toFixed(2)}x</span>
                  </div>
                </div>
                
                <h4 className="text-white font-bold text-sm mb-2">Available Benefits:</h4>
                <div className="max-h-24 overflow-y-auto space-y-1">
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
                
                {/* Locked Features */}
                {anchorPower < 10 && (
                  <div className="mt-2 p-2 bg-gray-800/50 rounded-lg">
                    <p className="text-xs text-gray-400 text-center">
                      Unlock more features by increasing your GXCOIN stake
                    </p>
                  </div>
                )}
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

      {/* GXCOIN Visa Program Details */}
      <motion.div 
        className="mt-6 bg-gray-900/50 rounded-lg p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <h4 className="text-white font-bold text-sm mb-3 text-center">Premium Visa Card Program</h4>
        <div className="mb-4">
          <img 
            src="/gxcoin-visa-program.jpg" 
            alt="GXCOIN Premium Visa Card Program Details" 
            className="w-full object-cover rounded-lg shadow-lg border border-yellow-500/30"
            onError={(e) => {
              // Fallback if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>
        <div className="space-y-2 text-xs text-gray-300">
          <div className="flex justify-between">
            <span>💳 Debit Card:</span>
            <span className="text-green-400">$500 - $500,000 USD</span>
          </div>
          <div className="flex justify-between">
            <span>💎 Credit Card:</span>
            <span className="text-blue-400">$5,000 - $500,000 USD</span>
          </div>
          <div className="flex justify-between">
            <span>⚡ Token Rewards:</span>
            <span className="text-yellow-400">$WTR • Direct crypto deposits</span>
          </div>
          <div className="flex justify-between">
            <span>🌍 Global Access:</span>
            <span className="text-purple-400">Visa/Mastercard accepted</span>
          </div>
        </div>
      </motion.div>

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
        <div className="text-center space-y-1">
          <p className="text-xs text-gray-400">
            Available for Platinum+ ranks • Patent-powered rewards included
          </p>
          <p className="text-xs text-green-400">
            Powered by GXCOIN Anchor • {anchorPower} Anchor Power Active
          </p>
        </div>
      </motion.div>
    </div>
  );
}
