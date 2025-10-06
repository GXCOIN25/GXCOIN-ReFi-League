import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  Shield,
  Download,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  Chrome,
  Smartphone,
  Key,
  Lock,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  Users,
  Trophy
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MetaMaskStep } from './MetaMaskStep';
import { useWallet } from '@/lib/stores/useWallet';

interface MetaMaskOnboardingProps {
  onComplete: () => void;
  onSkip: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const MetaMaskOnboarding: React.FC<MetaMaskOnboardingProps> = ({
  onComplete,
  onSkip,
  isOpen,
  onClose
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
  const [phraseConfirmations, setPhraseConfirmations] = useState({
    written: false,
    stored: false,
    understood: false
  });
  
  const { isConnected, address, connectWallet, isConnecting } = useWallet();
  
  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  useEffect(() => {
    checkMetaMaskInstallation();
  }, []);

  useEffect(() => {
    if (isConnected && currentStep === 4) {
      setTimeout(() => {
        setCurrentStep(5);
      }, 1000);
    }
  }, [isConnected, currentStep]);

  const checkMetaMaskInstallation = () => {
    const installed = typeof window.ethereum !== 'undefined';
    setIsMetaMaskInstalled(installed);
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onSkip();
    onClose();
  };

  const handleComplete = () => {
    onComplete();
    onClose();
  };

  const handleConnectWallet = async () => {
    await connectWallet();
  };

  const allConfirmationsChecked = Object.values(phraseConfirmations).every(v => v);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <MetaMaskStep
            title="Welcome to Web3!"
            description="Let's set up your digital wallet to unlock the power of dNFTs"
            icon={
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/50">
                <Wallet className="w-10 h-10 text-white" />
              </div>
            }
          >
            <Card className="bg-gray-900/50 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-orange-500" />
                  What is MetaMask?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300 text-sm">
                  MetaMask is your digital wallet—like a crypto bank account that lives in your browser. 
                  It lets you store, send, and receive digital assets securely.
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                    <Trophy className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-blue-300 font-medium text-sm">Why You Need It for dNFTs</p>
                      <p className="text-blue-200 text-xs mt-1">
                        Dynamic NFTs (dNFTs) are special digital collectibles that change based on real-world impact. 
                        Your wallet proves you own them and tracks your contributions.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                    <Shield className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-green-300 font-medium text-sm">You Control Your Keys</p>
                      <p className="text-green-200 text-xs mt-1">
                        Unlike traditional accounts, only YOU have access. No company can freeze, 
                        access, or control your wallet. You're the boss!
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
                    <Lock className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-purple-300 font-medium text-sm">Security First</p>
                      <p className="text-purple-200 text-xs mt-1">
                        MetaMask keeps your private keys encrypted on your device. 
                        Never share your secret phrase with anyone—not even us!
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </MetaMaskStep>
        );

      case 2:
        return (
          <MetaMaskStep
            title={isMetaMaskInstalled ? "MetaMask Detected! ✓" : "Install MetaMask"}
            description={
              isMetaMaskInstalled 
                ? "Great! MetaMask is already installed on your browser" 
                : "Download and install MetaMask to continue"
            }
            icon={
              <div className={`w-20 h-20 ${isMetaMaskInstalled ? 'bg-green-500' : 'bg-blue-500'} rounded-2xl flex items-center justify-center shadow-lg ${isMetaMaskInstalled ? 'shadow-green-500/50' : 'shadow-blue-500/50'}`}>
                {isMetaMaskInstalled ? (
                  <CheckCircle className="w-10 h-10 text-white" />
                ) : (
                  <Download className="w-10 h-10 text-white" />
                )}
              </div>
            }
          >
            {!isMetaMaskInstalled ? (
              <Card className="bg-gray-900/50 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white">Choose Your Platform</CardTitle>
                  <CardDescription>Select where you want to install MetaMask</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <a
                    href="https://metamask.io/download/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <div className="p-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 border border-purple-500/30 hover:border-purple-500/50 rounded-lg transition-all cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Chrome className="w-6 h-6 text-purple-400" />
                          <div>
                            <p className="text-white font-medium">Browser Extension</p>
                            <p className="text-gray-400 text-xs">Chrome, Firefox, Brave, Edge</p>
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </a>

                  <a
                    href="https://metamask.io/download/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <div className="p-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 border border-blue-500/30 hover:border-blue-500/50 rounded-lg transition-all cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Smartphone className="w-6 h-6 text-blue-400" />
                          <div>
                            <p className="text-white font-medium">Mobile App</p>
                            <p className="text-gray-400 text-xs">iOS & Android</p>
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </a>

                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-yellow-300 font-medium text-sm">Installation Steps</p>
                        <ol className="text-yellow-200 text-xs mt-2 space-y-1 list-decimal list-inside">
                          <li>Click the download link above</li>
                          <li>Add MetaMask to your browser/device</li>
                          <li>Come back here and click "Check Installation"</li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={checkMetaMaskInstallation}
                    className="w-full"
                    variant="outline"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Check if MetaMask is Installed
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                    >
                      <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-green-300 mb-2">Perfect!</h3>
                    <p className="text-green-200 text-sm">
                      MetaMask is installed and ready to use. Let's move to the next step!
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </MetaMaskStep>
        );

      case 3:
        return (
          <MetaMaskStep
            title="Secure Your Wallet"
            description="Understanding your Secret Recovery Phrase is crucial for wallet security"
            icon={
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/50">
                <Key className="w-10 h-10 text-white" />
              </div>
            }
          >
            <Card className="bg-gray-900/50 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-500" />
                  Secret Recovery Phrase Education
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-red-500/20 border-2 border-red-500 rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-300 font-bold text-base mb-1">NEVER SHARE YOUR SECRET PHRASE!</p>
                      <p className="text-red-200 text-sm">
                        Anyone with your secret phrase can steal ALL your funds. No legitimate service will EVER ask for it.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <TooltipProvider>
                    <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                      <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-blue-300 font-medium text-sm mb-1">What is it?</p>
                          <p className="text-blue-200 text-xs">
                            A Secret Recovery Phrase (also called seed phrase) is a series of 12-24 words that acts as the{' '}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="underline cursor-help">master key</span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Think of it like a master password that can restore your entire wallet</p>
                              </TooltipContent>
                            </Tooltip>
                            {' '}to your wallet. It can restore your wallet on any device.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
                      <div className="flex items-start gap-3">
                        <Lock className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-purple-300 font-medium text-sm mb-1">Why is it important?</p>
                          <p className="text-purple-200 text-xs">
                            If you lose access to your device, this phrase is the ONLY way to recover your wallet. 
                            No one (not even MetaMask) can reset it for you.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-green-300 font-medium text-sm mb-1">How to back it up safely?</p>
                          <ul className="text-green-200 text-xs mt-2 space-y-1.5">
                            <li className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                              Write it down on paper (never digital!)
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                              Store in multiple secure locations
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                              Never take screenshots or save in cloud
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                              Keep away from cameras and prying eyes
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </TooltipProvider>
                </div>

                <div className="border-t border-gray-700 pt-4 mt-4">
                  <p className="text-gray-400 text-sm font-medium mb-3">Please confirm you understand:</p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="written"
                        checked={phraseConfirmations.written}
                        onCheckedChange={(checked) =>
                          setPhraseConfirmations({ ...phraseConfirmations, written: checked as boolean })
                        }
                      />
                      <label
                        htmlFor="written"
                        className="text-sm text-gray-300 cursor-pointer leading-tight"
                      >
                        I will write down my secret phrase on paper (not digitally)
                      </label>
                    </div>
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="stored"
                        checked={phraseConfirmations.stored}
                        onCheckedChange={(checked) =>
                          setPhraseConfirmations({ ...phraseConfirmations, stored: checked as boolean })
                        }
                      />
                      <label
                        htmlFor="stored"
                        className="text-sm text-gray-300 cursor-pointer leading-tight"
                      >
                        I will store it in a safe, secure location
                      </label>
                    </div>
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="understood"
                        checked={phraseConfirmations.understood}
                        onCheckedChange={(checked) =>
                          setPhraseConfirmations({ ...phraseConfirmations, understood: checked as boolean })
                        }
                      />
                      <label
                        htmlFor="understood"
                        className="text-sm text-gray-300 cursor-pointer leading-tight"
                      >
                        I understand I should NEVER share this with anyone, including GXCOIN support
                      </label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </MetaMaskStep>
        );

      case 4:
        return (
          <MetaMaskStep
            title={isConnected ? "Wallet Connected! ✓" : "Connect Your Wallet"}
            description={
              isConnected
                ? "Successfully connected to GXCOIN"
                : "Connect MetaMask to start your journey with dNFTs"
            }
            icon={
              <div className={`w-20 h-20 ${isConnected ? 'bg-green-500' : 'bg-gradient-to-br from-purple-500 to-blue-600'} rounded-2xl flex items-center justify-center shadow-lg ${isConnected ? 'shadow-green-500/50' : 'shadow-purple-500/50'}`}>
                {isConnected ? (
                  <CheckCircle className="w-10 h-10 text-white" />
                ) : (
                  <Wallet className="w-10 h-10 text-white" />
                )}
              </div>
            }
          >
            {!isConnected ? (
              <Card className="bg-gray-900/50 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white">Connect MetaMask to GXCOIN</CardTitle>
                  <CardDescription>Allow GXCOIN to view your wallet address and request transactions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <h4 className="text-blue-300 font-medium text-sm mb-3">What permissions does GXCOIN need?</h4>
                    <div className="space-y-2">
                      <div className="flex items-start gap-3">
                        <Eye className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-blue-200 text-xs">
                            <strong>View wallet address:</strong> To identify your account and display your NFTs
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Users className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-blue-200 text-xs">
                            <strong>Request transactions:</strong> To let you mint NFTs and make contributions (you'll approve each one)
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <div>
                        <p className="text-green-300 font-medium text-sm mb-1">Safe & Secure</p>
                        <p className="text-green-200 text-xs">
                          GXCOIN can never access your funds without your explicit approval. 
                          You remain in full control of every transaction.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleConnectWallet}
                    disabled={isConnecting}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                    size="lg"
                  >
                    {isConnecting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Wallet className="w-4 h-4 mr-2" />
                        Connect MetaMask to GXCOIN
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30">
                <CardContent className="pt-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="text-center"
                  >
                    <div className="relative inline-block mb-4">
                      <CheckCircle className="w-20 h-20 text-green-400" />
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.2, 1] }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="absolute -top-2 -right-2"
                      >
                        <Sparkles className="w-8 h-8 text-yellow-400" />
                      </motion.div>
                    </div>
                    <h3 className="text-2xl font-bold text-green-300 mb-2">Successfully Connected!</h3>
                    <p className="text-green-200 text-sm mb-4">Your wallet is now linked to GXCOIN</p>
                    {address && (
                      <div className="bg-gray-900/50 rounded-lg p-3 inline-block">
                        <p className="text-gray-400 text-xs mb-1">Connected Address:</p>
                        <p className="text-white font-mono text-sm">
                          {address.slice(0, 6)}...{address.slice(-4)}
                        </p>
                      </div>
                    )}
                  </motion.div>
                </CardContent>
              </Card>
            )}
          </MetaMaskStep>
        );

      case 5:
        return (
          <MetaMaskStep
            title="You're All Set! 🎉"
            description="Your MetaMask wallet is ready to mint dNFTs and make real-world impact"
            icon={
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/50">
                <Trophy className="w-10 h-10 text-white" />
              </div>
            }
          >
            <Card className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  Congratulations!
                </CardTitle>
                <CardDescription>You've completed the MetaMask setup</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h4 className="text-white font-medium text-sm">Next Steps:</h4>
                  <div className="space-y-2">
                    <div className="flex items-start gap-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30 hover:bg-blue-500/20 transition-colors cursor-pointer">
                      <Wallet className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-blue-300 font-medium text-sm">Fund Your Wallet</p>
                        <p className="text-blue-200 text-xs">
                          Get some test ETH from a faucet to start minting NFTs
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-purple-500/10 rounded-lg border border-purple-500/30 hover:bg-purple-500/20 transition-colors cursor-pointer">
                      <Users className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-purple-300 font-medium text-sm">Browse Heroes</p>
                        <p className="text-purple-200 text-xs">
                          Explore our collection of impact-driven hero NFTs
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Card className="bg-gray-900/50 border-yellow-500/30">
                  <CardHeader>
                    <CardTitle className="text-yellow-400 text-sm">Quick Tips</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-300 text-xs">
                        <strong>DO:</strong> Keep your secret phrase offline and secure
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-300 text-xs">
                        <strong>DO:</strong> Verify transaction details before confirming
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-300 text-xs">
                        <strong>DON'T:</strong> Share your secret phrase with anyone
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-300 text-xs">
                        <strong>DON'T:</strong> Click suspicious links or connect to unknown sites
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Button
                  onClick={handleComplete}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                  size="lg"
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  Start Your Journey
                </Button>
              </CardContent>
            </Card>
          </MetaMaskStep>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 2:
        return isMetaMaskInstalled;
      case 3:
        return allConfirmationsChecked;
      case 4:
        return isConnected;
      default:
        return true;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-950 border-purple-500/30">
        <DialogHeader>
          <div className="flex items-center justify-between mb-4">
            <DialogTitle className="text-white">MetaMask Setup Wizard</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-gray-400 hover:text-white"
            >
              Skip Tutorial
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Step {currentStep} of {totalSteps}</span>
              <span className="text-gray-400">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </DialogHeader>

        <div className="mt-6">
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-800">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href="#"
                  className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                >
                  <HelpCircle className="w-4 h-4" />
                  Need Help?
                </a>
              </TooltipTrigger>
              <TooltipContent>
                <p>Visit our FAQ or contact support</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {currentStep < totalSteps ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="gap-2"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};
