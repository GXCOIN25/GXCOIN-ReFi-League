import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { 
  CreditCard, 
  Wallet, 
  Zap, 
  Shield, 
  Info, 
  Sparkles,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/lib/stores/useWallet';
import { useUser } from '@/lib/stores/useUser';
import { GXCoinAPI } from '@/lib/api';
import { getStripe, getPriceForRarity, estimateGasFee, type HeroRarity } from '@/lib/stripe';

interface StripeNFTPurchaseProps {
  heroId: string;
  heroName: string;
  heroRarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
  heroImage: string;
  onClose: () => void;
  onSuccess: (nftId: string) => void;
}

type PurchaseStep = 'select' | 'processing' | 'success' | 'error';

export function StripeNFTPurchase({
  heroId,
  heroName,
  heroRarity,
  heroImage,
  onClose,
  onSuccess
}: StripeNFTPurchaseProps) {
  const [step, setStep] = useState<PurchaseStep>('select');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [nftId, setNftId] = useState<string | null>(null);

  const { isConnected, balance, address } = useWallet();
  const { isLoggedIn } = useUser();
  
  const pricing = getPriceForRarity(heroRarity as HeroRarity);
  const gasFee = estimateGasFee();

  const handleCardPayment = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use direct Stripe payment links for heroes with configured links
      if (heroId === 'aqua_wtr') {
        window.location.href = 'https://buy.stripe.com/00w14fblMdFZg98dSc83C0u';
        return;
      } else if (heroId === 'gxcoin_anchor') {
        window.location.href = 'https://buy.stripe.com/00w8wHfC2fO7g98dSc83C0y';
        return;
      } else if (heroId === 'graphene_batt') {
        window.location.href = 'https://buy.stripe.com/dRm4grgG6fO78GG29u83C0x';
        return;
      } else if (heroId === 'trader_gcct') {
        window.location.href = 'https://buy.stripe.com/dRm4grgG6fO78GG29u83C0x';
        return;
      }
      
      const stripe = await getStripe();
      if (!stripe) {
        throw new Error('Stripe is not configured. Please contact support.');
      }

      // Use public endpoint for unauthenticated users
      const endpoint = isLoggedIn 
        ? '/api/stripe/create-checkout-session'
        : '/api/public/stripe/create-checkout-session';

      const headers = isLoggedIn 
        ? GXCoinAPI['getAuthHeaders']()
        : { 'Content-Type': 'application/json' };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          heroId,
          amount: pricing.price,
          email: undefined // Can be added if we want to collect email from unauthenticated users
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL returned from server');
      }
    } catch (err: any) {
      console.error('Card payment error:', err);
      setError(err.message || 'Payment failed. Please try again.');
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  const handleCryptoPayment = async () => {
    try {
      setLoading(true);
      setError(null);
      setStep('processing');

      if (!isLoggedIn) {
        throw new Error('Please login or create an account to pay with crypto');
      }

      if (!isConnected || !address) {
        throw new Error('Please connect your wallet first');
      }

      const balanceNum = parseFloat(balance || '0');
      const requiredAmount = pricing.price / 2000;
      
      if (balanceNum < requiredAmount) {
        throw new Error(`Insufficient balance. You need at least ${requiredAmount.toFixed(4)} ETH`);
      }

      throw new Error('Direct crypto payments are temporarily disabled. Please use card payment or buy crypto first through Stripe.');

    } catch (err: any) {
      console.error('Crypto payment error:', err);
      setError(err.message || 'Crypto payment failed. Please try again.');
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  const handleCryptoOnramp = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!address) {
        throw new Error('Please connect your wallet first');
      }

      const response = await fetch('/api/stripe/create-onramp-session', {
        method: 'POST',
        headers: GXCoinAPI['getAuthHeaders'](),
        body: JSON.stringify({
          walletAddress: address,
          destinationCurrency: 'ETH',
          destinationNetwork: 'ethereum',
          sourceAmount: pricing.price
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create onramp session');
      }

      const { url } = await response.json();
      
      if (url) {
        window.location.href = url;
      }
    } catch (err: any) {
      console.error('Crypto onramp error:', err);
      setError(err.message || 'Failed to start crypto purchase. Please try again.');
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  const InfoTooltip = ({ 
    content, 
    children 
  }: { 
    content: string; 
    children: React.ReactNode 
  }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <button className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          {children}
          <Info className="w-4 h-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <p className="text-sm">{content}</p>
      </TooltipContent>
    </Tooltip>
  );

  return (
    <TooltipProvider>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl bg-gradient-to-br from-slate-900 via-purple-900/20 to-blue-900/20 border-purple-500/30">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Purchase Hero NFT
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Acquire your {heroRarity} hero and join the ReFi revolution
            </DialogDescription>
          </DialogHeader>

          {showConfetti && (
            <Confetti
              width={window.innerWidth}
              height={window.innerHeight}
              recycle={false}
              numberOfPieces={500}
            />
          )}

          <AnimatePresence mode="wait">
            {step === 'select' && (
              <motion.div
                key="select"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 p-6 border border-purple-500/30">
                  <div className="flex items-center gap-4">
                    <div className="relative w-24 h-24 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-4xl">
                      {heroImage}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white">{heroName}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          heroRarity === 'Legendary' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                          heroRarity === 'Epic' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                          heroRarity === 'Rare' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                          heroRarity === 'Mythic' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                          'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}>
                          {heroRarity}
                        </span>
                        <Sparkles className="w-4 h-4 text-yellow-400" />
                      </div>
                      <p className="text-sm text-gray-400 mt-2">
                        Dynamic NFT with real environmental impact
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-white">{pricing.displayPrice}</div>
                      <div className="text-xs text-gray-400">USD</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                    Choose Payment Method
                    <InfoTooltip content="Select how you want to purchase this NFT. Card payments are instant, crypto payments give you full ownership control.">
                      <span>Payment Info</span>
                    </InfoTooltip>
                  </h4>

                  {isLoggedIn && isConnected && balance && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="w-full">
                          <Button
                            disabled
                            className="w-full h-auto py-4 bg-gradient-to-r from-purple-600/50 to-blue-600/50 border border-purple-500/30 opacity-60 cursor-not-allowed relative"
                          >
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-3">
                                <Wallet className="w-5 h-5" />
                                <div className="text-left">
                                  <div className="font-semibold flex items-center gap-2">
                                    Pay with Crypto
                                    <span className="px-2 py-0.5 text-[10px] bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded">
                                      Coming Soon
                                    </span>
                                  </div>
                                  <div className="text-xs opacity-80">Balance: {balance} ETH</div>
                                </div>
                              </div>
                            </div>
                          </Button>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-sm font-semibold mb-1">Direct Crypto Payments Coming Soon!</p>
                        <p className="text-xs">We're implementing blockchain transaction verification to ensure secure crypto payments. For now, please use card payment or buy crypto first through Stripe.</p>
                      </TooltipContent>
                    </Tooltip>
                  )}

                  {!isLoggedIn && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="w-full">
                          <Button
                            disabled
                            className="w-full h-auto py-4 bg-gradient-to-r from-purple-600/50 to-blue-600/50 border border-purple-500/30 opacity-60 cursor-not-allowed"
                          >
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-3">
                                <Wallet className="w-5 h-5" />
                                <div className="text-left">
                                  <div className="font-semibold">Pay with Crypto</div>
                                  <div className="text-xs opacity-80">Login required</div>
                                </div>
                              </div>
                            </div>
                          </Button>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-sm">Create an account or login to pay with crypto. This ensures your NFT is properly minted and assigned to your account.</p>
                      </TooltipContent>
                    </Tooltip>
                  )}

                  <Button
                    onClick={handleCardPayment}
                    disabled={loading}
                    className="w-full h-auto py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5" />
                        <div className="text-left">
                          <div className="font-semibold">Pay with Card</div>
                          <div className="text-xs opacity-80 flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            Secure Stripe Checkout
                          </div>
                        </div>
                      </div>
                      <div className="text-lg font-bold">{pricing.displayPrice}</div>
                    </div>
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-700"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-slate-900 px-2 text-gray-400">OR</span>
                    </div>
                  </div>

                  {isLoggedIn ? (
                    <Button
                      onClick={handleCryptoOnramp}
                      disabled={loading}
                      variant="outline"
                      className="w-full h-auto py-4 border-dashed border-2 border-purple-500/30 hover:bg-purple-500/10"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          <Zap className="w-5 h-5 text-yellow-400" />
                          <div className="text-left">
                            <div className="font-semibold">Buy Crypto First</div>
                            <div className="text-xs opacity-70">
                              Buy crypto instantly with your card, then purchase NFT
                            </div>
                          </div>
                        </div>
                      </div>
                    </Button>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="w-full">
                          <Button
                            disabled
                            variant="outline"
                            className="w-full h-auto py-4 border-dashed border-2 border-purple-500/20 opacity-60 cursor-not-allowed"
                          >
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-3">
                                <Zap className="w-5 h-5 text-yellow-400" />
                                <div className="text-left">
                                  <div className="font-semibold">Buy Crypto First</div>
                                  <div className="text-xs opacity-70">
                                    Login required for crypto purchases
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Button>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-sm">Create an account or login to buy crypto and pay with cryptocurrency.</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <div className="flex gap-3">
                    <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="space-y-2 text-sm text-gray-300">
                      <InfoTooltip content="NFTs (Non-Fungible Tokens) are unique digital assets that prove ownership on the blockchain. Your hero NFT represents real environmental impact and can be traded or upgraded.">
                        <span className="font-semibold text-blue-400">What is an NFT?</span>
                      </InfoTooltip>
                      <p className="text-xs">
                        Your hero NFT is a unique digital asset with real environmental impact. 
                        It proves ownership and can be upgraded as you complete missions.
                      </p>
                      <InfoTooltip content="All payments are secured by Stripe, a trusted payment processor used by millions worldwide. Your card information is encrypted and never stored on our servers.">
                        <span className="font-semibold text-blue-400">Is my payment secure?</span>
                      </InfoTooltip>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'processing' && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center justify-center py-12 space-y-4"
              >
                <Loader2 className="w-16 h-16 animate-spin text-purple-400" />
                <h3 className="text-xl font-semibold text-white">Processing Payment...</h3>
                <p className="text-gray-400 text-center max-w-md">
                  Please confirm the transaction in your wallet. This may take a few moments.
                </p>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center justify-center py-12 space-y-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 260,
                    damping: 20 
                  }}
                >
                  <CheckCircle2 className="w-24 h-24 text-green-400" />
                </motion.div>
                <h3 className="text-2xl font-bold text-white">Purchase Successful!</h3>
                <div className="text-center space-y-2">
                  <p className="text-gray-300">
                    Congratulations! You now own <span className="font-semibold text-purple-400">{heroName}</span>
                  </p>
                  <p className="text-sm text-gray-400">
                    Your NFT has been added to your collection
                  </p>
                </div>
                <div className="relative w-32 h-32 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-6xl">
                  {heroImage}
                  <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-yellow-400 animate-pulse" />
                </div>
                <Button
                  onClick={() => {
                    if (nftId) onSuccess(nftId);
                  }}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  View in Heroes Collection
                </Button>
              </motion.div>
            )}

            {step === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center justify-center py-12 space-y-6"
              >
                <XCircle className="w-24 h-24 text-red-400" />
                <h3 className="text-2xl font-bold text-white">Payment Failed</h3>
                <div className="text-center space-y-2 max-w-md">
                  <p className="text-red-400 font-semibold">{error}</p>
                  <p className="text-sm text-gray-400">
                    Please check your payment details and try again, or contact support if the problem persists.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      setStep('select');
                      setError(null);
                    }}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    Try Again
                  </Button>
                  <Button
                    onClick={onClose}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {step === 'select' && (
            <div className="flex justify-between items-center pt-4 border-t border-gray-700">
              <Button
                onClick={onClose}
                variant="ghost"
                className="text-gray-400 hover:text-white"
              >
                Cancel
              </Button>
              <div className="text-xs text-gray-500">
                Powered by Stripe
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
