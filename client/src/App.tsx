import { Suspense, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAudio } from "@/lib/stores/useAudio";
import { useGame } from "@/lib/stores/useGame";
import { useUser } from "@/lib/stores/useUser";
import Scene3D from "@/components/Scene3D";
import SuperheroUI from "@/components/SuperheroUI";
import HeroShowcase from "@/components/HeroShowcase";
import RankProgression from "@/components/RankProgression";
import BlackCard from "@/components/BlackCard";
import ContributionCalculator from "@/components/ContributionCalculator";
import MissionRoadmap from "@/components/MissionRoadmap";
import NFTPreview from "@/components/NFTPreview";
import LoginModal from "@/components/LoginModal";
import { 
  Volume2, 
  VolumeX, 
  Zap, 
  Shield, 
  Users, 
  Trophy,
  Sparkles
} from "lucide-react";
import "@fontsource/inter";

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-blue-900 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 mx-auto"
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
  const { toggleMute, isMuted } = useAudio();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-green-900 flex items-center justify-center p-4"
    >
      <Card className="max-w-2xl w-full bg-black/80 backdrop-blur-sm border-green-500/50">
        <CardContent className="p-8 text-center space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="space-y-4"
          >
            <div className="text-6xl font-bold bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              GXCOIN
            </div>
            <div className="text-xl text-white font-semibold">
              Eco-Warrior Superheroes
            </div>
            <p className="text-gray-300 max-w-md mx-auto">
              Join the ReFi League and become a hero in the fight for regenerative finance. 
              Discover your powers, unlock legendary NFTs, and make real-world impact.
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
  const [currentTab, setCurrentTab] = useState("heroes");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { isLoggedIn } = useUser();

  useEffect(() => {
    // Show login modal if user is not logged in
    if (!isLoggedIn) {
      const timer = setTimeout(() => setShowLoginModal(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [isLoggedIn]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-blue-900 relative">
      {/* 3D Scene Background */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={<div className="w-full h-full bg-black" />}>
          <Scene3D />
        </Suspense>
      </div>

      {/* UI Overlay */}
      <SuperheroUI />
      <HeroShowcase />
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />

      {/* Main Content Tabs */}
      <div className="relative z-10 pt-20">
        <div className="max-w-7xl mx-auto px-4">
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="grid w-full max-w-2xl grid-cols-5 bg-black/60 backdrop-blur-sm">
                <TabsTrigger value="heroes" className="text-xs">Heroes</TabsTrigger>
                <TabsTrigger value="ranks" className="text-xs">Ranks</TabsTrigger>
                <TabsTrigger value="calculate" className="text-xs">Calculate</TabsTrigger>
                <TabsTrigger value="roadmap" className="text-xs">Roadmap</TabsTrigger>
                <TabsTrigger value="nfts" className="text-xs">NFTs</TabsTrigger>
              </TabsList>
            </div>

            <div className="space-y-8">
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
                    Click on the floating heroes in the 3D scene to discover their unique powers and impact on regenerative finance.
                  </p>
                </motion.div>
                <BlackCard />
              </TabsContent>

              <TabsContent value="ranks" className="mt-0">
                <RankProgression />
              </TabsContent>

              <TabsContent value="calculate" className="mt-0">
                <ContributionCalculator />
              </TabsContent>

              <TabsContent value="roadmap" className="mt-0">
                <MissionRoadmap />
              </TabsContent>

              <TabsContent value="nfts" className="mt-0">
                <NFTPreview />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function App() {
  const { phase, start } = useGame();
  const { initializeAuth, isLoggedIn } = useUser();
  const [showWelcome, setShowWelcome] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize authentication and audio
  useEffect(() => {
    const initializeApp = async () => {
      // Initialize authentication
      await initializeAuth();
      
      // Initialize audio
      const audio = new Audio('/sounds/background.mp3');
      audio.loop = true;
      audio.volume = 0.3;
      
      const hitSound = new Audio('/sounds/hit.mp3');
      const successSound = new Audio('/sounds/success.mp3');
      
      useAudio.getState().setBackgroundMusic(audio);
      useAudio.getState().setHitSound(hitSound);
      useAudio.getState().setSuccessSound(successSound);
      
      setIsLoading(false);
    };

    // Simulate loading time then initialize
    const timer = setTimeout(initializeApp, 2000);
    return () => clearTimeout(timer);
  }, [initializeAuth]);

  const handleEnterExperience = () => {
    setShowWelcome(false);
    start();
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <AnimatePresence mode="wait">
        {showWelcome ? (
          <WelcomeScreen key="welcome" onEnter={handleEnterExperience} />
        ) : (
          <MainExperience key="main" />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
