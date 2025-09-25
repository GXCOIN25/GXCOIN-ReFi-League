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
    "$500,000 spending power",
    "Self-custody security",
    "Bitcoin cashback rewards",
    "VIP Concierge benefits",
    "Global event access",
    "Impact dashboard"
  ];

  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div
        className="relative perspective-1000"
        initial={{ rotateY: 0 }}
        animate={{ rotateY: isRevealed ? 180 : 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front of Card */}
        <motion.div
          className="absolute inset-0 backface-hidden"
          style={{ backfaceVisibility: "hidden" }}
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
                GXCOIN BLACK CARD
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                The ultimate tool for eco-warriors
              </p>
              
              <Button 
                onClick={() => setIsRevealed(true)}
                className="bg-gradient-to-r from-yellow-600 to-yellow-400 hover:from-yellow-500 hover:to-yellow-300"
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
            transform: "rotateY(180deg)" 
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
                  onClick={() => setIsRevealed(false)}
                  className="text-gold-400 hover:text-gold-300"
                >
                  ↻
                </Button>
              </div>

              <div className="space-y-2">
                <h4 className="text-white font-bold text-sm mb-3">Platinum Benefits:</h4>
                {cardFeatures.map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-center gap-2 text-xs"
                  >
                    <Star className="h-3 w-3 text-gold-400 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </motion.div>
                ))}
              </div>

              <div className="absolute bottom-4 right-4">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gold-400 rounded-full" />
                  <div className="w-2 h-2 bg-gold-300 rounded-full" />
                  <div className="w-2 h-2 bg-gold-200 rounded-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Card Actions */}
      <motion.div 
        className="mt-6 space-y-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Button className="w-full bg-gold-600 hover:bg-gold-500 text-white">
          Apply for BLACK CARD
        </Button>
        <p className="text-center text-xs text-gray-400">
          Available for {currentRank.name} and above
        </p>
      </motion.div>
    </div>
  );
}
