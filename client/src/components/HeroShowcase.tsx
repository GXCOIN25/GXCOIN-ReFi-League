import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useHeroes } from "@/lib/stores/useHeroes";
import { X, Zap, Droplet, Leaf, Battery, TrendingUp } from "lucide-react";

export default function HeroShowcase() {
  const { selectedHero, clearSelection } = useHeroes();

  if (!selectedHero) return null;

  const getHeroIcon = (heroId: string) => {
    switch (heroId) {
      case 'aqua': return <Droplet className="h-6 w-6" />;
      case 'hemp': return <Leaf className="h-6 w-6" />;
      case 'voltra': return <Zap className="h-6 w-6" />;
      case 'graphene': return <Battery className="h-6 w-6" />;
      case 'trader': return <TrendingUp className="h-6 w-6" />;
      default: return <Zap className="h-6 w-6" />;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key="hero-showcase"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) clearSelection();
        }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          <Card 
            className="relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${selectedHero.color}20 0%, transparent 70%)`,
              borderColor: selectedHero.color + '50'
            }}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
              onClick={clearSelection}
            >
              <X className="h-4 w-4" />
            </Button>

            <CardHeader className="pb-6">
              <div className="flex items-center gap-4">
                <div 
                  className="p-3 rounded-full"
                  style={{ backgroundColor: selectedHero.color + '20', color: selectedHero.color }}
                >
                  {getHeroIcon(selectedHero.id)}
                </div>
                <div>
                  <CardTitle className="text-3xl text-white mb-1">
                    {selectedHero.name}
                  </CardTitle>
                  <Badge 
                    variant="outline" 
                    className="text-sm"
                    style={{ color: selectedHero.color, borderColor: selectedHero.color }}
                  >
                    {selectedHero.symbol}
                  </Badge>
                </div>
              </div>
              <h3 className="text-xl text-gray-300 mt-2">{selectedHero.title}</h3>
            </CardHeader>

            <CardContent className="space-y-6">
              <p className="text-gray-300 leading-relaxed">
                {selectedHero.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white">Powers & Abilities</h4>
                  <div className="space-y-2">
                    {selectedHero.powers.map((power, index) => (
                      <motion.div
                        key={power}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-2"
                      >
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: selectedHero.color }}
                        />
                        <span className="text-gray-300">{power}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white">Impact Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Asset Value:</span>
                      <span className="text-white font-medium">{selectedHero.assetValue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Primary Impact:</span>
                      <span className="text-white font-medium">{selectedHero.impact}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">NFT Badge:</span>
                      <Badge 
                        variant="outline"
                        style={{ color: selectedHero.color, borderColor: selectedHero.color }}
                      >
                        {selectedHero.nftBadge}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  className="flex-1"
                  style={{ backgroundColor: selectedHero.color }}
                >
                  Join {selectedHero.name} Mission
                </Button>
                <Button variant="outline" className="flex-1 border-white/20 text-white hover:bg-white/10">
                  View NFT Collection
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
