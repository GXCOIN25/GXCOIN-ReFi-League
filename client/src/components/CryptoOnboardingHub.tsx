import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import {
  Rocket,
  Wallet,
  ShoppingCart,
  BookOpen,
  Shield,
  CheckCircle,
  X,
  ArrowRight,
  Sparkles,
  Trophy,
  CreditCard,
  Zap,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Info,
  PlayCircle,
  ExternalLink,
  Flag
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { MetaMaskOnboarding } from './MetaMaskOnboarding';
import { useUser } from '@/lib/stores/useUser';
import { useWallet } from '@/lib/stores/useWallet';
import { cryptoFAQs, glossaryTerms, securityBestPractices, securityDosAndDonts } from '@/data/cryptoFAQ';

interface CryptoOnboardingHubProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'start' | 'metamask' | 'buy' | 'learn' | 'security';
  onComplete: () => void;
}

export const CryptoOnboardingHub: React.FC<CryptoOnboardingHubProps> = ({
  isOpen,
  onClose,
  initialTab = 'start',
  onComplete
}) => {
  const [currentTab, setCurrentTab] = useState(initialTab);
  const [showMetaMaskModal, setShowMetaMaskModal] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);

  const { onboardingProgress, updateOnboardingProgress, completeOnboarding } = useUser();
  const { isConnected, connectWallet } = useWallet();

  const tabs = [
    { id: 'start', label: 'Getting Started', icon: Rocket },
    { id: 'metamask', label: 'Setup MetaMask', icon: Wallet },
    { id: 'buy', label: 'Buy Your First NFT', icon: ShoppingCart },
    { id: 'learn', label: 'Learn & FAQ', icon: BookOpen },
    { id: 'security', label: 'Security Tips', icon: Shield }
  ];

  const completedTabs = onboardingProgress.completedTabs || [];
  const progress = (completedTabs.length / tabs.length) * 100;

  useEffect(() => {
    if (isOpen) {
      updateOnboardingProgress({ lastActiveTab: currentTab });
    }
  }, [currentTab, isOpen]);

  useEffect(() => {
    if (isConnected && !onboardingProgress.walletConnected) {
      updateOnboardingProgress({ walletConnected: true });
      markTabComplete('metamask');
    }
  }, [isConnected]);

  const markTabComplete = (tabId: string) => {
    if (!completedTabs.includes(tabId)) {
      const newCompletedTabs = [...completedTabs, tabId];
      updateOnboardingProgress({ completedTabs: newCompletedTabs });

      if (newCompletedTabs.length === tabs.length) {
        handleComplete();
      }
    }
  };

  const handleTabChange = (value: string) => {
    setCurrentTab(value as 'start' | 'metamask' | 'buy' | 'learn' | 'security');
    updateOnboardingProgress({ lastActiveTab: value });
  };

  const handleSkipTutorial = () => {
    updateOnboardingProgress({ skipped: true });
    onClose();
  };

  const handleComplete = () => {
    completeOnboarding();
    setShowCelebration(true);
    setTimeout(() => {
      setShowCelebration(false);
      onComplete();
      onClose();
    }, 3000);
  };

  const handleMetaMaskComplete = () => {
    setShowMetaMaskModal(false);
    markTabComplete('metamask');
    updateOnboardingProgress({ metaMaskSetup: true });
  };

  const renderGlossaryTooltip = (text: string) => {
    const words = text.split(' ');
    return words.map((word, index) => {
      const cleanWord = word.replace(/[.,!?;:]/, '').toLowerCase();
      const term = glossaryTerms.find(t => t.term.toLowerCase() === cleanWord);

      if (term) {
        return (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <span className="underline decoration-dotted cursor-help text-purple-400">
                {word}{' '}
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="font-semibold">{term.term}</p>
              <p className="text-sm mt-1">{term.definition}</p>
              {term.example && (
                <p className="text-xs text-gray-400 mt-2 italic">Example: {term.example}</p>
              )}
            </TooltipContent>
          </Tooltip>
        );
      }
      return <span key={index}>{word} </span>;
    });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-950 via-purple-950/20 to-blue-950/20 border-purple-500/30">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-purple-400" />
              Crypto Onboarding Hub
            </DialogTitle>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                <span>Your Progress</span>
                <span>{completedTabs.length} of {tabs.length} completed</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </DialogHeader>

          <TooltipProvider>
            <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-5 bg-gray-900/50 p-1 gap-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isCompleted = completedTabs.includes(tab.id);
                  return (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="relative data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      <span className="hidden md:inline">{tab.label}</span>
                      {isCompleted && (
                        <CheckCircle className="w-4 h-4 ml-2 text-green-400 absolute -top-1 -right-1" />
                      )}
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              <TabsContent value="start" className="mt-6 space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-500/30">
                    <CardHeader>
                      <CardTitle className="text-2xl text-white flex items-center gap-2">
                        <Rocket className="w-6 h-6 text-purple-400" />
                        Welcome to the Future of Impact!
                      </CardTitle>
                      <CardDescription className="text-gray-300 text-base">
                        Get ready to join the Web3 revolution while making real environmental impact
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="bg-gray-900/50 rounded-lg p-6 border border-blue-500/30">
                        <h3 className="text-xl font-bold text-blue-400 mb-3 flex items-center gap-2">
                          <Info className="w-5 h-5" />
                          What is Web3?
                        </h3>
                        <p className="text-gray-300 leading-relaxed">
                          Web3 is the next evolution of the internet where YOU own your digital assets, data, and identity. 
                          Instead of big tech companies controlling everything, Web3 uses {renderGlossaryTooltip('blockchain')} technology 
                          to give power back to users. With GXCOIN, you're not just using an app - you're owning your impact!
                        </p>
                      </div>

                      <div className="bg-gray-900/50 rounded-lg p-6 border border-purple-500/30">
                        <h3 className="text-xl font-bold text-purple-400 mb-3 flex items-center gap-2">
                          <Trophy className="w-5 h-5" />
                          Why GXCOIN ReFi League?
                        </h3>
                        <div className="space-y-3 text-gray-300">
                          <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                            <p>
                              <strong className="text-white">Real Environmental Impact:</strong> Every NFT purchase 
                              directly funds verified environmental projects like reforestation and ocean cleanup
                            </p>
                          </div>
                          <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                            <p>
                              <strong className="text-white">Dynamic NFT Heroes:</strong> Your heroes evolve and level up 
                              as you make real-world contributions - they're living proof of your impact!
                            </p>
                          </div>
                          <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                            <p>
                              <strong className="text-white">Gamified Sustainability:</strong> Earn rewards, unlock achievements, 
                              and compete in the ReFi League while healing the planet
                            </p>
                          </div>
                          <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                            <p>
                              <strong className="text-white">True Ownership:</strong> Your NFTs are yours forever - trade them, 
                              upgrade them, or hold them as your impact legacy
                            </p>
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={() => {
                          markTabComplete('start');
                          setCurrentTab('metamask');
                        }}
                        size="lg"
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-lg py-6"
                      >
                        <Sparkles className="w-5 h-5 mr-2" />
                        Start Your Journey
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              <TabsContent value="metamask" className="mt-6 space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="bg-gray-900/50 border-purple-500/30">
                    <CardHeader>
                      <CardTitle className="text-2xl text-white flex items-center gap-2">
                        <Wallet className="w-6 h-6 text-orange-400" />
                        Setup Your MetaMask Wallet
                      </CardTitle>
                      <CardDescription className="text-gray-300">
                        Your gateway to Web3 and NFT ownership
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {onboardingProgress.metaMaskSetup && onboardingProgress.walletConnected ? (
                        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-6 text-center">
                          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                          <h3 className="text-xl font-bold text-green-300 mb-2">MetaMask Setup Complete!</h3>
                          <p className="text-green-200">Your wallet is connected and ready to use</p>
                        </div>
                      ) : (
                        <>
                          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                            <h4 className="text-blue-300 font-medium mb-2">What You'll Need:</h4>
                            <ul className="space-y-2 text-blue-200 text-sm">
                              <li className="flex items-center gap-2">
                                <ChevronRight className="w-4 h-4" />
                                A desktop browser or mobile device
                              </li>
                              <li className="flex items-center gap-2">
                                <ChevronRight className="w-4 h-4" />
                                5-10 minutes for setup
                              </li>
                              <li className="flex items-center gap-2">
                                <ChevronRight className="w-4 h-4" />
                                A secure place to store your seed phrase
                              </li>
                            </ul>
                          </div>

                          <div className="space-y-3">
                            <Button
                              onClick={() => setShowMetaMaskModal(true)}
                              size="lg"
                              className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                            >
                              <Wallet className="w-5 h-5 mr-2" />
                              Start MetaMask Setup
                            </Button>

                            {!isConnected && typeof window.ethereum !== 'undefined' && (
                              <Button
                                onClick={async () => {
                                  await connectWallet();
                                  markTabComplete('metamask');
                                }}
                                variant="outline"
                                size="lg"
                                className="w-full"
                              >
                                Already Have MetaMask? Quick Connect
                              </Button>
                            )}
                          </div>
                        </>
                      )}

                      <Button
                        onClick={() => {
                          markTabComplete('metamask');
                          setCurrentTab('buy');
                        }}
                        variant="ghost"
                        className="w-full"
                      >
                        Continue to Next Step
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              <TabsContent value="buy" className="mt-6 space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="bg-gray-900/50 border-purple-500/30">
                    <CardHeader>
                      <CardTitle className="text-2xl text-white flex items-center gap-2">
                        <ShoppingCart className="w-6 h-6 text-green-400" />
                        Buy Your First NFT
                      </CardTitle>
                      <CardDescription className="text-gray-300">
                        Choose the payment method that works best for you
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid md:grid-cols-3 gap-4">
                        <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30 hover:border-purple-400 transition-all cursor-pointer">
                          <CardHeader>
                            <CardTitle className="text-lg text-purple-300 flex items-center gap-2">
                              <Wallet className="w-5 h-5" />
                              Have Crypto?
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <p className="text-sm text-gray-300">
                              If you already have ETH or other crypto, connect your wallet and pay directly
                            </p>
                            <div className="bg-purple-500/10 rounded p-3 text-xs text-purple-200">
                              <p className="font-semibold mb-1">Best For:</p>
                              <p>Experienced crypto users</p>
                            </div>
                            <Button className="w-full bg-purple-600 hover:bg-purple-700" size="sm">
                              Connect & Pay
                            </Button>
                          </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30 hover:border-blue-400 transition-all cursor-pointer">
                          <CardHeader>
                            <CardTitle className="text-lg text-blue-300 flex items-center gap-2">
                              <CreditCard className="w-5 h-5" />
                              Have Credit Card?
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <p className="text-sm text-gray-300">
                              Buy your NFT directly with credit/debit card via Stripe
                            </p>
                            <div className="bg-blue-500/10 rounded p-3 text-xs text-blue-200">
                              <p className="font-semibold mb-1">Best For:</p>
                              <p>Crypto beginners</p>
                            </div>
                            <Button className="w-full bg-blue-600 hover:bg-blue-700" size="sm">
                              Buy with Card
                            </Button>
                          </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30 hover:border-green-400 transition-all cursor-pointer">
                          <CardHeader>
                            <CardTitle className="text-lg text-green-300 flex items-center gap-2">
                              <Zap className="w-5 h-5" />
                              Need Crypto?
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <p className="text-sm text-gray-300">
                              Buy crypto first with Stripe Onramp, then purchase your NFT
                            </p>
                            <div className="bg-green-500/10 rounded p-3 text-xs text-green-200">
                              <p className="font-semibold mb-1">Best For:</p>
                              <p>New to crypto entirely</p>
                            </div>
                            <Button className="w-full bg-green-600 hover:bg-green-700" size="sm">
                              Buy Crypto First
                            </Button>
                          </CardContent>
                        </Card>
                      </div>

                      <Card className="bg-yellow-500/10 border-yellow-500/30">
                        <CardHeader>
                          <CardTitle className="text-yellow-400 flex items-center gap-2 text-base">
                            <HelpCircle className="w-5 h-5" />
                            Which option is right for me?
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <p className="text-sm text-gray-300">Take this quick quiz:</p>
                            <div className="space-y-2">
                              <button
                                onClick={() => setQuizAnswer('crypto')}
                                className={`w-full text-left p-3 rounded-lg border transition-all ${
                                  quizAnswer === 'crypto' 
                                    ? 'bg-purple-500/20 border-purple-500' 
                                    : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                                }`}
                              >
                                <p className="text-white font-medium">I have crypto in my wallet already</p>
                                {quizAnswer === 'crypto' && (
                                  <p className="text-sm text-purple-300 mt-1">→ Use "Have Crypto?" option</p>
                                )}
                              </button>
                              <button
                                onClick={() => setQuizAnswer('card')}
                                className={`w-full text-left p-3 rounded-lg border transition-all ${
                                  quizAnswer === 'card' 
                                    ? 'bg-blue-500/20 border-blue-500' 
                                    : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                                }`}
                              >
                                <p className="text-white font-medium">I want the easiest way with my credit card</p>
                                {quizAnswer === 'card' && (
                                  <p className="text-sm text-blue-300 mt-1">→ Use "Have Credit Card?" option</p>
                                )}
                              </button>
                              <button
                                onClick={() => setQuizAnswer('new')}
                                className={`w-full text-left p-3 rounded-lg border transition-all ${
                                  quizAnswer === 'new' 
                                    ? 'bg-green-500/20 border-green-500' 
                                    : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                                }`}
                              >
                                <p className="text-white font-medium">I'm completely new and want to learn how to buy crypto</p>
                                {quizAnswer === 'new' && (
                                  <p className="text-sm text-green-300 mt-1">→ Use "Need Crypto?" option</p>
                                )}
                              </button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Button
                        onClick={() => {
                          markTabComplete('buy');
                          setCurrentTab('learn');
                        }}
                        className="w-full"
                        variant="outline"
                      >
                        Continue to Learning Resources
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              <TabsContent value="learn" className="mt-6 space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="bg-gray-900/50 border-purple-500/30">
                    <CardHeader>
                      <CardTitle className="text-2xl text-white flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-blue-400" />
                        Learn & FAQ
                      </CardTitle>
                      <CardDescription className="text-gray-300">
                        Everything you need to know about crypto and NFTs
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
                        <PlayCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="text-red-300 font-semibold mb-1">Video Tutorial</h4>
                          <p className="text-sm text-red-200 mb-3">
                            Watch our beginner-friendly guide to getting started with GXCOIN
                          </p>
                          <Button
                            size="sm"
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => window.open('https://gxcoin.world', '_blank', 'noopener,noreferrer')}
                          >
                            <PlayCircle className="w-4 h-4 mr-2" />
                            Watch Tutorial
                            <ExternalLink className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h3>
                        <Accordion type="single" collapsible className="space-y-2">
                          {cryptoFAQs.map((faq, index) => (
                            <AccordionItem
                              key={index}
                              value={`faq-${index}`}
                              className="bg-gray-800/50 border border-gray-700 rounded-lg px-4"
                            >
                              <AccordionTrigger className="text-white hover:text-purple-400">
                                <div className="flex items-center gap-2">
                                  <HelpCircle className="w-4 h-4 text-purple-400" />
                                  {faq.question}
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="text-gray-300 leading-relaxed">
                                {renderGlossaryTooltip(faq.answer)}
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </div>

                      <div>
                        <h3 className="text-xl font-bold text-white mb-4">Glossary of Terms</h3>
                        <div className="grid md:grid-cols-2 gap-3">
                          {glossaryTerms.slice(0, 8).map((term, index) => (
                            <Tooltip key={index}>
                              <TooltipTrigger asChild>
                                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 hover:border-purple-500/50 transition-all cursor-help">
                                  <p className="text-purple-400 font-semibold text-sm">{term.term}</p>
                                  <p className="text-gray-400 text-xs mt-1 line-clamp-2">{term.definition}</p>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-sm">
                                <p className="font-semibold">{term.term}</p>
                                <p className="text-sm mt-1">{term.definition}</p>
                                {term.example && (
                                  <p className="text-xs text-gray-400 mt-2 italic">Example: {term.example}</p>
                                )}
                              </TooltipContent>
                            </Tooltip>
                          ))}
                        </div>
                      </div>

                      <Button
                        onClick={() => {
                          markTabComplete('learn');
                          setCurrentTab('security');
                        }}
                        className="w-full"
                        variant="outline"
                      >
                        Continue to Security Tips
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              <TabsContent value="security" className="mt-6 space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="bg-gray-900/50 border-purple-500/30">
                    <CardHeader>
                      <CardTitle className="text-2xl text-white flex items-center gap-2">
                        <Shield className="w-6 h-6 text-green-400" />
                        Security Best Practices
                      </CardTitle>
                      <CardDescription className="text-gray-300">
                        Stay safe in the crypto world with these essential tips
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="bg-red-500/20 border-2 border-red-500 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-red-300 font-bold text-base mb-1">
                              CRITICAL: Protect Your Seed Phrase!
                            </p>
                            <p className="text-red-200 text-sm">
                              Your seed phrase is the key to everything. If someone gets it, they can steal all your funds. 
                              NEVER share it with anyone - not even GXCOIN support!
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-bold text-white mb-4">Security Checklist</h3>
                        <div className="space-y-3">
                          {securityBestPractices.map((practice) => (
                            <div
                              key={practice.id}
                              className={`p-4 rounded-lg border ${
                                practice.importance === 'critical'
                                  ? 'bg-red-500/10 border-red-500/30'
                                  : practice.importance === 'high'
                                  ? 'bg-orange-500/10 border-orange-500/30'
                                  : 'bg-blue-500/10 border-blue-500/30'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <CheckCircle
                                  className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                                    practice.importance === 'critical'
                                      ? 'text-red-400'
                                      : practice.importance === 'high'
                                      ? 'text-orange-400'
                                      : 'text-blue-400'
                                  }`}
                                />
                                <div>
                                  <p className="font-semibold text-white">{practice.title}</p>
                                  <p className="text-sm text-gray-300 mt-1">{practice.description}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-bold text-green-400 mb-3 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" />
                            DO's
                          </h3>
                          <div className="space-y-2">
                            {securityDosAndDonts.dos.map((item, index) => (
                              <div key={index} className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                                <p className="text-green-300 font-medium text-sm">{item.title}</p>
                                <p className="text-green-200 text-xs mt-1">{item.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-bold text-red-400 mb-3 flex items-center gap-2">
                            <X className="w-5 h-5" />
                            DON'Ts
                          </h3>
                          <div className="space-y-2">
                            {securityDosAndDonts.donts.map((item, index) => (
                              <div key={index} className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                                <p className="text-red-300 font-medium text-sm">{item.title}</p>
                                <p className="text-red-200 text-xs mt-1">{item.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Flag className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="text-yellow-300 font-semibold mb-2">Report a Scam</h4>
                            <p className="text-yellow-200 text-sm mb-3">
                              If you encounter a scam or suspicious activity, report it immediately to help protect the community.
                            </p>
                            <Button size="sm" variant="outline" className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10">
                              <Flag className="w-4 h-4 mr-2" />
                              Report Scam
                            </Button>
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={() => {
                          markTabComplete('security');
                          if (completedTabs.length + 1 === tabs.length) {
                            handleComplete();
                          }
                        }}
                        size="lg"
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      >
                        <Trophy className="w-5 h-5 mr-2" />
                        Complete Onboarding
                        <Sparkles className="w-5 h-5 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            </Tabs>
          </TooltipProvider>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-700">
            <Button variant="ghost" onClick={handleSkipTutorial} className="text-gray-400 hover:text-white">
              Skip Tutorial
            </Button>
            <p className="text-sm text-gray-500">
              {onboardingProgress.skipped && "You can resume anytime from your profile"}
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <MetaMaskOnboarding
        isOpen={showMetaMaskModal}
        onClose={() => setShowMetaMaskModal(false)}
        onComplete={handleMetaMaskComplete}
        onSkip={() => setShowMetaMaskModal(false)}
      />

      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <Confetti
              width={window.innerWidth}
              height={window.innerHeight}
              recycle={false}
              numberOfPieces={500}
            />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="bg-gradient-to-br from-purple-600 to-blue-600 p-8 rounded-2xl text-center max-w-md"
            >
              <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-2">Congratulations!</h2>
              <p className="text-blue-100 text-lg">
                You've completed the crypto onboarding! You're now ready to make environmental impact with GXCOIN.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
