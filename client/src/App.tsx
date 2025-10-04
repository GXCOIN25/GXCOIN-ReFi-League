import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGame } from "@/lib/stores/useGame";
import { useUser } from "@/lib/stores/useUser";
import { useHeroes } from "@/lib/stores/useHeroes";
import SuperheroUI from "@/components/SuperheroUI";
import HeroShowcase from "@/components/HeroShowcase";
import RankProgression from "@/components/RankProgression";
import BlackCard from "@/components/BlackCard";
import ContributionCalculator from "@/components/ContributionCalculator";
import NFTPreview from "@/components/NFTPreview";
import LoginModal from "@/components/LoginModal";
import { WalletConnect } from "@/components/WalletConnect";
import { WalletFeatures } from "@/components/WalletFeatures";
import { RealImpactDashboard } from "@/components/RealImpactDashboard";
import { CommunityFeatures } from "@/components/CommunityFeatures";
import { TokenIntegration } from "@/components/TokenIntegration";
import { NFTMinting } from "@/components/NFTMinting";
import GameArena from "@/components/GameArena";
import LandingPage from "@/components/LandingPage";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import { 
  Volume2, 
  VolumeX, 
  Zap, 
  Shield, 
  Users, 
  Trophy,
  Sparkles,
  Wallet,
  Globe,
  Coins,
  Gamepad2,
  Home
} from "lucide-react";
import "@fontsource/inter";

