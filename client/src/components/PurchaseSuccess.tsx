import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { 
  CheckCircle, 
  Loader2, 
  Zap, 
  Rocket, 
  Download,
  Share2,
  Mail,
  Trophy,
  Sparkles,
  Star,
  Gift,
  Award,
  Copy,
  Check
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUser } from '@/lib/stores/useUser';

export function PurchaseSuccess() {
  const [, setLocation] = useLocation();
  const { isLoggedIn } = useUser();
  const [status, setStatus] = useState<'loading' | 'minting' | 'achievement' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [nftDetails, setNftDetails] = useState<any>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [progress, setProgress] = useState(0);
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const demoMode = urlParams.get('demo') === 'true';
    setIsDemoMode(demoMode);

    // Demo mode - show the full epic journey with mock data
    if (demoMode) {
      setShareUrl(`${window.location.origin}/?ref=demo123`);
      
      const runDemoFlow = async () => {
        // Stage 1: Loading with progress bar (2s)
        const progressInterval = setInterval(() => {
          setProgress(prev => {
            if (prev >= 100) {
              clearInterval(progressInterval);
              return 100;
            }
            return prev + 20;
          });
        }, 200);

        await new Promise(resolve => setTimeout(resolve, 2000));
        clearInterval(progressInterval);
        setProgress(100);

        // Stage 2: Minting animation (3s)
        setStatus('minting');
        setNftDetails({
          id: 1,
          heroId: 'aqua_wtr',
          level: 1,
          rarity: 'Platinum Limited Edition',
          edition: 247,
          totalEditions: 200000,
          attributes: {
            transactionHash: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890',
            mintedAt: new Date().toISOString(),
            gasPaidBy: 'GXCOIN Platform'
          }
        });

        await new Promise(resolve => setTimeout(resolve, 3000));

        // Stage 3: Achievement unlock (2s)
        setStatus('achievement');
        setShowConfetti(true);

        await new Promise(resolve => setTimeout(resolve, 2000));

        // Stage 4: Full success screen (10s with countdown)
        setStatus('success');
      };

      runDemoFlow();
      return;
    }

    if (!sessionId) {
      setStatus('error');
      setErrorMessage('No session ID found');
      return;
    }

    // Generate share URL
    setShareUrl(`${window.location.origin}/?ref=${sessionId.slice(-8)}`);

    const processPayment = async () => {
      try {
        // Simulate progress bar during verification
        const progressInterval = setInterval(() => {
          setProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 200);

        // Verify payment and get NFT details
        const response = await fetch(`/api/stripe/verify-session?session_id=${sessionId}`);
        
        if (!response.ok) {
          clearInterval(progressInterval);
          throw new Error('Payment verification failed');
        }

        const data = await response.json();
        setProgress(100);
        clearInterval(progressInterval);
        
        if (data.status === 'completed' && data.nftBadge) {
          // Use backend-provided NFT details with authentic edition numbers
          const nftData = {
            ...data.nftBadge,
            // Map backend field names to frontend display names
            edition: data.nftBadge.editionNumber,
            totalEditions: data.nftBadge.totalEditions,
            rarity: data.nftBadge.seriesName || data.nftBadge.rarity,
          };
          setNftDetails(nftData);
          
          // Wait a moment before minting
          setTimeout(() => {
            setStatus('minting');
          }, 500);
          
          // Auto-mint the NFT (gasless - platform pays gas)
          const mintResponse = await fetch('/api/nft/auto-mint', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sessionId,
              nftBadgeId: data.nftBadge.id,
            }),
          });

          if (!mintResponse.ok) {
            throw new Error('Minting failed');
          }

          const mintData = await mintResponse.json();
          console.log('NFT minted successfully:', mintData);
          
          // Show achievement unlock animation
          setTimeout(() => {
            setStatus('achievement');
            setShowConfetti(true);
            
            // Then show full success screen
            setTimeout(() => {
              setStatus('success');
            }, 2000);
          }, 3000);
        } else {
          throw new Error('Payment not completed');
        }
      } catch (error: any) {
        console.error('Payment processing error:', error);
        setStatus('error');
        setErrorMessage(error.message || 'Something went wrong');
      }
    };

    processPayment();
  }, [setLocation]);

  // Countdown timer
  useEffect(() => {
    if (status === 'success' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (status === 'success' && countdown === 0) {
      setLocation('/');
      setTimeout(() => {
        const gameTab = document.querySelector('[data-value="game"]') as HTMLElement;
        if (gameTab) gameTab.click();
      }, 500);
    }
  }, [status, countdown, setLocation]);

  const handleDownloadCertificate = () => {
    const editionNumber = nftDetails?.edition || 1;
    const totalEditions = nftDetails?.totalEditions || 200000;
    
    const certificate = `
🏆 GXCOIN PLATINUM SERIES dNFT CERTIFICATE 🏆
═══════════════════════════════════════════════

✨ EXCLUSIVE LIMITED EDITION ✨

Hero: ${nftDetails?.heroId || 'AQUA ($WTR)'}
Level: ${nftDetails?.level || 1}
Rarity: ${nftDetails?.rarity || 'Platinum Limited Edition'}
Edition: #${editionNumber} of ${totalEditions.toLocaleString()}
Status: ✅ MINTED & ACTIVE

You are now part of an exclusive group of 
Platinum holders worldwide!

Transaction Hash:
${nftDetails?.attributes?.transactionHash || 'Pending...'}

Premium Gas Coverage: GXCOIN PLATFORM

Issued: ${new Date().toLocaleString()}

Welcome to the Elite Eco-Warrior Revolution! 🌍
Start your exclusive missions at: ${window.location.origin}

═══════════════════════════════════════════════
    `.trim();

    const blob = new Blob([certificate], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GXCOIN-dNFT-Certificate-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShareTwitter = () => {
    const url = shareUrl || window.location.origin;
    const editionNumber = nftDetails?.edition || 1;
    const totalEditions = nftDetails?.totalEditions || 200000;
    const text = `🏆 I just secured my PLATINUM SERIES AQUA ($WTR) Eco-Warrior dNFT on @GXCOIN! 💎 Limited Edition #${editionNumber} of ${totalEditions.toLocaleString()}! Join the elite regenerative finance revolution! 🌍✨`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareFacebook = () => {
    const url = shareUrl || window.location.origin;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareLinkedIn = () => {
    const url = shareUrl || window.location.origin;
    const text = `I just secured my Platinum Series AQUA Eco-Warrior dNFT on GXCOIN! Limited Edition - one of only 200,000 worldwide. Join the elite regenerative finance revolution.`;
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank', 'noopener,noreferrer');
  };

  const handleCopyLink = () => {
    const url = shareUrl || window.location.origin;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendEmail = async () => {
    if (!email || !nftDetails) return;
    
    try {
      // In a real implementation, this would call your backend email service
      console.log('Sending email to:', email);
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 3000);
    } catch (error) {
      console.error('Email send failed:', error);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-blue-900 flex items-center justify-center p-4">
        <Card className="bg-gray-900/80 backdrop-blur-sm border-blue-500/30 max-w-md w-full mx-4">
          <CardContent className="p-8 text-center space-y-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="w-20 h-20 text-blue-500 mx-auto" />
            </motion.div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Verifying Payment...</h2>
              <p className="text-gray-400">Securing your dNFT on the blockchain</p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="text-sm text-cyan-400">{progress}% Complete</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'minting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900 flex items-center justify-center p-4">
        <Card className="bg-gray-900/80 backdrop-blur-sm border-slate-400/50 max-w-md w-full mx-4 relative overflow-hidden shadow-2xl shadow-slate-500/30">
          {/* Animated background gradient */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-slate-500/20 via-gray-400/20 to-slate-500/20"
            animate={{ 
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            style={{ backgroundSize: '200% 200%' }}
          />
          
          <CardContent className="p-8 text-center space-y-6 relative z-10">
            <motion.div
              animate={{ 
                rotate: 360,
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              <Zap className="w-24 h-24 text-slate-300 mx-auto drop-shadow-[0_0_25px_rgba(203,213,225,0.8)]" />
            </motion.div>
            
            <div className="space-y-3">
              <div className="inline-block bg-gradient-to-r from-slate-400 to-gray-400 text-black px-4 py-1 rounded-full text-sm font-bold mb-2">
                ✨ PLATINUM SERIES ✨
              </div>
              <h2 className="text-3xl font-bold text-white">
                Limited Edition Minting...
              </h2>
              <p className="text-xl text-slate-300">Forging Your Exclusive Platinum Warrior</p>
              <motion.p 
                className="text-lg text-amber-400 font-semibold"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                🏆 Premium Gas Coverage by GXCOIN 🏆
              </motion.p>
            </div>

            {/* Sparkle Effects */}
            <div className="flex justify-center gap-4">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    y: [-20, 0, -20],
                    opacity: [0, 1, 0]
                  }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity,
                    delay: i * 0.2 
                  }}
                >
                  <Sparkles className="w-6 h-6 text-amber-400" />
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'achievement') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900 flex items-center justify-center p-4">
        {showConfetti && <Confetti recycle={false} numberOfPieces={2000} />}
        
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 200 }}
          className="text-center"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <Trophy className="w-32 h-32 text-slate-300 mx-auto drop-shadow-[0_0_40px_rgba(203,213,225,1)]" />
          </motion.div>
          
          <motion.h1
            className="text-5xl font-bold bg-gradient-to-r from-slate-300 via-gray-200 to-slate-300 bg-clip-text text-transparent mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            🏆 PLATINUM EDITION UNLOCKED! 🏆
          </motion.h1>
          
          <motion.p
            className="text-2xl text-amber-400 mt-4 font-bold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Exclusive Limited Series Activated!
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900 flex items-center justify-center p-4 overflow-y-auto">
        {showConfetti && <Confetti recycle={true} numberOfPieces={500} />}
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          <Card className="bg-gradient-to-br from-slate-900/60 via-gray-800/50 to-zinc-900/60 backdrop-blur-sm border-slate-400/50 shadow-2xl shadow-slate-400/30">
            <CardContent className="p-8 space-y-6">
              {/* Success Header */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="text-center"
              >
                <Trophy className="w-28 h-28 text-slate-300 mx-auto drop-shadow-[0_0_30px_rgba(203,213,225,0.8)]" />
                <div className="inline-block bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 text-black px-6 py-2 rounded-full text-sm font-bold mt-4 mb-3 shadow-lg shadow-amber-500/50">
                  ✨ PLATINUM LIMITED EDITION ✨
                </div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-200 via-gray-100 to-slate-200 bg-clip-text text-transparent mt-2">
                  🏆 PLATINUM SERIES SECURED! 🏆
                </h1>
                <p className="text-2xl text-amber-400 mt-3 font-bold">
                  Your Exclusive Limited Edition Eco-Warrior dNFT is Live!
                </p>
                <p className="text-sm text-slate-400 mt-2">
                  You're now part of an exclusive group of Platinum holders
                </p>
              </motion.div>

              {/* NFT Details Card with Glow Effect */}
              {nftDetails && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-black/60 rounded-xl p-6 border-2 border-slate-400/40 shadow-[0_0_40px_rgba(203,213,225,0.4)]"
                >
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black px-4 py-1 rounded-full text-xs font-bold">
                      PLATINUM SERIES
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Award className="w-6 h-6 text-amber-400" />
                    <h3 className="text-xl font-bold text-white">Your Exclusive dNFT Badge</h3>
                    <Award className="w-6 h-6 text-amber-400" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-gradient-to-br from-slate-800/60 to-gray-800/60 rounded-lg p-3 border border-slate-500/40">
                      <p className="text-gray-400 text-xs mb-1">Hero</p>
                      <p className="text-white font-bold text-lg">{nftDetails.heroId === 'aqua_wtr' ? 'AQUA ($WTR)' : nftDetails.heroId}</p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-900/40 to-yellow-900/40 rounded-lg p-3 border border-amber-500/40">
                      <p className="text-gray-400 text-xs mb-1">Level</p>
                      <p className="text-amber-400 font-bold text-lg flex items-center gap-1">
                        <Star className="w-4 h-4" /> {nftDetails.level}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-slate-900/60 to-zinc-900/60 rounded-lg p-3 border border-slate-400/40">
                      <p className="text-gray-400 text-xs mb-1">Rarity</p>
                      <p className="text-slate-300 font-bold text-lg">{nftDetails.rarity}</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 rounded-lg p-3 border border-green-500/30">
                      <p className="text-gray-400 text-xs mb-1">Status</p>
                      <p className="text-green-400 font-bold text-lg">✅ Active</p>
                    </div>
                  </div>

                  {/* Always show Platinum edition info - universal for all purchases */}
                  <div className="mt-4 bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-lg p-3 border border-amber-500/30">
                    <p className="text-center text-amber-400 font-bold text-sm">
                      🏆 LIMITED EDITION #{nftDetails.edition || 1} of {(nftDetails.totalEditions || 200000).toLocaleString()} 🏆
                    </p>
                    <p className="text-center text-xs text-gray-400 mt-1">
                      Exclusive worldwide collectible
                    </p>
                  </div>

                  {nftDetails.attributes?.transactionHash && (
                    <div className="mt-4 bg-gray-800/50 rounded-lg p-3">
                      <p className="text-gray-400 text-xs mb-1">Transaction Hash</p>
                      <p className="text-cyan-400 text-xs font-mono break-all">
                        {nftDetails.attributes.transactionHash}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Action Buttons Grid */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="space-y-4"
              >
                {/* Demo Mode Purchase CTA */}
                {isDemoMode && (
                  <div className="space-y-3">
                    <Button
                      asChild
                      className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold py-4 text-lg shadow-lg shadow-amber-500/50 transition-all duration-300"
                    >
                      <a 
                        href="https://buy.stripe.com/00w14fblMdFZg98dSc83C0u" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center"
                      >
                        💎 Claim Your Platinum Series AQUA dNFT (from $175+)
                      </a>
                    </Button>
                    <p className="text-center text-sm text-amber-400 font-medium">
                      Ready to join the exclusive Platinum holders club?
                    </p>
                    <div className="relative py-3">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-600"></div>
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="bg-gradient-to-br from-slate-900/60 via-gray-800/50 to-zinc-900/60 px-2 text-gray-400">
                          or continue exploring
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Primary CTA */}
                <Button
                  onClick={() => {
                    setLocation('/');
                    setTimeout(() => {
                      const gameTab = document.querySelector('[data-value="game"]') as HTMLElement;
                      if (gameTab) gameTab.click();
                    }, 500);
                  }}
                  className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-black font-bold py-4 text-lg shadow-lg shadow-amber-500/50"
                >
                  <Rocket className="w-6 h-6 mr-2" />
                  Start Your Exclusive Platinum Mission!
                </Button>

                {/* Share Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={handleDownloadCertificate}
                    variant="outline"
                    className="border-amber-500/50 hover:bg-amber-500/20 text-white"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Platinum Certificate
                  </Button>
                  <Button
                    onClick={handleCopyLink}
                    variant="outline"
                    className="border-slate-400/50 hover:bg-slate-500/20 text-white"
                  >
                    {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copied ? 'Copied!' : 'Copy Link'}
                  </Button>
                </div>

                {/* Social Share Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    onClick={handleShareTwitter}
                    variant="outline"
                    size="sm"
                    className="border-blue-400/50 hover:bg-blue-400/20 text-white"
                  >
                    <Share2 className="w-4 h-4 mr-1" />
                    Twitter
                  </Button>
                  <Button
                    onClick={handleShareFacebook}
                    variant="outline"
                    size="sm"
                    className="border-blue-600/50 hover:bg-blue-600/20 text-white"
                  >
                    <Share2 className="w-4 h-4 mr-1" />
                    Facebook
                  </Button>
                  <Button
                    onClick={handleShareLinkedIn}
                    variant="outline"
                    size="sm"
                    className="border-blue-700/50 hover:bg-blue-700/20 text-white"
                  >
                    <Share2 className="w-4 h-4 mr-1" />
                    LinkedIn
                  </Button>
                </div>

                {/* Email Confirmation */}
                <div className="bg-black/40 rounded-lg p-4 border border-slate-600">
                  <p className="text-sm text-slate-300 mb-2">📧 Get your Platinum certificate via email:</p>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-gray-800 border-slate-600 text-white"
                    />
                    <Button
                      onClick={handleSendEmail}
                      size="sm"
                      variant="outline"
                      className="border-amber-500/50 hover:bg-amber-500/20"
                      disabled={emailSent}
                    >
                      {emailSent ? <Check className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                    </Button>
                  </div>
                  {emailSent && (
                    <p className="text-xs text-green-400 mt-2">✅ Certificate sent successfully!</p>
                  )}
                </div>
              </motion.div>

              {/* Countdown Timer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-center"
              >
                <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-lg p-3 border border-amber-500/30">
                  <p className="text-sm text-slate-300">
                    <Gift className="w-4 h-4 inline mr-1" />
                    Auto-redirecting to your exclusive Platinum missions in
                  </p>
                  <motion.p 
                    className="text-3xl font-bold text-amber-400 mt-1"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    {countdown}
                  </motion.p>
                  <p className="text-xs text-gray-400 mt-1">seconds</p>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-900 flex items-center justify-center p-4">
        <Card className="bg-gray-900/80 backdrop-blur-sm border-red-500/30 max-w-md w-full">
          <CardContent className="p-8 text-center space-y-4">
            <div className="text-red-500 text-6xl">⚠️</div>
            <h2 className="text-2xl font-bold text-white">Payment Issue</h2>
            <p className="text-gray-400">{errorMessage}</p>
            <p className="text-sm text-gray-500">
              Please contact support if you were charged but didn't receive your dNFT.
            </p>
            <Button
              onClick={() => setLocation('/')}
              className="w-full bg-blue-600 hover:bg-blue-500"
            >
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
