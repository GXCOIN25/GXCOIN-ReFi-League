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
  "trader_gcct": TrendingUp,
  "gxcoin_anchor": Crown
};

const getValidTokenSymbol = (heroSymbol: string): TokenSymbol => {
  if (['WTR', 'HEMP', 'GPWR', 'BATT', 'GCCT', 'GXCOIN'].includes(heroSymbol)) {
    return heroSymbol as TokenSymbol;
  }
  return "GXCOIN"; // fallback to anchor
};

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState("heroes");
  const { currentRank, impactMetrics, anchorPower, gxcoinStake, getAnchorMultiplier } = useContribution();

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-blue-900 p-4 md:p-0">
      {/* Hero Section */}
      <motion.section 
        className="relative px-2 py-8 sm:px-4 sm:py-16 md:py-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="max-w-6xl mx-auto text-center">
          <motion.h1 
            className="text-2xl sm:text-4xl md:text-6xl font-bold text-white mb-4 sm:mb-6 px-2"
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
            className="text-sm sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto px-2"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            GXCOIN Anchor dNFT powers the entire ReFi League ecosystem. The central hub 
            that unlocks and amplifies 5 patent-backed Eco-Warrior Superheroes, democratizing 
            access to breakthrough environmental technologies with real economic returns.
          </motion.p>

          <motion.div 
            className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8 sm:mb-12 px-2"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Badge className="bg-green-600/20 text-green-400 border-green-500/30 text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2">
              <Crown className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              GXCOIN Anchor
            </Badge>
            <Badge className="bg-blue-600/20 text-blue-400 border-blue-500/30 text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2">
              <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              5 Ranks
            </Badge>
            <Badge className="bg-purple-600/20 text-purple-400 border-purple-500/30 text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2">
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Dynamic NFTs
            </Badge>
            <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-500/30 text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2">
              <Trophy className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Real Impact
            </Badge>
          </motion.div>
        </div>
      </motion.section>

      {/* GXCOIN Anchor Centerpiece */}
      <motion.section 
        className="px-2 sm:px-4 pb-8 sm:pb-12"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.0 }}
      >
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-green-900/40 via-emerald-900/30 to-green-800/40 backdrop-blur-sm border-green-500/30 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 via-transparent to-emerald-500/10" />
            
            <CardContent className="p-4 sm:p-6 md:p-8 relative z-10">
              <div className="text-center mb-6 sm:mb-8">
                <div className="flex justify-center mb-3 sm:mb-4">
                  <div className="p-3 sm:p-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                    <Crown className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-white" />
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">
                  GXCOIN Anchor dNFT
                </h3>
                <p className="text-green-300 text-sm sm:text-base md:text-lg font-medium mb-2">
                  The Central Hub Powering All Heroes
                </p>
                <p className="text-gray-400 text-xs sm:text-sm md:text-base max-w-xl mx-auto px-2">
                  Your gateway to the entire ReFi League ecosystem. Stake GXCOIN to unlock and amplify all Eco-Warrior abilities.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="text-center p-3 sm:p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-400 mb-1">{anchorPower}</div>
                  <div className="text-xs sm:text-sm text-gray-400">Anchor Power</div>
                  <div className="text-xs text-green-300 mt-1">{getAnchorMultiplier().toFixed(2)}x multiplier</div>
                </div>
                <div className="text-center p-3 sm:p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-emerald-400 mb-1">5</div>
                  <div className="text-xs sm:text-sm text-gray-400">Heroes Powered</div>
                  <div className="text-xs text-emerald-300 mt-1">AQUA, HEMP, VOLTRA, GRAPHENE, CARBON</div>
                </div>
                <div className="text-center p-3 sm:p-4 bg-green-600/10 rounded-lg border border-green-600/20">
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-300 mb-1">${gxcoinStake}</div>
                  <div className="text-xs sm:text-sm text-gray-400">Your GXCOIN Stake</div>
                  <div className="text-xs text-green-300 mt-1">Next threshold: ${Math.ceil((anchorPower + 1) * 1000)}</div>
                </div>
              </div>

              <div className="flex justify-center">
                <Button 
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-sm sm:text-base md:text-lg"
                >
                  <Zap className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                  Power Your Heroes
                </Button>
              </div>
            </CardContent>
          </Card>
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
                  <span className="bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 bg-clip-text text-transparent">
                    GXCOIN Anchor
                  </span>{" "}
                  Powers the ReFi League
                </h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                  The central anchor dNFT that unlocks and amplifies all 5 Eco-Warrior Superheroes. 
                  GXCOIN democratizes access to 18+ patented environmental technologies while generating real impact and economic returns.
                </p>
              </div>

              {/* Epic Heroes Showcase */}
              <motion.div 
                className="mb-8 sm:mb-12 px-2"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="w-full max-w-5xl mx-auto aspect-[5/2] sm:aspect-[16/9] lg:aspect-[5/2]">
                  <img 
                    src="/images/gxcoin-hero-promo.jpg" 
                    alt="GXCOIN Eco-Warrior Limited Edition dNFTs - WTR, GPWR, BATT, HEMP, GCCT Platinum Series featuring all five superhero warriors" 
                    className="w-full h-full object-contain rounded-lg sm:rounded-2xl shadow-xl sm:shadow-2xl border border-green-500/20"
                    loading="lazy"
                    width="1200"
                    height="480"
                  />
                </div>
              </motion.div>

              {/* GXCOIN Anchor Hero - Full Width Featured */}
              {(() => {
                const anchorHero = gameHeroes.find(hero => hero.isAnchor || hero.symbol === 'GXCOIN');
                if (!anchorHero) return null;
                
                const IconComponent = heroIcons[anchorHero.id as keyof typeof heroIcons] || Crown;
                
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8"
                  >
                    <Card className="bg-gradient-to-br from-green-900/60 via-emerald-900/40 to-green-800/60 backdrop-blur-sm border-green-500/50 hover:border-green-400/70 transition-colors">
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-green-600/20 text-green-300 border-green-500/40 font-bold">
                          <Crown className="h-3 w-3 mr-1" />
                          ANCHOR dNFT
                        </Badge>
                      </div>
                      
                      <CardContent className="p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                          {/* Left: Hero Info */}
                          <div className="space-y-4">
                            <div className="flex items-center gap-4 mb-4">
                              <div className="p-4 rounded-full bg-gradient-to-r from-green-600 to-emerald-600">
                                <IconComponent className="h-8 w-8 text-white" />
                              </div>
                              <div>
                                <h3 className="text-2xl font-bold text-white mb-1">
                                  {anchorHero.name}
                                </h3>
                                <p className="text-green-300 font-medium">
                                  {anchorHero.title}
                                </p>
                                {anchorHero.subtitle && (
                                  <p className="text-green-400 text-sm font-medium">
                                    {anchorHero.subtitle}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            <p className="text-gray-300 leading-relaxed">
                              {anchorHero.description}
                            </p>
                            
                            <div className="flex gap-4 text-center">
                              <div className="bg-green-500/20 px-4 py-2 rounded-lg">
                                <div className="text-green-300 font-bold">Level {anchorHero.level}</div>
                                <div className="text-xs text-gray-400">Anchor Level</div>
                              </div>
                              <div className="bg-emerald-500/20 px-4 py-2 rounded-lg">
                                <div className="text-emerald-300 font-bold">{anchorHero.rarity}</div>
                                <div className="text-xs text-gray-400">Rarity</div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Right: NFT Badge */}
                          <div className="flex justify-center">
                            <TokenBadge
                              tokenSymbol="GXCOIN"
                              attributes={{
                                power: anchorHero.stats.power,
                                impact: anchorHero.stats.health,
                                rarity: anchorHero.stats.speed
                              }}
                              rarity={anchorHero.rarity as 'Common' | 'Rare' | 'Legendary'}
                              level={anchorHero.level}
                              size="lg"
                              animated={true}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })()}

              {/* Powered Heroes Grid */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-2 text-center">
                  Heroes Powered by GXCOIN Anchor
                </h3>
                <p className="text-gray-400 text-center text-sm mb-6">
                  Unlock and amplify these environmental warriors through your GXCOIN stake
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {gameHeroes.filter(hero => !hero.isAnchor && hero.symbol !== 'GXCOIN').map((hero, index) => {
                  const IconComponent = heroIcons[hero.id as keyof typeof heroIcons] || Zap;
                  
                  return (
                    <motion.div
                      key={hero.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (index + 1) * 0.1 }}
                    >
                      <Card className="h-full bg-black/60 backdrop-blur-sm border-gray-700 hover:border-gray-500 transition-colors group relative">
                        {/* Powered by GXCOIN Ribbon */}
                        <div className="absolute top-3 left-3 z-10">
                          <Badge className="bg-green-600/20 text-green-400 border-green-500/40 text-xs">
                            <Crown className="h-2 w-2 mr-1" />
                            Powered by GXCOIN
                          </Badge>
                        </div>
                        
                        <CardHeader className="pb-4 pt-12">
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
                          {hero.subtitle && (
                            <p className="text-green-400 text-xs font-medium">
                              {hero.subtitle}
                            </p>
                          )}
                        </CardHeader>

                        <CardContent className="space-y-4">
                          {/* NFT Badge Display */}
                          <div className="flex justify-center">
                            <TokenBadge
                              tokenSymbol={(() => {
                                const symbol = getValidTokenSymbol(hero.symbol);
                                console.log(`🎭 LandingPage rendering ${hero.name} with symbol: ${symbol}`);
                                return symbol;
                              })()}
                              attributes={{
                                power: hero.stats.power,
                                impact: hero.stats.health,
                                rarity: hero.stats.speed
                              }}
                              rarity={hero.rarity as 'Common' | 'Rare' | 'Legendary'}
                              level={hero.level}
                              size="sm"
                              animated={true}
                            />
                          </div>

                          <p className="text-gray-400 text-sm leading-relaxed">
                            {hero.description.length > 120 ? hero.description.substring(0, 120) + '...' : hero.description}
                          </p>

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
                          {/* GXCOIN Visa Card Image */}
                          <div className="mb-6">
                            <img 
                              src="/gxcoin-visa-card.jpg" 
                              alt="GXCOIN Visa BLACK CARD - Premium crypto card with patent-powered rewards" 
                              className="w-full max-w-xs mx-auto rounded-xl shadow-2xl border border-yellow-500/30 hover:border-yellow-400/50 transition-all duration-300"
                              loading="lazy"
                              onError={(e) => {
                                console.warn('Failed to load GXCOIN Visa card image');
                                // Fallback to CreditCard icon if image fails to load
                                const target = e.currentTarget as HTMLImageElement;
                                target.style.display = 'none';
                                const fallback = target.nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = 'block';
                              }}
                            />
                            {/* Fallback CreditCard icon (hidden by default) */}
                            <CreditCard className="h-16 w-16 text-yellow-400 mx-auto" style={{ display: 'none' }} />
                          </div>
                          
                          <h3 className="text-2xl font-bold text-white mb-4">
                            GXCOIN VISA BLACK CARD
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

                {/* Premium Visa Card Program Information */}
                <motion.div 
                  className="mt-8 mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-white mb-4">
                      Premium Visa Card Program
                    </h3>
                    <div className="max-w-md mx-auto">
                      <img 
                        src="/gxcoin-visa-program.jpg" 
                        alt="GXCOIN Premium Visa Card Program - Exclusive benefits and rewards for eco-warriors" 
                        className="w-full rounded-lg shadow-xl border border-yellow-500/20 hover:border-yellow-400/40 transition-all duration-300"
                        loading="lazy"
                        onError={(e) => {
                          console.warn('Failed to load GXCOIN Visa program image');
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                </motion.div>

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

      {/* Hero Collection Promotional Section */}
      <motion.section 
        className="px-4 py-16 bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-green-900/20"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
      >
        <div className="max-w-6xl mx-auto">
          <Card className="bg-gradient-to-br from-purple-900/40 via-blue-900/30 to-green-900/40 backdrop-blur-sm border-purple-500/30 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 via-blue-500/10 to-green-500/10" />
            
            <CardContent className="p-8 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                {/* Left: Hero Collection Image */}
                <div className="flex justify-center">
                  <motion.div
                    className="relative rounded-lg overflow-hidden shadow-2xl"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <img 
                      src="/hero-collection-promo.jpg" 
                      alt="GXCOIN ECO-WARRIOR LIMITED EDITION dNFTs" 
                      className="w-full h-auto max-w-md object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  </motion.div>
                </div>

                {/* Right: Content */}
                <div className="space-y-6">
                  <div className="text-center lg:text-left">
                    <motion.h2 
                      className="text-3xl lg:text-4xl font-bold text-white mb-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.4 }}
                    >
                      <span className="bg-gradient-to-r from-purple-400 via-blue-500 to-green-400 bg-clip-text text-transparent">
                        GXCOIN ECO-WARRIOR
                      </span>
                      <br />
                      LIMITED EDITION dNFT's
                    </motion.h2>
                    
                    <motion.p 
                      className="text-gray-300 text-lg mb-6 leading-relaxed"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.6 }}
                    >
                      Unleash the power of all 5 revolutionary patent-backed superheroes: 
                      <span className="text-blue-400 font-semibold"> $WTR</span>,
                      <span className="text-yellow-400 font-semibold"> $GPWR</span>,
                      <span className="text-green-400 font-semibold"> $BATT</span>,
                      <span className="text-purple-400 font-semibold"> $HEMP</span>, and
                      <span className="text-orange-400 font-semibold"> $GCCT</span> 
                      in dynamic NFT superhero form.
                    </motion.p>

                    <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-8">
                      <Badge className="bg-blue-600/20 text-blue-400 border-blue-500/30 px-3 py-1">
                        <Droplets className="h-3 w-3 mr-1" />
                        AQUA $WTR
                      </Badge>
                      <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-500/30 px-3 py-1">
                        <Zap className="h-3 w-3 mr-1" />
                        VOLTRA $GPWR
                      </Badge>
                      <Badge className="bg-green-600/20 text-green-400 border-green-500/30 px-3 py-1">
                        <Battery className="h-3 w-3 mr-1" />
                        GRAPHENE $BATT
                      </Badge>
                      <Badge className="bg-purple-600/20 text-purple-400 border-purple-500/30 px-3 py-1">
                        <Leaf className="h-3 w-3 mr-1" />
                        HEMP $HEMP
                      </Badge>
                      <Badge className="bg-orange-600/20 text-orange-400 border-orange-500/30 px-3 py-1">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        CARBON $GCCT
                      </Badge>
                    </div>
                  </div>

                  <motion.div 
                    className="flex justify-center lg:justify-start"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.8 }}
                  >
                    <Button 
                      size="lg"
                      className="bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 hover:from-purple-700 hover:via-blue-700 hover:to-green-700 text-white font-bold px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Sparkles className="h-5 w-5 mr-2" />
                      JOIN THE REFI LEAGUE TODAY!
                    </Button>
                  </motion.div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.section>

      {/* Enhanced Premium Visa Card Program Header */}
      <motion.section 
        className="px-4 py-16 bg-gradient-to-r from-slate-900/30 via-gray-900/30 to-slate-900/30"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4 }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6 }}
          >
            <div className="mb-8">
              <h2 className="sr-only">Premium Visa Card Program</h2>
              <img 
                src="/visa-program-header.jpg" 
                alt="Premium Visa Card Program - Experience the future of environmental finance" 
                className="w-full max-w-4xl mx-auto rounded-2xl shadow-2xl"
                loading="lazy"
              />
            </div>
          </motion.div>

          {/* Choose Your Card Type Section */}
          <motion.div 
            className="mb-16"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8 }}
          >
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-white mb-4">
                <span className="bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 bg-clip-text text-transparent">
                  Choose Your Card Type
                </span>
              </h3>
              <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                Select between Debit and Credit options with flexible funding that suits your financial needs
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {/* Debit Card Features */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 2.0 }}
              >
                <Card className="h-full bg-gradient-to-br from-green-900/40 via-emerald-900/30 to-green-800/40 backdrop-blur-sm border-green-500/30 hover:border-green-400/60 transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="mb-6">
                      <img 
                        src="/debit-card-features.jpg" 
                        alt="Debit Card Features" 
                        className="w-full rounded-lg shadow-lg"
                      />
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-green-500/20">
                          <CreditCard className="h-6 w-6 text-green-400" />
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-green-300">Debit Card</h4>
                          <p className="text-sm text-gray-400">Spend only what you load</p>
                        </div>
                      </div>
                      <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
                        <div className="space-y-2 text-sm text-gray-300">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <span>Load values: $500 - $500,000 USD</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <span>Real-time transaction processing</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <span>Direct crypto rewards deposit</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <span>Perfect for budgeting & control</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Credit Card Features */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 2.2 }}
              >
                <Card className="h-full bg-gradient-to-br from-blue-900/40 via-indigo-900/30 to-blue-800/40 backdrop-blur-sm border-blue-500/30 hover:border-blue-400/60 transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="mb-6">
                      <img 
                        src="/credit-card-features.jpg" 
                        alt="Credit Card Features" 
                        className="w-full rounded-lg shadow-lg"
                      />
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-blue-500/20">
                          <Sparkles className="h-6 w-6 text-blue-400" />
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-blue-300">Credit Card</h4>
                          <p className="text-sm text-gray-400">Build credit & earn rewards</p>
                        </div>
                      </div>
                      <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
                        <div className="space-y-2 text-sm text-gray-300">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            <span>Credit limits: $5,000 - $500,000 USD</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            <span>1:10 reserve ratio funding model</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            <span>Build credit history & rewards</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            <span>Premium travel & purchase protections</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>

          {/* Choose Your Tier Section */}
          <motion.div 
            className="mb-16"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.4 }}
          >
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-white mb-4">
                <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                  Choose Your Tier
                </span>
              </h3>
              <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                Select the premium tier that matches your environmental impact and financial goals
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 2.6 }}
              >
                <Card className="bg-gradient-to-br from-slate-900/60 via-gray-900/40 to-slate-800/60 backdrop-blur-sm border-purple-500/30 hover:border-purple-400/60 transition-all duration-300 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 via-transparent to-pink-500/10" />
                  
                  <CardContent className="p-8 relative z-10">
                    <div className="text-center mb-8">
                      <img 
                        src="/platinum-card-tier.jpg" 
                        alt="GXCOIN Platinum Card Tier" 
                        className="w-full max-w-lg mx-auto rounded-xl shadow-2xl"
                      />
                    </div>
                    
                    <div className="text-center">
                      <h4 className="text-2xl font-bold text-white mb-4">
                        Premium GXCOIN Platinum Card
                      </h4>
                      <p className="text-purple-300 text-lg font-medium mb-4">
                        Experience the future of environmental finance
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-purple-500/20 p-4 rounded-lg border border-purple-500/30">
                          <div className="text-purple-300 font-bold text-lg mb-1">Premium</div>
                          <div className="text-sm text-gray-400">Member Status</div>
                        </div>
                        <div className="bg-blue-500/20 p-4 rounded-lg border border-blue-500/30">
                          <div className="text-blue-300 font-bold text-lg mb-1">Global</div>
                          <div className="text-sm text-gray-400">Visa Acceptance</div>
                        </div>
                        <div className="bg-green-500/20 p-4 rounded-lg border border-green-500/30">
                          <div className="text-green-300 font-bold text-lg mb-1">Eco-Impact</div>
                          <div className="text-sm text-gray-400">Rewards Program</div>
                        </div>
                      </div>
                      <Button 
                        size="lg"
                        className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 hover:from-purple-700 hover:via-pink-700 hover:to-purple-800 text-white font-bold px-8 py-3 text-lg"
                      >
                        <Crown className="h-5 w-5 mr-2" />
                        Apply for Premium Tier
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>

          {/* Existing Tier Cards Header */}
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.8 }}
          >
            <h3 className="text-3xl font-bold text-white mb-4">
              <span className="bg-gradient-to-r from-gray-400 via-white to-gray-400 bg-clip-text text-transparent">
                All Available Tiers
              </span>
            </h3>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto">
              Choose from our complete range of premium card tiers, each offering unique benefits and rewards
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {/* Bronze Spark Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8 }}
            >
              <Card className="h-full bg-gradient-to-br from-orange-900/40 to-amber-900/40 backdrop-blur-sm border-orange-500/30 hover:border-orange-400/60 transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="mb-4">
                      <img 
                        src="/bronze-spark.jpg" 
                        alt="Bronze Spark Card" 
                        className="w-full h-32 object-cover rounded-lg shadow-lg group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <h3 className="text-xl font-bold text-orange-300 mb-2">Bronze Spark</h3>
                    <p className="text-2xl font-bold text-white mb-4">$175/year</p>
                    <div className="space-y-2 text-sm text-gray-300">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full" />
                        Basic eco-rewards
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full" />
                        1% cashback
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full" />
                        Community access
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Silver Spark Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.0 }}
            >
              <Card className="h-full bg-gradient-to-br from-gray-800/40 to-slate-800/40 backdrop-blur-sm border-gray-500/30 hover:border-gray-400/60 transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="mb-4">
                      <img 
                        src="/silver-spark.jpg" 
                        alt="Silver Spark Card" 
                        className="w-full h-32 object-cover rounded-lg shadow-lg group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <h3 className="text-xl font-bold text-gray-300 mb-2">Silver Spark</h3>
                    <p className="text-2xl font-bold text-white mb-4">$500/year</p>
                    <div className="space-y-2 text-sm text-gray-300">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-500 rounded-full" />
                        Enhanced rewards
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-500 rounded-full" />
                        2% cashback
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-500 rounded-full" />
                        Priority support
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Gold Spark Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.2 }}
            >
              <Card className="h-full bg-gradient-to-br from-yellow-900/40 to-amber-900/40 backdrop-blur-sm border-yellow-500/30 hover:border-yellow-400/60 transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="mb-4">
                      <img 
                        src="/gold-spark.jpg" 
                        alt="Gold Spark Card" 
                        className="w-full h-32 object-cover rounded-lg shadow-lg group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <h3 className="text-xl font-bold text-yellow-300 mb-2">Gold Spark</h3>
                    <p className="text-2xl font-bold text-white mb-4">$1,000/year</p>
                    <div className="space-y-2 text-sm text-gray-300">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                        Premium rewards
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                        3% cashback
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                        VIP events access
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Platinum Ambassador Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.4 }}
            >
              <Card className="h-full bg-gradient-to-br from-purple-900/40 to-indigo-900/40 backdrop-blur-sm border-purple-500/30 hover:border-purple-400/60 transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="mb-4">
                      <img 
                        src="/platinum-ambassador.jpg" 
                        alt="Platinum Ambassador Card" 
                        className="w-full h-32 object-cover rounded-lg shadow-lg group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <h3 className="text-xl font-bold text-purple-300 mb-2">Platinum Ambassador</h3>
                    <p className="text-2xl font-bold text-white mb-4">$5,000/year</p>
                    <div className="space-y-2 text-sm text-gray-300">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full" />
                        Elite benefits
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full" />
                        5% cashback
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full" />
                        Concierge service
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Diamond Elite Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.6 }}
            >
              <Card className="h-full bg-gradient-to-br from-blue-900/40 to-cyan-900/40 backdrop-blur-sm border-blue-500/30 hover:border-blue-400/60 transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="mb-4">
                      <img 
                        src="/diamond-elite.jpg" 
                        alt="Diamond Elite Card" 
                        className="w-full h-32 object-cover rounded-lg shadow-lg group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <h3 className="text-xl font-bold text-blue-300 mb-2">Diamond Elite</h3>
                    <p className="text-2xl font-bold text-white mb-4">$10,000/year</p>
                    <div className="space-y-2 text-sm text-gray-300">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        Ultimate rewards
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        10% cashback
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        DAO voting rights
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.8 }}
          >
            <Button 
              size="lg"
              className="bg-gradient-to-r from-gray-600 to-slate-600 hover:from-gray-700 hover:to-slate-700 text-white font-bold px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <CreditCard className="h-5 w-5 mr-2" />
              Apply for Your Card Today
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* SEC-Compliant DeFi Section */}
      <motion.section 
        className="px-4 py-16 bg-gradient-to-r from-emerald-900/20 via-teal-900/20 to-green-900/20"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6 }}
      >
        <div className="max-w-6xl mx-auto">
          <Card className="bg-gradient-to-br from-emerald-900/40 via-teal-900/30 to-green-900/40 backdrop-blur-sm border-emerald-500/30 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 via-teal-500/10 to-green-500/10" />
            
            <CardContent className="p-8 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                {/* Left: Content */}
                <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.8 }}
                  >
                    <Badge className="bg-emerald-600/20 text-emerald-400 border-emerald-500/30 mb-4">
                      <Shield className="h-3 w-3 mr-1" />
                      SEC-COMPLIANT PLATFORM
                    </Badge>
                    
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                      <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-green-400 bg-clip-text text-transparent">
                        First SEC-compliant
                      </span>
                      <br />
                      RWA-backed DeFi platform
                      <br />
                      <span className="text-emerald-300 text-2xl">with Dynamic NFTs</span>
                    </h2>

                    <p className="text-gray-300 text-lg leading-relaxed mb-6">
                      Democratizing access to the <span className="text-emerald-400 font-bold">$1.45T+ sustainability markets</span> with 
                      revolutionary <span className="text-green-400 font-bold">$175+ entry points</span>. Real-world assets meet DeFi innovation 
                      in the first fully compliant platform designed for environmental impact.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="bg-emerald-500/10 p-4 rounded-lg border border-emerald-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="h-5 w-5 text-emerald-400" />
                          <span className="text-emerald-300 font-semibold">SEC Compliant</span>
                        </div>
                        <p className="text-gray-400 text-sm">Fully regulated DeFi platform meeting all compliance requirements</p>
                      </div>
                      
                      <div className="bg-teal-500/10 p-4 rounded-lg border border-teal-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-5 w-5 text-teal-400" />
                          <span className="text-teal-300 font-semibold">RWA-backed</span>
                        </div>
                        <p className="text-gray-400 text-sm">Real-world environmental assets backing digital investments</p>
                      </div>
                      
                      <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="h-5 w-5 text-green-400" />
                          <span className="text-green-300 font-semibold">Dynamic NFTs</span>
                        </div>
                        <p className="text-gray-400 text-sm">Living NFTs that evolve with real environmental impact</p>
                      </div>
                      
                      <div className="bg-cyan-500/10 p-4 rounded-lg border border-cyan-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="h-5 w-5 text-cyan-400" />
                          <span className="text-cyan-300 font-semibold">$175 Entry</span>
                        </div>
                        <p className="text-gray-400 text-sm">Accessible entry points to trillion-dollar markets</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div 
                    className="flex gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.0 }}
                  >
                    <Button 
                      size="lg"
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Shield className="h-5 w-5 mr-2" />
                      Learn More
                    </Button>
                    <Button 
                      size="lg"
                      variant="outline"
                      className="border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/10 px-6 py-3"
                    >
                      <TrendingUp className="h-5 w-5 mr-2" />
                      View Markets
                    </Button>
                  </motion.div>
                </div>

                {/* Right: SEC Compliant Image */}
                <div className="flex justify-center">
                  <motion.div
                    className="relative rounded-lg overflow-hidden shadow-2xl"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 2.2 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <img 
                      src="/sec-compliant-defi.jpg" 
                      alt="SEC-Compliant RWA-backed DeFi Platform" 
                      className="w-full h-auto max-w-md object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/50 via-transparent to-transparent" />
                    
                    {/* Overlay Stats */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-black/60 backdrop-blur-sm rounded-lg p-4 border border-emerald-500/30">
                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div>
                            <div className="text-2xl font-bold text-emerald-400">$1.45T+</div>
                            <div className="text-xs text-gray-300">Market Access</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-green-400">$175+</div>
                            <div className="text-xs text-gray-300">Entry Point</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.section>

      {/* AQUA Water dNFT Hero Spotlight Section */}
      <motion.section 
        className="px-4 py-16 bg-gradient-to-r from-blue-900/20 via-cyan-900/20 to-teal-900/20"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8 }}
      >
        <div className="max-w-6xl mx-auto">
          <Card className="bg-gradient-to-br from-blue-900/40 via-cyan-900/30 to-teal-900/40 backdrop-blur-sm border-blue-500/30 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 via-cyan-500/10 to-teal-500/10" />
            
            <CardContent className="p-8 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                {/* Left: AQUA Water Image */}
                <div className="flex justify-center">
                  <motion.div
                    className="relative rounded-lg overflow-hidden shadow-2xl"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 2.0 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <img 
                      src="/aqua-water-spotlight.jpg" 
                      alt="AQUA Water dNFT Hero Spotlight" 
                      className="w-full h-auto max-w-md object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 via-transparent to-transparent" />
                    
                    {/* AQUA Badge Overlay */}
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-blue-600/80 text-blue-100 border-blue-400/60 px-3 py-1 backdrop-blur-sm">
                        <Droplets className="h-3 w-3 mr-1" />
                        AQUA $WTR
                      </Badge>
                    </div>
                  </motion.div>
                </div>

                {/* Right: Content */}
                <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 2.2 }}
                  >
                    <Badge className="bg-blue-600/20 text-blue-400 border-blue-500/30 mb-4">
                      <Droplets className="h-3 w-3 mr-1" />
                      HERO SPOTLIGHT
                    </Badge>
                    
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                      <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                        AQUA ($WTR)
                      </span>
                      <br />
                      Water dNFT Hero
                    </h2>

                    <p className="text-gray-300 text-lg leading-relaxed mb-6">
                      Harness the power of <span className="text-blue-400 font-bold">480 million year-old healing springs</span> 
                      producing <span className="text-cyan-400 font-bold">10MM gallons daily</span>. Revolutionary water technology 
                      meets ancient mineral wisdom in the world's most advanced hydration ecosystem.
                    </p>
                  </motion.div>

                  {/* Healing Waters Portfolio */}
                  <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.4 }}
                  >
                    <h3 className="text-xl font-bold text-blue-300 mb-3">
                      💧 Healing Waters Portfolio
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
                        <div className="text-blue-300 font-semibold text-sm">Ancient Springs</div>
                        <div className="text-gray-400 text-xs">480M year-old mineral sources</div>
                      </div>
                      <div className="bg-cyan-500/10 p-3 rounded-lg border border-cyan-500/20">
                        <div className="text-cyan-300 font-semibold text-sm">Daily Production</div>
                        <div className="text-gray-400 text-xs">10MM gallons sustainable flow</div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Product Innovation */}
                  <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.6 }}
                  >
                    <h3 className="text-xl font-bold text-cyan-300 mb-3">
                      🚀 Product Innovation
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-300">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-sm">Hemp-based biodegradable bottles</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        <span className="text-sm">Energy-infused structured water technology</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <div className="w-2 h-2 bg-cyan-500 rounded-full" />
                        <span className="text-sm">Smart hydration tracking integration</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Mineral Composition */}
                  <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.8 }}
                  >
                    <h3 className="text-xl font-bold text-teal-300 mb-3">
                      ⚗️ Mineral Composition
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-teal-500/10 p-3 rounded-lg border border-teal-500/20 text-center">
                        <div className="text-teal-300 font-bold text-lg">Lithium</div>
                        <div className="text-gray-400 text-xs">Cognitive enhancement</div>
                      </div>
                      <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20 text-center">
                        <div className="text-blue-300 font-bold text-lg">Zinc</div>
                        <div className="text-gray-400 text-xs">Immune system support</div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div 
                    className="flex gap-4 pt-4"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 3.0 }}
                  >
                    <Button 
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Droplets className="h-5 w-5 mr-2" />
                      Activate AQUA dNFT
                    </Button>
                    <Button 
                      size="lg"
                      variant="outline"
                      className="border-blue-500/50 text-blue-300 hover:bg-blue-500/10 px-6 py-3"
                    >
                      Learn More
                    </Button>
                  </motion.div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.section>

      {/* Patent Infrastructure Section */}
      <motion.section 
        className="px-4 py-16 bg-gradient-to-r from-gray-900/30 via-slate-900/30 to-zinc-900/30"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.0 }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.2 }}
          >
            <Badge className="bg-gray-600/20 text-gray-400 border-gray-500/30 mb-4">
              <Shield className="h-3 w-3 mr-1" />
              CORE PATENT INFRASTRUCTURE
            </Badge>
            <h2 className="text-4xl font-bold text-white mb-4">
              <span className="bg-gradient-to-r from-gray-400 via-white to-gray-400 bg-clip-text text-transparent">
                Revolutionary Patent Chain Technology
              </span>
            </h2>
            <p className="text-gray-300 text-lg max-w-4xl mx-auto">
              Our interconnected patent ecosystem creates the world's first comprehensive environmental technology platform, 
              where each innovation amplifies the next in a seamless sustainability chain.
            </p>
          </motion.div>

          <div className="relative">
            {/* Patent Chain Flow */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {/* Carbon Sequestration */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.4 }}
              >
                <Card className="h-full bg-gradient-to-br from-green-900/40 to-emerald-900/40 backdrop-blur-sm border-green-500/30 hover:border-green-400/60 transition-all duration-300 group">
                  <CardContent className="p-6 text-center">
                    <div className="mb-4">
                      <div className="p-4 rounded-full bg-green-600/20 mx-auto w-fit">
                        <Leaf className="h-8 w-8 text-green-400" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-green-300 mb-2">Carbon Sequestration</h3>
                    <p className="text-gray-400 text-sm">Revolutionary carbon capture and storage technologies</p>
                    <div className="mt-4 text-xs text-green-400 font-semibold">STEP 1</div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Arrow */}
              <div className="hidden lg:flex items-center justify-center">
                <div className="text-gray-500 text-2xl">→</div>
              </div>

              {/* Water Rights */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.6 }}
              >
                <Card className="h-full bg-gradient-to-br from-blue-900/40 to-cyan-900/40 backdrop-blur-sm border-blue-500/30 hover:border-blue-400/60 transition-all duration-300 group">
                  <CardContent className="p-6 text-center">
                    <div className="mb-4">
                      <div className="p-4 rounded-full bg-blue-600/20 mx-auto w-fit">
                        <Droplets className="h-8 w-8 text-blue-400" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-blue-300 mb-2">Water Rights</h3>
                    <p className="text-gray-400 text-sm">Ancient spring water sourcing and purification systems</p>
                    <div className="mt-4 text-xs text-blue-400 font-semibold">STEP 2</div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Arrow */}
              <div className="hidden lg:flex items-center justify-center">
                <div className="text-gray-500 text-2xl">→</div>
              </div>

              {/* Hemp Production */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.8 }}
              >
                <Card className="h-full bg-gradient-to-br from-purple-900/40 to-indigo-900/40 backdrop-blur-sm border-purple-500/30 hover:border-purple-400/60 transition-all duration-300 group">
                  <CardContent className="p-6 text-center">
                    <div className="mb-4">
                      <div className="p-4 rounded-full bg-purple-600/20 mx-auto w-fit">
                        <Leaf className="h-8 w-8 text-purple-400" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-purple-300 mb-2">Hemp Production</h3>
                    <p className="text-gray-400 text-sm">Sustainable hemp cultivation and processing innovations</p>
                    <div className="mt-4 text-xs text-purple-400 font-semibold">STEP 3</div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Arrow */}
              <div className="hidden lg:flex items-center justify-center">
                <div className="text-gray-500 text-2xl">→</div>
              </div>

              {/* Battery Storage */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 3.0 }}
              >
                <Card className="h-full bg-gradient-to-br from-yellow-900/40 to-orange-900/40 backdrop-blur-sm border-yellow-500/30 hover:border-yellow-400/60 transition-all duration-300 group">
                  <CardContent className="p-6 text-center">
                    <div className="mb-4">
                      <div className="p-4 rounded-full bg-yellow-600/20 mx-auto w-fit">
                        <Battery className="h-8 w-8 text-yellow-400" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-yellow-300 mb-2">Battery Storage</h3>
                    <p className="text-gray-400 text-sm">Advanced graphene battery technology and energy storage</p>
                    <div className="mt-4 text-xs text-yellow-400 font-semibold">STEP 4</div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Arrow */}
              <div className="hidden lg:flex items-center justify-center">
                <div className="text-gray-500 text-2xl">→</div>
              </div>

              {/* Wireless Power */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 3.2 }}
              >
                <Card className="h-full bg-gradient-to-br from-cyan-900/40 to-teal-900/40 backdrop-blur-sm border-cyan-500/30 hover:border-cyan-400/60 transition-all duration-300 group">
                  <CardContent className="p-6 text-center">
                    <div className="mb-4">
                      <div className="p-4 rounded-full bg-cyan-600/20 mx-auto w-fit">
                        <Zap className="h-8 w-8 text-cyan-400" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-cyan-300 mb-2">Wireless Power</h3>
                    <p className="text-gray-400 text-sm">Revolutionary wireless energy transmission technology</p>
                    <div className="mt-4 text-xs text-cyan-400 font-semibold">STEP 5</div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Launch Information Section */}
      <motion.section 
        className="px-4 py-16 bg-gradient-to-r from-violet-900/20 via-purple-900/20 to-fuchsia-900/20"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.2 }}
      >
        <div className="max-w-6xl mx-auto">
          <Card className="bg-gradient-to-br from-violet-900/40 via-purple-900/30 to-fuchsia-900/40 backdrop-blur-sm border-violet-500/30 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-400/10 via-purple-500/10 to-fuchsia-500/10" />
            
            <CardContent className="p-8 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                {/* Left: Launch Info Image */}
                <div className="flex justify-center">
                  <motion.div
                    className="relative rounded-lg overflow-hidden shadow-2xl"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 2.4 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <img 
                      src="/gxcoin-launch-info.jpg" 
                      alt="GXCOIN Launch Information" 
                      className="w-full h-auto max-w-md object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-violet-900/60 via-transparent to-transparent" />
                  </motion.div>
                </div>

                {/* Right: Content */}
                <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 2.6 }}
                  >
                    <Badge className="bg-violet-600/20 text-violet-400 border-violet-500/30 mb-4">
                      <Crown className="h-3 w-3 mr-1" />
                      OFFICIAL LAUNCH
                    </Badge>
                    
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                      <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                        GXCOIN Launch
                      </span>
                      <br />
                      <span className="text-violet-300 text-2xl">Q3 2025</span>
                    </h2>

                    <div className="space-y-4">
                      <div className="bg-violet-500/10 p-4 rounded-lg border border-violet-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Crown className="h-5 w-5 text-violet-400" />
                          <span className="text-violet-300 font-semibold">Official Website</span>
                        </div>
                        <p className="text-white text-lg font-bold">gxcoin.world</p>
                      </div>

                      <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="h-5 w-5 text-purple-400" />
                          <span className="text-purple-300 font-semibold">Technology Backing</span>
                        </div>
                        <p className="text-gray-300 text-lg">
                          <span className="text-purple-400 font-bold">$5-50B</span> in Technology, IP & Patents
                        </p>
                      </div>

                      <div className="bg-fuchsia-500/10 p-4 rounded-lg border border-fuchsia-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="h-5 w-5 text-fuchsia-400" />
                          <span className="text-fuchsia-300 font-semibold">Launch Timeline</span>
                        </div>
                        <p className="text-gray-300">Revolutionary patent-powered gaming platform launching Q3 2025</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div 
                    className="flex gap-4 pt-4"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 2.8 }}
                  >
                    <Button 
                      size="lg"
                      className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-bold px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Crown className="h-5 w-5 mr-2" />
                      Visit gxcoin.world
                    </Button>
                    <Button 
                      size="lg"
                      variant="outline"
                      className="border-violet-500/50 text-violet-300 hover:bg-violet-500/10 px-6 py-3"
                    >
                      Subscribe Updates
                    </Button>
                  </motion.div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.section>

      {/* Avengers-Style Heroes Section */}
      <motion.section 
        className="px-4 py-16 bg-gradient-to-r from-indigo-900/20 via-blue-900/20 to-purple-900/20"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.4 }}
      >
        <div className="max-w-6xl mx-auto">
          <Card className="bg-gradient-to-br from-indigo-900/40 via-blue-900/30 to-purple-900/40 backdrop-blur-sm border-indigo-500/30 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/10 via-blue-500/10 to-purple-500/10" />
            
            <CardContent className="p-8 relative z-10">
              <div className="text-center space-y-8">
                {/* Epic Heroes Image */}
                <motion.div
                  className="relative rounded-lg overflow-hidden shadow-2xl mx-auto max-w-4xl"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 2.6 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <img 
                    src="/gxcoin-heroes-main.jpg" 
                    alt="GXCOIN ReFi League Superhero Team" 
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  
                  {/* Epic Tagline Overlay */}
                  <div className="absolute bottom-8 left-8 right-8">
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 3.0 }}
                    >
                      <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4 text-center">
                        <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                          GXCOIN
                        </span>
                      </h1>
                      <p className="text-xl lg:text-2xl text-gray-300 text-center font-medium">
                        Earned NFTs. Real Impact.
                      </p>
                    </motion.div>
                  </div>
                </motion.div>

                <motion.div 
                  className="space-y-6"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 3.2 }}
                >
                  <h2 className="text-3xl font-bold text-white">
                    <span className="bg-gradient-to-r from-indigo-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                      The Ultimate Environmental Heroes
                    </span>
                  </h2>
                  <p className="text-gray-300 text-lg max-w-3xl mx-auto leading-relaxed">
                    Unite with the most powerful eco-warriors in the multiverse. Each hero represents real-world 
                    environmental technology backed by revolutionary patents. Together, they form an unstoppable 
                    force for planetary healing and sustainable innovation.
                  </p>

                  <div className="flex flex-wrap justify-center gap-4">
                    <Badge className="bg-blue-600/20 text-blue-400 border-blue-500/30 px-4 py-2">
                      <Droplets className="h-4 w-4 mr-2" />
                      Earned Through Impact
                    </Badge>
                    <Badge className="bg-purple-600/20 text-purple-400 border-purple-500/30 px-4 py-2">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Real-World Utility
                    </Badge>
                    <Badge className="bg-indigo-600/20 text-indigo-400 border-indigo-500/30 px-4 py-2">
                      <Shield className="h-4 w-4 mr-2" />
                      Patent-Powered
                    </Badge>
                  </div>

                  <motion.div 
                    className="flex justify-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 3.4 }}
                  >
                    <Button 
                      size="lg"
                      className="bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 hover:from-indigo-700 hover:via-blue-700 hover:to-purple-700 text-white font-bold px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Sparkles className="h-5 w-5 mr-2" />
                      Assemble Your Heroes
                    </Button>
                  </motion.div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.section>
    </div>
  );
}