function LoadingScreen() {
  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-gray-900 via-black to-blue-900 flex items-center justify-center overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 mx-auto motion-reduce:animate-none"
        >
          <Zap className="w-full h-full text-green-400" />
        </motion.div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Assembling Eco-Warriors...
          </h2>
          <p className="text-gray-400">
            Loading the ReFi League
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function WelcomeScreen({ onEnter }: { onEnter: () => void }) {
  const [isMuted, setIsMuted] = useState(true);

  const toggleMute = () => setIsMuted(!isMuted);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[100dvh] bg-gradient-to-br from-gray-900 via-black to-blue-900 flex items-center justify-center px-4 overflow-y-auto"
    >
      <Card className="w-full max-w-lg bg-black/60 backdrop-blur-sm border-green-500/30">
        <CardContent className="p-8 text-center space-y-6">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
              <Zap className="w-10 h-10 text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome to <span className="text-green-400">GXCOIN</span>
            </h1>
            <p className="text-gray-400 mb-6">
              The Interactive ReFi League Experience
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 gap-4 max-w-sm mx-auto text-sm"
          >
            <div className="flex items-center gap-2 text-green-400">
              <Shield className="h-4 w-4" />
              5 Heroes
            </div>
            <div className="flex items-center gap-2 text-blue-400">
              <Users className="h-4 w-4" />
              5 Ranks
            </div>
            <div className="flex items-center gap-2 text-purple-400">
              <Sparkles className="h-4 w-4" />
              Dynamic NFTs
            </div>
            <div className="flex items-center gap-2 text-yellow-400">
              <Trophy className="h-4 w-4" />
              Real Impact
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="space-y-4"
          >
            <Button
              onClick={onEnter}
              size="lg"
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 text-white font-semibold px-8 py-3"
            >
              Enter the ReFi League
            </Button>
            
            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="text-gray-400 hover:text-white"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                <span className="ml-2">{isMuted ? 'Unmute' : 'Mute'}</span>
              </Button>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function MainExperience() {
  const [currentTab, setCurrentTab] = useState("home");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showNFTMinting, setShowNFTMinting] = useState<{ heroId: string; level: number } | null>(null);
  const { isLoggedIn } = useUser();
  const { heroes, selectHero } = useHeroes();
  
  // Hero image mapping
  const getHeroImage = (heroId: string) => {
    const imageMap: Record<string, string> = {
      "aqua_wtr": "/agua-wtr-correct.jpg",
      "hemp_builder": "/hemp-correct.jpg", 
      "voltra_gpwr": "/gpwr-badge.jpg",
      "graphene_batt": "/graphene-batt-correct.jpg",
      "trader_gcct": "/gcct-correct.jpg"
    };
    return imageMap[heroId] || "/hero-collection-promo.jpg";
  };
  
  // Mobile tab state management for conditional background display

  // Remove automatic login modal - let users explore freely
  // useEffect(() => {
  //   if (!isLoggedIn) {
  //     const timer = setTimeout(() => setShowLoginModal(true), 2000);
  //     return () => clearTimeout(timer);
  //   }
  // }, [isLoggedIn]);

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-gray-900 via-black to-blue-900 relative overflow-y-auto">
      {/* Background with Hero Visualization - Hidden on mobile when showing main content */}
      <div className={`absolute inset-0 z-0 bg-gradient-to-br from-gray-900 via-black to-blue-900 pointer-events-none transition-opacity duration-300 ${
        currentTab === "home" ? "md:opacity-100 opacity-0" : "opacity-0"
      }`}>
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-4xl">
              {heroes.map((hero) => (
                <div key={hero.id} className="text-center space-y-2">
                  <div 
                    className="w-16 h-16 mx-auto rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform pointer-events-auto overflow-hidden"
                    style={{ backgroundColor: hero.color + '30', border: `2px solid ${hero.color}`, minWidth: '44px', minHeight: '44px' }}
                    onClick={() => selectHero && selectHero(hero.id)}
                  >
                    <img 
                      src={getHeroImage(hero.id)}
                      alt={hero.name}
                      className="w-full h-full object-cover rounded-full"
                      onError={(e) => {
                        // Fallback to text if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = document.createElement('span');
                        fallback.className = 'text-2xl font-bold text-white';
                        fallback.textContent = hero.symbol.charAt(1);
                        target.parentNode?.appendChild(fallback);
                      }}
                    />
                  </div>
                  <div className="text-xs text-white font-medium">{hero.name}</div>
                  <div className="text-xs" style={{ color: hero.color }}>{hero.symbol}</div>
                </div>
              ))}
            </div>
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold text-white mb-2">GXCOIN Eco-Warriors</h3>
              <p className="text-gray-400">Click heroes above to explore their powers</p>
              {!isLoggedIn && (
                <Button
                  onClick={() => setShowLoginModal(true)}
                  size="sm"
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 text-white font-semibold"
                >
                  Login to Save Progress
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* UI Overlay */}
      <SuperheroUI currentTab={currentTab} />
      <HeroShowcase />
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      
      {/* NFT Minting Modal */}
      {showNFTMinting && (
        <NFTMinting
          heroId={showNFTMinting.heroId}
          level={showNFTMinting.level}
          onClose={() => setShowNFTMinting(null)}
        />
      )}

      {/* Main Content Tabs */}
      <div className="relative z-10 pt-20">
        <div className="max-w-7xl mx-auto px-4">
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <div className="flex justify-center mb-8 overflow-x-auto">
              <TabsList className="mobile-tabs-list w-full max-w-7xl bg-black/80 backdrop-blur-md p-3 flex overflow-x-auto scroll-smooth gap-2 border border-green-500/20">
                <TabsTrigger value="home" className="mobile-tab-trigger text-sm md:text-base lg:text-lg flex items-center gap-1.5 md:gap-2 cursor-pointer hover:bg-white/10 rounded flex-shrink-0 px-3 md:px-4 py-2 md:py-3 whitespace-nowrap" style={{ minWidth: '44px', minHeight: '44px' }}>
                  <Home className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden sm:inline">Home</span>
                </TabsTrigger>
                <TabsTrigger value="heroes" className="mobile-tab-trigger text-sm md:text-base lg:text-lg flex items-center gap-1.5 md:gap-2 cursor-pointer hover:bg-white/10 rounded flex-shrink-0 px-3 md:px-4 py-2 md:py-3 whitespace-nowrap" style={{ minWidth: '44px', minHeight: '44px' }}>
                  <Shield className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden sm:inline">Heroes</span>
                </TabsTrigger>
                <TabsTrigger value="ranks" className="mobile-tab-trigger text-sm md:text-base lg:text-lg flex items-center gap-1.5 md:gap-2 flex-shrink-0 px-3 md:px-4 py-2 md:py-3 whitespace-nowrap" style={{ minWidth: '44px', minHeight: '44px' }}>
                  <Trophy className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden sm:inline">Ranks</span>
                </TabsTrigger>
                <TabsTrigger value="calculate" className="mobile-tab-trigger text-sm md:text-base lg:text-lg flex items-center gap-1.5 md:gap-2 flex-shrink-0 px-3 md:px-4 py-2 md:py-3 whitespace-nowrap" style={{ minWidth: '44px', minHeight: '44px' }}>
                  <Zap className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden sm:inline">Calculate</span>
                </TabsTrigger>
                <TabsTrigger value="nfts" className="mobile-tab-trigger text-sm md:text-base lg:text-lg flex items-center gap-1.5 md:gap-2 cursor-pointer hover:bg-white/10 rounded flex-shrink-0 px-3 md:px-4 py-2 md:py-3 whitespace-nowrap" style={{ minWidth: '44px', minHeight: '44px' }}>
                  <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden sm:inline">NFTs</span>
                </TabsTrigger>
                <TabsTrigger value="impact" className="mobile-tab-trigger text-sm md:text-base lg:text-lg flex items-center gap-1.5 md:gap-2 flex-shrink-0 px-3 md:px-4 py-2 md:py-3 whitespace-nowrap" style={{ minWidth: '44px', minHeight: '44px' }}>
                  <Globe className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden sm:inline">Impact</span>
                </TabsTrigger>
                <TabsTrigger value="community" className="mobile-tab-trigger text-sm md:text-base lg:text-lg flex items-center gap-1.5 md:gap-2 flex-shrink-0 px-3 md:px-4 py-2 md:py-3 whitespace-nowrap" style={{ minWidth: '44px', minHeight: '44px' }}>
                  <Users className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden sm:inline">Community</span>
                </TabsTrigger>
                <TabsTrigger value="tokens" className="mobile-tab-trigger text-sm md:text-base lg:text-lg flex items-center gap-1.5 md:gap-2 flex-shrink-0 px-3 md:px-4 py-2 md:py-3 whitespace-nowrap" style={{ minWidth: '44px', minHeight: '44px' }}>
                  <Coins className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden sm:inline">Tokens</span>
                </TabsTrigger>
                <TabsTrigger value="wallet" className="mobile-tab-trigger text-sm md:text-base lg:text-lg flex items-center gap-1.5 md:gap-2 flex-shrink-0 px-3 md:px-4 py-2 md:py-3 whitespace-nowrap" style={{ minWidth: '44px', minHeight: '44px' }}>
                  <Wallet className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden sm:inline">Wallet</span>
                </TabsTrigger>
                <TabsTrigger value="game" className="mobile-tab-trigger text-sm md:text-base lg:text-lg flex items-center gap-1.5 md:gap-2 flex-shrink-0 px-3 md:px-4 py-2 md:py-3 whitespace-nowrap" style={{ minWidth: '44px', minHeight: '44px' }}>
                  <Gamepad2 className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden sm:inline">Arena</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="space-y-8 min-h-screen overflow-y-auto px-2">
              <TabsContent value="home" className="mt-0 relative z-20 bg-gradient-to-br from-gray-900/95 via-black/95 to-blue-900/95 backdrop-blur-sm rounded-lg">
                <LandingPage onOpenLogin={() => setShowLoginModal(true)} />
              </TabsContent>

              <TabsContent value="heroes" className="space-y-8 mt-0">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center space-y-4"
                >
                  <h1 className="text-4xl font-bold text-white">
                    Meet Your <span className="text-green-400">Eco-Warriors</span>
                  </h1>
                  <p className="text-gray-300 max-w-2xl mx-auto">
                    Select your heroes below to discover their unique powers and impact on regenerative finance.
                  </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-8">
                  {heroes.filter(h => h.id !== "gxcoin_anchor").map((hero) => (
                    <motion.div
                      key={hero.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card 
                        className="cursor-pointer overflow-hidden border-2 transition-all duration-300 hover:shadow-2xl"
                        style={{ 
                          borderColor: hero.color + '60',
                          background: `linear-gradient(135deg, ${hero.color}20, transparent)`
                        }}
                        onClick={() => selectHero && selectHero(hero.id)}
                      >
                        <CardContent className="p-6 space-y-4">
                          <div className="flex items-center gap-4">
                            <div 
                              className="w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
                              style={{ 
                                backgroundColor: hero.color + '30', 
                                border: `3px solid ${hero.color}`,
                                minWidth: '80px',
                                minHeight: '80px'
                              }}
                            >
                              <img 
                                src={getHeroImage(hero.id)}
                                alt={hero.name}
                                className="w-full h-full object-cover rounded-full"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const fallback = document.createElement('span');
                                  fallback.className = 'text-3xl';
                                  fallback.textContent = hero.avatar || hero.symbol.charAt(0);
                                  target.parentNode?.appendChild(fallback);
                                }}
                              />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-white">{hero.name}</h3>
                              <p className="text-sm" style={{ color: hero.color }}>{hero.symbol}</p>
                              <p className="text-xs text-gray-400 mt-1">{hero.title}</p>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-300 line-clamp-3">{hero.description}</p>
                          
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="bg-black/40 rounded p-2 text-center">
                              <div className="text-gray-400">Power</div>
                              <div className="text-white font-bold">{hero.stats.power}</div>
                            </div>
                            <div className="bg-black/40 rounded p-2 text-center">
                              <div className="text-gray-400">Health</div>
                              <div className="text-white font-bold">{hero.stats.health}</div>
                            </div>
                            <div className="bg-black/40 rounded p-2 text-center">
                              <div className="text-gray-400">Speed</div>
                              <div className="text-white font-bold">{hero.stats.speed}</div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <span className="text-xs px-2 py-1 rounded" style={{ 
                              backgroundColor: hero.color + '30',
                              color: hero.color 
                            }}>
                              {hero.rarity}
                            </span>
                            <span className="text-xs text-gray-400">
                              Level {hero.level}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                <BlackCard />
              </TabsContent>

              <TabsContent value="ranks" className="mt-0">
                <RankProgression />
              </TabsContent>

              <TabsContent value="calculate" className="mt-0">
                <ContributionCalculator />
              </TabsContent>

              <TabsContent value="nfts" className="mt-0">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center space-y-4 mb-8"
                >
                  <h1 className="text-4xl font-bold text-white">
                    <span className="text-purple-400">Dynamic</span> NFT Collection
                  </h1>
                  <p className="text-gray-300 max-w-2xl mx-auto">
                    Explore and mint your evolving NFT badges that grow with your environmental impact.
                  </p>
                </motion.div>
                <NFTPreview onMintNFT={(heroId: string, level: number) => setShowNFTMinting({ heroId, level })} />
              </TabsContent>
              
              <TabsContent value="impact" className="mt-0">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center space-y-4 mb-8"
                >
                  <h1 className="text-4xl font-bold text-white">
                    <span className="text-green-400">Real-Time</span> Environmental Impact
                  </h1>
                  <p className="text-gray-300 max-w-2xl mx-auto">
                    Track your actual environmental impact with live data feeds and verified metrics.
                  </p>
                </motion.div>
                <RealImpactDashboard />
              </TabsContent>
              
              <TabsContent value="community" className="mt-0">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center space-y-4 mb-8"
                >
                  <h1 className="text-4xl font-bold text-white">
                    <span className="text-blue-400">Community</span> Missions
                  </h1>
                  <p className="text-gray-300 max-w-2xl mx-auto">
                    Join forces with other Eco-Warriors in team missions and global challenges.
                  </p>
                </motion.div>
                <CommunityFeatures />
              </TabsContent>
              
              <TabsContent value="tokens" className="mt-0">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center space-y-4 mb-8"
                >
                  <h1 className="text-4xl font-bold text-white">
                    <span className="text-yellow-400">Token</span> Ecosystem
                  </h1>
                  <p className="text-gray-300 max-w-2xl mx-auto">
                    Track and trade AQUA, HEMP, VOLTRA, GRAPHENE, and TRADER tokens with real market data.
                  </p>
                </motion.div>
                <TokenIntegration />
              </TabsContent>
              
              <TabsContent value="wallet" className="mt-0">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center space-y-4 mb-8"
                >
                  <h1 className="text-4xl font-bold text-white">
                    <span className="text-purple-400">Crypto</span> Wallet
                  </h1>
                  <p className="text-gray-300 max-w-2xl mx-auto">
                    Connect your wallet to make real contributions and mint NFTs on the blockchain.
                  </p>
                </motion.div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
                  <WalletConnect />
                  <WalletFeatures />
                </div>
              </TabsContent>

              <TabsContent value="game" className="mt-0">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center space-y-4 mb-8"
                >
                  <h1 className="text-4xl font-bold text-white">
                    <span className="text-red-400">Game</span> Arena
                  </h1>
                  <p className="text-gray-300 max-w-2xl mx-auto">
                    Battle with your heroes, climb the ranks, and earn Arena Coins in the ultimate gaming experience.
                  </p>
                </motion.div>
                <GameArena />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function App() {
  const { start } = useGame();
  const { initializeAuth, completeGitHubOAuth } = useUser();
  const [showWelcome, setShowWelcome] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Handle GitHub OAuth callback if present
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const storedState = sessionStorage.getItem('github_oauth_state');
        
        if (code && state && storedState === state) {
          console.log('Processing GitHub OAuth callback...');
          try {
            await completeGitHubOAuth(code, state);
            console.log('GitHub OAuth completed successfully');
          } catch (error) {
            console.error('GitHub OAuth callback failed:', error);
          }
        }
        
        await initializeAuth();
        setIsLoading(false);
      } catch (error) {
        console.error('App initialization failed:', error);
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [initializeAuth, completeGitHubOAuth]);

  const handleEnterExperience = () => {
    setShowWelcome(false);
    start();
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div style={{ width: '100vw', minHeight: '100vh', position: 'relative', overflowX: 'hidden', overflowY: 'auto' }}>
      <AnimatePresence mode="wait">
        {showWelcome ? (
          <WelcomeScreen key="welcome" onEnter={handleEnterExperience} />
        ) : (
          <MainExperience key="main" />
        )}
      </AnimatePresence>
      
      {/* PWA Install Prompt - Available across all screens */}
      <PWAInstallPrompt />
    </div>
  );
}

export default App;