import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useHeroes } from "@/lib/stores/useHeroes";
import { gameHeroes } from "@/data/gameHeroes";
import { useContribution } from "@/lib/stores/useContribution";
import TokenBadge, { TokenSymbol } from "./TokenBadge";
import { 
  Sparkles, 
  Shield, 
  Users, 
  Trophy, 
  CreditCard,
  Zap, 
  Leaf, 
  Droplets,
  Battery,
  TrendingUp,
  Crown,
  Star
} from "lucide-react";

const heroIcons = {
  "aqua_wtr": Droplets,
  "hemp_builder": Leaf, 
  "voltra_gpwr": Zap,
  "graphene_batt": Battery,
  "trader_gcct": TrendingUp
};

const getValidTokenSymbol = (heroSymbol: string): TokenSymbol => {
  if (['WTR', 'HEMP', 'GPWR', 'BATT', 'GCCT'].includes(heroSymbol)) {
    return heroSymbol as TokenSymbol;
  }
  return "GCCT"; // fallback
};

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState("heroes");
  const { currentRank, impactMetrics } = useContribution();

  const rankTiers = [
    { 
      name: "Bronze Recruit", 
      color: "#cd7f32", 
      contribution: "175+",
      icon: Shield,
      benefits: ["Basic eco-warrior access", "Hemp Badge NFT", "Community forums"]
    },
    { 
      name: "Silver Defender", 
      color: "#c0c0c0", 
      contribution: "500+",
      icon: Users,
      benefits: ["Tradable Dynamic NFTs", "Hemp wellness discounts", "Summit invites"]
    },
    { 
      name: "Gold Guardian", 
      color: "#ffd700", 
      contribution: "1,000+",
      icon: Trophy,
      benefits: ["Ecosystem rewards amplified", "Impact reports", "VIP support"]
    },
    { 
      name: "Platinum Champion", 
      color: "#e5e4e2", 
      contribution: "5,000+",
      icon: Crown,
      benefits: ["BLACK CARD access", "Ambassador NFTs", "Partner briefings"]
    },
    { 
      name: "Diamond Legend", 
      color: "#b9f2ff", 
      contribution: "10,000+",
      icon: Star,
      benefits: ["DAO voting rights", "Leadership calls", "Ultimate BLACK CARD"]
    }
  ];

  const blackCardFeatures = [
    { icon: CreditCard, text: "$500,000 spending power limit" },
    { icon: Trophy, text: "Bitcoin cashback on all purchases" },
    { icon: Users, text: "VIP Concierge services 24/7" },
    { icon: Shield, text: "Self-custody security protocol" },
    { icon: Sparkles, text: "Global premium event access" },
    { icon: TrendingUp, text: "Patent licensing profit sharing" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-blue-900">
      {/* Hero Section */}
      <motion.section 
        className="relative px-4 py-16 sm:py-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="max-w-6xl mx-auto text-center">
          <motion.h1 
            className="text-4xl sm:text-6xl font-bold text-white mb-6"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Welcome to the{" "}
            <span className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              ReFi League
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Meet the 5 Eco-Warrior Superheroes revolutionizing regenerative finance through 
            patent-powered gaming. Each hero represents breakthrough environmental technologies 
            that generate real-world impact and economic returns.
          </motion.p>

          <motion.div 
            className="flex flex-wrap justify-center gap-4 mb-12"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Badge className="bg-green-600/20 text-green-400 border-green-500/30 text-sm px-4 py-2">
              <Shield className="h-4 w-4 mr-2" />
              5 Heroes
            </Badge>
            <Badge className="bg-blue-600/20 text-blue-400 border-blue-500/30 text-sm px-4 py-2">
              <Users className="h-4 w-4 mr-2" />
              5 Ranks
            </Badge>
            <Badge className="bg-purple-600/20 text-purple-400 border-purple-500/30 text-sm px-4 py-2">
              <Sparkles className="h-4 w-4 mr-2" />
              Dynamic NFTs
            </Badge>
            <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-500/30 text-sm px-4 py-2">
              <Trophy className="h-4 w-4 mr-2" />
              Real Impact
            </Badge>
          </motion.div>
        </div>
      </motion.section>

      {/* Main Content Tabs */}
      <motion.section 
        className="px-4 pb-16"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <div className="max-w-7xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto mb-8 bg-black/50">
              <TabsTrigger value="heroes">Heroes</TabsTrigger>
              <TabsTrigger value="ranks">Ranks</TabsTrigger>
              <TabsTrigger value="blackcard">BLACK CARD</TabsTrigger>
            </TabsList>

            {/* Heroes Tab */}
            <TabsContent value="heroes" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-4">
                  5 Eco-Warrior Superheroes
                </h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                  Each hero represents breakthrough environmental technologies with real patent backing, 
                  generating both environmental impact and economic returns.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gameHeroes.map((hero, index) => {
                  const IconComponent = heroIcons[hero.id as keyof typeof heroIcons] || Zap;
                  
                  return (
                    <motion.div
                      key={hero.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="h-full bg-black/60 backdrop-blur-sm border-gray-700 hover:border-gray-500 transition-colors group">
                        <CardHeader className="pb-4">
                          <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-full bg-gradient-to-r from-gray-800 to-gray-700">
                              <IconComponent className="h-6 w-6" style={{ color: hero.color }} />
                            </div>
                            <Badge 
                              className="text-xs"
                              style={{ 
                                backgroundColor: hero.color + '20',
                                color: hero.color,
                                borderColor: hero.color + '40'
                              }}
                            >
                              {hero.rarity}
                            </Badge>
                          </div>
                          <CardTitle className="text-white text-lg mb-2">
                            {hero.name}
                          </CardTitle>
                          <p className="text-sm" style={{ color: hero.color }}>
                            {hero.title}
                          </p>
                        </CardHeader>

                        <CardContent className="space-y-4">
                          {/* NFT Badge Display */}
                          <div className="flex justify-center">
                            <TokenBadge
                              tokenSymbol={getValidTokenSymbol(hero.symbol)}
                              attributes={{
                                power: hero.stats.power,
                                impact: hero.stats.health,
                                rarity: hero.stats.speed
                              }}
                              rarity={hero.rarity as 'Common' | 'Rare' | 'Legendary'}
                              level={hero.level}
                              size="md"
                              animated={true}
                            />
                          </div>

                          <p className="text-gray-400 text-sm leading-relaxed">
                            {hero.description}
                          </p>

                          <div className="space-y-2">
                            <h4 className="text-white font-semibold text-sm">Key Abilities:</h4>
                            {hero.abilities.slice(0, 2).map((ability, abilityIndex) => (
                              <div key={abilityIndex} className="text-xs text-gray-400">
                                <span className="text-white font-medium">{ability.name}:</span> {ability.description}
                              </div>
                            ))}
                          </div>

                          <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                            <span className="text-xs text-gray-500">Level {hero.level}</span>
                            <span className="text-xs" style={{ color: hero.color }}>
                              {hero.element}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>

            {/* Ranks Tab */}
            <TabsContent value="ranks" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-4">
                  Hero Rank Progression
                </h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                  Rise through the ranks by making real environmental impact. Each rank unlocks 
                  new benefits, higher rewards, and exclusive access to advanced features.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rankTiers.map((rank, index) => {
                  const IconComponent = rank.icon;
                  const isCurrentRank = rank.name === currentRank.name;
                  
                  return (
                    <motion.div
                      key={rank.name}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className={`h-full transition-all duration-300 ${
                        isCurrentRank 
                          ? 'bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border-yellow-500/50 ring-2 ring-yellow-500/20' 
                          : 'bg-black/60 backdrop-blur-sm border-gray-700 hover:border-gray-500'
                      }`}>
                        <CardHeader>
                          <div className="flex items-center justify-between mb-4">
                            <div 
                              className="p-3 rounded-full"
                              style={{ 
                                backgroundColor: rank.color + '20',
                                border: `2px solid ${rank.color}40`
                              }}
                            >
                              <IconComponent className="h-6 w-6" style={{ color: rank.color }} />
                            </div>
                            {isCurrentRank && (
                              <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-500/30">
                                Current
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-white text-lg">
                            {rank.name}
                          </CardTitle>
                          <p className="text-gray-400 text-sm">
                            ${rank.contribution} contribution required
                          </p>
                        </CardHeader>

                        <CardContent>
                          <div className="space-y-3">
                            <h4 className="text-white font-semibold text-sm">Benefits:</h4>
                            {rank.benefits.map((benefit, benefitIndex) => (
                              <div 
                                key={benefitIndex}
                                className="flex items-center gap-2 text-xs text-gray-400"
                              >
                                <div 
                                  className="w-2 h-2 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: rank.color }}
                                />
                                {benefit}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>

            {/* BLACK CARD Tab */}
            <TabsContent value="blackcard" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-4">
                  GXCOIN Platinum Crypto BLACK CARD
                </h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                  The ultimate financial tool for eco-warriors. Patent-powered rewards, 
                  massive spending power, and exclusive benefits that grow with your environmental impact.
                </p>
              </div>

              <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Card Preview */}
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Card className="bg-gradient-to-br from-gray-900 via-black to-gray-800 border-yellow-500/50 overflow-hidden">
                      <CardContent className="p-8 text-center">
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-transparent to-purple-500/10" />
                        
                        <div className="relative z-10">
                          <CreditCard className="h-16 w-16 text-yellow-400 mx-auto mb-6" />
                          <h3 className="text-2xl font-bold text-white mb-4">
                            GXCOIN BLACK CARD
                          </h3>
                          <p className="text-gray-400 mb-6">
                            Patent-powered crypto BLACK CARD
                          </p>
                          
                          <div className="space-y-4">
                            <div className="p-4 bg-yellow-500/10 rounded-lg">
                              <div className="text-3xl font-bold text-yellow-400">$500,000</div>
                              <div className="text-sm text-gray-400">Spending Power</div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-center">
                              <div>
                                <div className="text-lg font-bold text-white">Bitcoin</div>
                                <div className="text-xs text-gray-400">Cashback</div>
                              </div>
                              <div>
                                <div className="text-lg font-bold text-white">24/7</div>
                                <div className="text-xs text-gray-400">Concierge</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Features List */}
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-4"
                  >
                    <h3 className="text-xl font-bold text-white mb-4">Premium Features</h3>
                    {blackCardFeatures.map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="flex items-center gap-4 p-4 bg-black/40 rounded-lg"
                      >
                        <div className="p-2 bg-yellow-500/20 rounded-lg">
                          <feature.icon className="h-5 w-5 text-yellow-400" />
                        </div>
                        <span className="text-white">{feature.text}</span>
                      </motion.div>
                    ))}
                    
                    <div className="mt-6 p-4 bg-gradient-to-r from-green-900/30 to-blue-900/30 rounded-lg border border-green-500/30">
                      <h4 className="text-green-400 font-semibold mb-2">Patent Integration</h4>
                      <p className="text-sm text-gray-400">
                        Earn from patent licensing profits and receive multiplied rewards 
                        for every eco-action taken through the platform.
                      </p>
                    </div>
                  </motion.div>
                </div>

                <motion.div 
                  className="text-center mt-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <Button className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white px-8 py-4 text-lg min-h-[48px] touch-manipulation">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Apply for BLACK CARD
                  </Button>
                  <p className="text-sm text-gray-400 mt-3">
                    Available for Platinum+ ranks • Patent-powered rewards included
                  </p>
                </motion.div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </motion.section>
    </div>
  );
}