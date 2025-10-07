import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { CheckCircle, Loader2, Zap, Rocket } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUser } from '@/lib/stores/useUser';

export function PurchaseSuccess() {
  const [, setLocation] = useLocation();
  const { isLoggedIn } = useUser();
  const [status, setStatus] = useState<'loading' | 'minting' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [nftDetails, setNftDetails] = useState<any>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');

    if (!sessionId) {
      setStatus('error');
      setErrorMessage('No session ID found');
      return;
    }

    const processPayment = async () => {
      try {
        // Verify payment and get NFT details
        const response = await fetch(`/api/stripe/verify-session?session_id=${sessionId}`);
        
        if (!response.ok) {
          throw new Error('Payment verification failed');
        }

        const data = await response.json();
        
        if (data.status === 'completed' && data.nftBadge) {
          setNftDetails(data.nftBadge);
          
          // Auto-mint the NFT (gasless - platform pays gas)
          setStatus('minting');
          
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
          
          setStatus('success');
          setShowConfetti(true);
          
          // Auto-redirect to missions after 5 seconds
          setTimeout(() => {
            setLocation('/');
            // Switch to game arena tab after redirect
            setTimeout(() => {
              const gameTab = document.querySelector('[data-value="game"]') as HTMLElement;
              if (gameTab) gameTab.click();
            }, 500);
          }, 5000);
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

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-blue-900 flex items-center justify-center">
        <Card className="bg-gray-900/80 backdrop-blur-sm border-blue-500/30 max-w-md mx-4">
          <CardContent className="p-8 text-center space-y-4">
            <Loader2 className="w-16 h-16 animate-spin text-blue-500 mx-auto" />
            <h2 className="text-2xl font-bold text-white">Verifying Payment...</h2>
            <p className="text-gray-400">Please wait while we confirm your purchase</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'minting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-blue-900 flex items-center justify-center">
        <Card className="bg-gray-900/80 backdrop-blur-sm border-purple-500/30 max-w-md mx-4">
          <CardContent className="p-8 text-center space-y-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Zap className="w-16 h-16 text-purple-500 mx-auto" />
            </motion.div>
            <h2 className="text-2xl font-bold text-white">Minting Your dNFT...</h2>
            <p className="text-gray-400">Creating your unique digital asset</p>
            <p className="text-sm text-green-400">✅ Gas fees covered by GXCOIN</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-blue-900 flex items-center justify-center p-4">
        {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-green-900/40 via-emerald-900/30 to-teal-900/40 backdrop-blur-sm border-green-500/50 max-w-lg">
            <CardContent className="p-8 text-center space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <CheckCircle className="w-24 h-24 text-green-500 mx-auto" />
              </motion.div>

              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-white">
                  🎉 Success!
                </h1>
                <p className="text-xl text-green-400">Your dNFT is Ready!</p>
              </div>

              {nftDetails && (
                <div className="bg-black/40 rounded-lg p-6 space-y-3 text-left">
                  <h3 className="text-lg font-bold text-white text-center mb-4">dNFT Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Hero:</span>
                      <span className="text-white font-bold">{nftDetails.heroId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Level:</span>
                      <span className="text-cyan-400">{nftDetails.level}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Rarity:</span>
                      <span className="text-purple-400">{nftDetails.rarity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <span className="text-green-400">✅ Minted</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <p className="text-gray-300">
                  Your dNFT has been successfully minted and is ready for missions!
                </p>
                <p className="text-sm text-gray-400">
                  Redirecting to your missions in 5 seconds...
                </p>
              </div>

              <Button
                onClick={() => {
                  setLocation('/');
                  setTimeout(() => {
                    const gameTab = document.querySelector('[data-value="game"]') as HTMLElement;
                    if (gameTab) gameTab.click();
                  }, 500);
                }}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-3"
              >
                <Rocket className="w-5 h-5 mr-2" />
                Start Your Mission Now
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-blue-900 flex items-center justify-center p-4">
        <Card className="bg-gray-900/80 backdrop-blur-sm border-red-500/30 max-w-md">
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
