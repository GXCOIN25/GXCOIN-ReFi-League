import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Trophy, Gift, Users, Clock, Copy, Share2, 
  CheckCircle2, AlertCircle, Sparkles, Award,
  TrendingUp, Zap, Crown, Star, Wallet, Target,
  Coins, Rocket, Shield, DollarSign, UserPlus,
  ArrowRight, ChevronRight, Gamepad2, Swords,
  CreditCard, Percent, Timer, ShoppingBag
} from "lucide-react";
import { FaFacebook, FaLinkedin, FaInstagram, FaTiktok } from "react-icons/fa";
import Confetti from "react-confetti";
import { toast } from "sonner";
import { useWallet } from "@/lib/stores/useWallet";
import { useUser } from "@/lib/stores/useUser";
import BlackCardEnrollmentForm from "@/components/BlackCardEnrollmentForm";

// Hero-specific color themes matching TokenBadge
const HERO_THEMES = {
  aqua_wtr: {
    primary: "#3b82f6",
    gradient: ["#3b82f6", "#2563eb", "#1d4ed8"],
    name: "AQUA",
    symbol: "WTR",
    icon: "💧"
  },
  voltra_gpwr: {
    primary: "#f59e0b",
    gradient: ["#f59e0b", "#d97706", "#b45309"],
    name: "VOLTRA",
    symbol: "GPWR",
    icon: "⚡"
  },
  graphene_batt: {
    primary: "#fb923c",
    gradient: ["#fb923c", "#f97316", "#ea580c"],
    name: "GRAPHENE",
    symbol: "BATT",
    icon: "🔋"
  },
  trader_gcct: {
    primary: "#22c55e",
    gradient: ["#22c55e", "#16a34a", "#15803d"],
    name: "CARBON",
    symbol: "GCCT",
    icon: "📈"
  },
  hemp_builder: {
    primary: "#84cc16",
    gradient: ["#84cc16", "#65a30d", "#4d7c0f"],
    name: "HEMP",
    symbol: "HEMP",
    icon: "🌿"
  },
  gxcoin_anchor: {
    primary: "#ffd700",
    gradient: ["#ffd700", "#ffb300", "#ff8f00"],
    name: "GXCOIN",
    symbol: "GXCOIN",
    icon: "👑"
  }
} as const;

interface Campaign {
  id: number;
  name: string;
  description: string;
  heroId: string;
  tokenSymbol: string;
  totalAllocation: number;
  claimedAmount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  eligibilityRequirement?: string;
  claimAmount?: number;
}

interface EligibilityStatus {
  eligible: boolean;
  reason?: string;
  alreadyClaimed?: boolean;
}

interface ReferralStats {
  totalReferrals: number;
  tier: string;
  totalBonus: number;
  referralCode: string | null;
}

interface LeaderboardEntry {
  rank: number;
  username: string;
  totalClaimed: number;
  referrals: number;
}

// Countdown Timer Component
const CountdownTimer: React.FC<{ endDate: string }> = ({ endDate }) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(endDate).getTime() - new Date().getTime();
      
      if (difference <= 0) {
        setTimeLeft(null);
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [endDate]);

  if (!timeLeft) {
    return <span className="text-red-400 font-semibold">Ended</span>;
  }

  return (
    <div className="flex gap-2 items-center">
      <Clock className="h-4 w-4" />
      <span className="font-mono text-sm">
        {timeLeft.days > 0 && `${timeLeft.days}d `}
        {String(timeLeft.hours).padStart(2, '0')}:
        {String(timeLeft.minutes).padStart(2, '0')}:
        {String(timeLeft.seconds).padStart(2, '0')}
      </span>
    </div>
  );
};

// Campaign Card Component
const CampaignCard: React.FC<{
  campaign: Campaign;
  eligibility: EligibilityStatus | null;
  onClaim: (campaignId: number) => void;
  claiming: boolean;
  isLoggedIn: boolean;
}> = ({ campaign, eligibility, onClaim, claiming, isLoggedIn }) => {
  const theme = HERO_THEMES[campaign.heroId as keyof typeof HERO_THEMES] || HERO_THEMES.gxcoin_anchor;
  const progressPercentage = (campaign.claimedAmount / campaign.totalAllocation) * 100;
  const remainingAllocation = campaign.totalAllocation - campaign.claimedAmount;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      className="h-full"
    >
      <Card 
        className="relative overflow-hidden border-2 h-full"
        style={{
          borderColor: theme.primary + '40',
          background: `linear-gradient(135deg, ${theme.gradient[0]}10 0%, transparent 50%, ${theme.gradient[2]}05 100%)`
        }}
      >
        {/* Shimmer effect for active campaigns */}
        {campaign.isActive && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full"
            animate={{
              translateX: ['100%', '100%', '-100%', '-100%']
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        )}

        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="text-3xl p-2 rounded-lg"
                style={{ backgroundColor: theme.primary + '20' }}
              >
                {theme.icon}
              </div>
              <div>
                <CardTitle className="text-white text-xl">{campaign.name}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    variant="outline"
                    style={{ color: theme.primary, borderColor: theme.primary }}
                  >
                    ${theme.symbol}
                  </Badge>
                  {campaign.isActive ? (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500">
                      Live
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-500/20 text-gray-400 border-gray-500">
                      Ended
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            {eligibility?.eligible && !eligibility?.alreadyClaimed && (
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Gift className="h-6 w-6 text-yellow-400" />
              </motion.div>
            )}
          </div>
          <CardDescription className="text-gray-300 mt-3">
            {campaign.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Allocation Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Allocation Claimed</span>
              <span className="text-white font-semibold">
                {progressPercentage.toFixed(1)}%
              </span>
            </div>
            <Progress 
              value={progressPercentage} 
              className="h-2"
              style={{
                backgroundColor: theme.primary + '20'
              }}
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>{campaign.claimedAmount.toLocaleString()} claimed</span>
              <span>{remainingAllocation.toLocaleString()} remaining</span>
            </div>
          </div>

          <Separator className="bg-white/10" />

          {/* Time Remaining */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Time Remaining:</span>
            <CountdownTimer endDate={campaign.endDate} />
          </div>

          {/* Claim Amount */}
          {campaign.claimAmount && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Claim Amount:</span>
              <span className="text-white font-bold">
                {campaign.claimAmount.toLocaleString()} ${theme.symbol}
              </span>
            </div>
          )}

          {/* Eligibility Status */}
          <div className="space-y-2">
            {!isLoggedIn ? (
              <div className="flex items-center gap-2 text-yellow-400">
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm">Login to check eligibility</span>
              </div>
            ) : eligibility === null ? (
              <div className="flex items-center gap-2 text-gray-400">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400" />
                <span className="text-sm">Checking eligibility...</span>
              </div>
            ) : eligibility.alreadyClaimed ? (
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm font-semibold">Already Claimed!</span>
              </div>
            ) : eligibility.eligible ? (
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm font-semibold">You're Eligible!</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-yellow-400">
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm">{eligibility.reason || 'Not eligible'}</span>
              </div>
            )}
          </div>

          {/* Claim Button */}
          <Button
            className="w-full font-semibold"
            style={{ 
              backgroundColor: theme.primary,
              opacity: eligibility?.eligible && !eligibility?.alreadyClaimed && isLoggedIn ? 1 : 0.5
            }}
            disabled={!isLoggedIn || !eligibility?.eligible || eligibility?.alreadyClaimed || claiming || !campaign.isActive}
            onClick={() => onClaim(campaign.id)}
          >
            {!isLoggedIn ? (
              'Login to Claim'
            ) : claiming ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Claiming...
              </>
            ) : eligibility?.alreadyClaimed ? (
              'Claimed'
            ) : eligibility?.eligible ? (
              <>
                <Gift className="h-4 w-4 mr-2" />
                Claim Tokens
              </>
            ) : (
              'Not Eligible'
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Main Component
export default function AirdropCampaignHub({ onOpenLogin, onSwitchToTab }: { onOpenLogin?: () => void; onSwitchToTab?: (tab: string) => void }) {
  const { isConnected } = useWallet();
  const { isLoggedIn } = useUser();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [eligibilityMap, setEligibilityMap] = useState<Map<number, EligibilityStatus>>(new Map());
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showVisaCardForm, setShowVisaCardForm] = useState(false);
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [referralLink, setReferralLink] = useState<string>('');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [showNextSteps, setShowNextSteps] = useState(false);
  
  // Countdown timer for 30-day offer (set end date to 30 days from now)
  const [timeLeft, setTimeLeft] = useState({ days: 30, hours: 0, minutes: 0, seconds: 0 });
  
  // Calculate countdown timer
  useEffect(() => {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30); // 30 days from now
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = endDate.getTime() - now;
      
      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Fetch campaigns on mount
  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Fetch eligibility for each campaign when user is logged in
  useEffect(() => {
    if (isLoggedIn && campaigns.length > 0) {
      campaigns.forEach(campaign => {
        checkEligibility(campaign.id);
      });
    }
  }, [isLoggedIn, campaigns.length]);

  // Fetch referral stats when connected
  useEffect(() => {
    if (isConnected) {
      fetchReferralStats();
    }
  }, [isConnected]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/airdrops/campaigns');
      
      if (!response.ok) {
        throw new Error('Failed to fetch campaigns');
      }

      const data = await response.json();
      setCampaigns(data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const checkEligibility = async (campaignId: number) => {
    try {
      const token = localStorage.getItem('gxcoin_token');
      const response = await fetch(`/api/airdrops/eligibility/${campaignId}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (!response.ok) {
        throw new Error('Failed to check eligibility');
      }

      const data = await response.json();
      setEligibilityMap(prev => new Map(prev).set(campaignId, data));
    } catch (error) {
      console.error(`Error checking eligibility for campaign ${campaignId}:`, error);
    }
  };

  const handleClaim = async (campaignId: number) => {
    // Allow claims if logged in (even without wallet connection for demo users)
    if (!isLoggedIn) {
      toast.error('Please create an account or login first');
      return;
    }

    try {
      setClaiming(true);
      const token = localStorage.getItem('gxcoin_token');
      const response = await fetch('/api/airdrops/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ campaignId })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to claim tokens');
      }

      const data = await response.json();
      
      // Show success
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
      
      // Show next steps guide
      setShowNextSteps(true);
      
      toast.success(`🎉 Success! You claimed ${data.amount} tokens!`, {
        description: `Next: Purchase dNFT Pass to enter the Arena and start battling! 🎮`,
        duration: 10000
      });

      // Refresh campaign data
      await fetchCampaigns();
      await checkEligibility(campaignId);

      // After first claim, scroll to next steps section
      setTimeout(() => {
        const nextStepsSection = document.getElementById('next-steps-section');
        if (nextStepsSection) {
          nextStepsSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 1000);
    } catch (error) {
      console.error('Error claiming tokens:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to claim tokens');
    } finally {
      setClaiming(false);
    }
  };

  const fetchReferralStats = async () => {
    try {
      const token = localStorage.getItem('gxcoin_token');
      const response = await fetch('/api/referrals/stats', {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch referral stats');
      }

      const data = await response.json();
      setReferralStats(data);
    } catch (error) {
      console.error('Error fetching referral stats:', error);
    }
  };

  const generateReferralCode = async () => {
    console.log('🔗 Generate Referral Link clicked - isLoggedIn:', isLoggedIn);
    
    if (!isLoggedIn) {
      toast.error('Please create an account or login first');
      return;
    }

    try {
      const token = localStorage.getItem('gxcoin_token');
      console.log('🔑 Token exists:', !!token);
      
      const response = await fetch('/api/referrals/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ Server error:', errorData);
        throw new Error('Failed to generate referral code');
      }

      const data = await response.json();
      console.log('✅ Referral data received:', data);
      setReferralLink(data.referralLink);
      toast.success('Referral link generated!');
    } catch (error) {
      console.error('❌ Error generating referral code:', error);
      toast.error('Failed to generate referral code');
    }
  };

  const copyReferralLink = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      toast.success('Referral link copied to clipboard!');
    }
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent(`🚀 Join the GXCOIN Airdrop Campaign! Claim your tokens now and help save the planet! 🌍\n\n${referralLink}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const shareOnFacebook = () => {
    const link = referralLink || `${window.location.origin}/ref/${referralStats?.referralCode}`;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`, '_blank');
  };

  const shareOnLinkedIn = () => {
    const link = referralLink || `${window.location.origin}/ref/${referralStats?.referralCode}`;
    const title = encodeURIComponent('Join the GXCOIN Airdrop Campaign!');
    const summary = encodeURIComponent('Claim your tokens now and help save the planet! 🌍');
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`, '_blank');
  };

  const shareOnInstagram = () => {
    const link = referralLink || `${window.location.origin}/ref/${referralStats?.referralCode}`;
    // Instagram doesn't have a direct share URL, so copy link and open Instagram
    navigator.clipboard.writeText(`🚀 Join the GXCOIN Airdrop! Claim tokens & save the planet! 🌍\n\n${link}`);
    toast.success('Link copied! Paste it in your Instagram post or story', { duration: 5000 });
    window.open('https://www.instagram.com/', '_blank');
  };

  const shareOnTikTok = () => {
    const link = referralLink || `${window.location.origin}/ref/${referralStats?.referralCode}`;
    // TikTok doesn't have a direct share URL for external links, so copy and open TikTok
    navigator.clipboard.writeText(`🚀 Join the GXCOIN Airdrop! Claim tokens & save the planet! 🌍\n\n${link}`);
    toast.success('Link copied! Paste it in your TikTok video description', { duration: 5000 });
    window.open('https://www.tiktok.com/', '_blank');
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'Gold': return <Crown className="h-5 w-5 text-yellow-400" />;
      case 'Silver': return <Star className="h-5 w-5 text-gray-300" />;
      default: return <Award className="h-5 w-5 text-amber-600" />;
    }
  };

  const groupedCampaigns = useMemo(() => {
    const groups: Record<string, Campaign[]> = {};
    campaigns.forEach(campaign => {
      if (!groups[campaign.heroId]) {
        groups[campaign.heroId] = [];
      }
      groups[campaign.heroId].push(campaign);
    });
    return groups;
  }, [campaigns]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto" />
          <p className="text-white mt-4 text-lg">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}
      
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <Sparkles className="h-8 w-8 text-purple-400" />
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
            Airdrop Campaign Hub
          </h1>
          <Sparkles className="h-8 w-8 text-purple-400" />
        </div>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
          Claim exclusive hero tokens, earn referral bonuses, and join the movement to save the planet!
        </p>
      </motion.div>

      {/* Epic Demo Section - How It Works */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="max-w-7xl mx-auto mb-16"
      >
        <Card className="bg-gradient-to-br from-purple-900/30 via-pink-900/20 to-purple-900/30 border-2 border-purple-500/30 backdrop-blur-sm overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <CardHeader className="relative">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Rocket className="h-8 w-8 text-purple-400" />
              <CardTitle className="text-3xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text">
                How GXCOIN Airdrops Work
              </CardTitle>
            </div>
            <CardDescription className="text-center text-gray-300 text-lg">
              Get rewarded for taking environmental action - it's simple, profitable, and planet-saving!
            </CardDescription>
          </CardHeader>
          <CardContent className="relative">
            {/* Step-by-Step Guide */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              {[
                {
                  icon: <Wallet className="h-8 w-8" />,
                  title: "1. Connect Wallet",
                  desc: "Link your Web3 wallet to participate in campaigns",
                  color: "from-blue-500 to-cyan-500"
                },
                {
                  icon: <Target className="h-8 w-8" />,
                  title: "2. Complete Actions",
                  desc: "Contribute to environmental causes and earn eligibility",
                  color: "from-green-500 to-emerald-500"
                },
                {
                  icon: <Coins className="h-8 w-8" />,
                  title: "3. Claim Tokens",
                  desc: "Receive hero tokens directly to your wallet",
                  color: "from-yellow-500 to-orange-500"
                },
                {
                  icon: <UserPlus className="h-8 w-8" />,
                  title: "4. Refer & Earn",
                  desc: "Invite friends and unlock massive bonuses",
                  color: "from-purple-500 to-pink-500"
                }
              ].map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="relative group"
                >
                  <Card className="h-full bg-black/40 border-gray-700 hover:border-purple-500/50 transition-all duration-300">
                    <CardContent className="pt-6 text-center">
                      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${step.color} bg-opacity-20 mb-3`}>
                        <div className="text-white">{step.icon}</div>
                      </div>
                      <h3 className="text-white font-bold mb-2">{step.title}</h3>
                      <p className="text-gray-400 text-sm">{step.desc}</p>
                      {index < 3 && (
                        <ChevronRight className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 h-8 w-8 text-purple-500" />
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <Separator className="bg-purple-500/20 my-8" />

            {/* Benefits & Features Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Benefits Column */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="h-6 w-6 text-yellow-400" />
                  <h3 className="text-xl font-bold text-white">Premium Benefits</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { icon: <DollarSign className="h-5 w-5 text-green-400" />, text: "Free token airdrops worth up to $10,000" },
                    { icon: <Shield className="h-5 w-5 text-blue-400" />, text: "Early access to exclusive hero NFT drops" },
                    { icon: <TrendingUp className="h-5 w-5 text-purple-400" />, text: "Governance rights in GXCOIN DAO" },
                    { icon: <Zap className="h-5 w-5 text-yellow-400" />, text: "Priority support & VIP community access" }
                  ].map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="flex items-start gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
                    >
                      {benefit.icon}
                      <span className="text-gray-300">{benefit.text}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Referral Commission Structure */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Users className="h-6 w-6 text-pink-400" />
                  <h3 className="text-xl font-bold text-white">Referral Commissions</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { tier: "Bronze", refs: "1-4 Referrals", bonus: "+5% Bonus Tokens", color: "from-orange-600 to-amber-600", icon: <Award className="h-5 w-5" /> },
                    { tier: "Silver", refs: "5-9 Referrals", bonus: "+15% Bonus Tokens", color: "from-gray-400 to-gray-500", icon: <Star className="h-5 w-5" /> },
                    { tier: "Gold", refs: "10+ Referrals", bonus: "+30% Bonus Tokens", color: "from-yellow-400 to-yellow-600", icon: <Crown className="h-5 w-5" /> }
                  ].map((tier, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className={`p-4 rounded-lg bg-gradient-to-r ${tier.color} bg-opacity-20 border border-white/10 hover:border-white/30 transition-all`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-white">{tier.icon}</div>
                          <div>
                            <div className="text-white font-bold">{tier.tier} Tier</div>
                            <div className="text-gray-300 text-sm">{tier.refs}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-transparent bg-gradient-to-r ${tier.color} bg-clip-text font-bold text-lg`}>
                            {tier.bonus}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Special Bonuses Banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-8 p-6 rounded-xl bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 border-2 border-purple-500/50"
            >
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg">🎁 Limited Time Bonus!</h4>
                    <p className="text-gray-300">First 1,000 claimers get 2X tokens + exclusive NFT badge</p>
                  </div>
                </div>
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold"
                  onClick={() => {
                    if (!isLoggedIn) {
                      onOpenLogin?.();
                      return;
                    }
                    // Scroll to campaigns section
                    window.scrollTo({ top: 900, behavior: 'smooth' });
                  }}
                >
                  Claim Now <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Limited Time Engagement Offers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="max-w-7xl mx-auto mb-16"
      >
        <Card className="border-4 border-yellow-500/50 bg-gradient-to-br from-yellow-900/30 via-orange-900/20 to-red-900/30 shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none" />
          
          {/* Countdown Header */}
          <CardHeader className="relative pb-6">
            <div className="text-center space-y-4">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-block"
              >
                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-lg px-6 py-2 border-none">
                  🔥 LIMITED TIME OFFERS
                </Badge>
              </motion.div>
              
              <h2 className="text-4xl font-bold text-transparent bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text">
                Exclusive Airdrop Member Benefits
              </h2>
              
              {/* Countdown Timer */}
              <div className="flex items-center justify-center gap-2 text-sm text-yellow-300">
                <Timer className="h-5 w-5 animate-pulse" />
                <span className="font-semibold">Offer Ends In:</span>
              </div>
              <div className="flex justify-center gap-4">
                {[
                  { value: timeLeft.days, label: 'Days' },
                  { value: timeLeft.hours, label: 'Hours' },
                  { value: timeLeft.minutes, label: 'Mins' },
                  { value: timeLeft.seconds, label: 'Secs' }
                ].map((unit, index) => (
                  <div key={index} className="bg-black/40 rounded-lg p-3 min-w-[70px]">
                    <div className="text-3xl font-bold text-white">{String(unit.value).padStart(2, '0')}</div>
                    <div className="text-xs text-gray-400 uppercase">{unit.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardHeader>

          <CardContent className="relative">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Offer 1: Visa Card */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 rounded-xl p-6 border-2 border-blue-500/50 hover:border-blue-400 transition-all cursor-pointer"
                onClick={() => {
                  console.log('🏦 Visa Card clicked - Opening enrollment form');
                  setShowVisaCardForm(true);
                }}
              >
                <div className="text-center space-y-3">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <CreditCard className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-white font-bold text-lg">GXCOIN Visa Card</h3>
                  <p className="text-gray-300 text-sm">Apply now and get exclusive rewards on eco-friendly purchases</p>
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/50">Early Access</Badge>
                </div>
              </motion.div>

              {/* Offer 2: Arena Missions */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 rounded-xl p-6 border-2 border-purple-500/50 hover:border-purple-400 transition-all cursor-pointer"
                onClick={() => {
                  console.log('🎮 Arena Missions clicked - isLoggedIn:', isLoggedIn, 'onSwitchToTab:', typeof onSwitchToTab);
                  if (!isLoggedIn) {
                    console.log('🔒 Not logged in, opening login modal');
                    onOpenLogin?.();
                    return;
                  }
                  console.log('✅ Switching to game tab');
                  onSwitchToTab?.('game');
                }}
              >
                <div className="text-center space-y-3">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                    <Gamepad2 className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-white font-bold text-lg">Arena Missions</h3>
                  <p className="text-gray-300 text-sm">Complete missions, earn XP, and unlock exclusive dNFT rewards</p>
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/50">Play Now</Badge>
                </div>
              </motion.div>

              {/* Offer 3: Limited Edition Platinum Series */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 rounded-xl p-6 border-2 border-gray-400/50 hover:border-gray-300 transition-all cursor-pointer"
                onClick={() => {
                  console.log('👑 Platinum Series clicked - isLoggedIn:', isLoggedIn, 'onSwitchToTab:', typeof onSwitchToTab);
                  if (!isLoggedIn) {
                    console.log('🔒 Not logged in, opening login modal');
                    onOpenLogin?.();
                    return;
                  }
                  console.log('✅ Switching to nfts tab');
                  onSwitchToTab?.('nfts');
                }}
              >
                <div className="text-center space-y-3">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                    <Crown className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-white font-bold text-lg">Platinum Series</h3>
                  <p className="text-gray-300 text-sm">Limited edition NFTs with exclusive discounts for airdrop members</p>
                  <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/50">VIP Access</Badge>
                </div>
              </motion.div>

              {/* Offer 4: 10% Off dNFTs */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-green-900/50 to-emerald-800/30 rounded-xl p-6 border-2 border-green-500/50 hover:border-green-400 transition-all cursor-pointer"
                onClick={() => {
                  console.log('💰 10% OFF dNFTs clicked - isLoggedIn:', isLoggedIn, 'onSwitchToTab:', typeof onSwitchToTab);
                  if (!isLoggedIn) {
                    console.log('🔒 Not logged in, opening login modal');
                    onOpenLogin?.();
                    return;
                  }
                  console.log('✅ Switching to nfts tab');
                  onSwitchToTab?.('nfts');
                }}
              >
                <div className="text-center space-y-3">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                    <Percent className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-white font-bold text-lg">10% OFF dNFTs</h3>
                  <p className="text-gray-300 text-sm">Save on all dNFT purchases - exclusive discount for airdrop participants</p>
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/50">Save Now</Badge>
                </div>
              </motion.div>
            </div>

            {/* Bottom CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8 text-center"
            >
              <p className="text-yellow-200 text-lg font-semibold mb-4">
                🎯 Claim your first airdrop to unlock ALL these exclusive benefits!
              </p>
              <Button
                size="lg"
                className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-600 hover:via-orange-600 hover:to-red-600 text-white font-bold text-lg px-10"
                onClick={() => {
                  console.log('🛍️ Claim Airdrop & Get Benefits clicked - isLoggedIn:', isLoggedIn);
                  if (!isLoggedIn) {
                    console.log('🔒 Not logged in, opening login modal');
                    onOpenLogin?.();
                    return;
                  }
                  console.log('📜 Scrolling to campaigns section');
                  window.scrollTo({ top: 1200, behavior: 'smooth' });
                }}
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                Claim Airdrop & Get Benefits
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Campaign Cards Grid */}
      <div className="max-w-7xl mx-auto space-y-12">
        {Object.entries(groupedCampaigns).map(([heroId, heroCampaigns]) => {
          const theme = HERO_THEMES[heroId as keyof typeof HERO_THEMES];
          
          return (
            <motion.div
              key={heroId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div 
                  className="text-2xl p-2 rounded-lg"
                  style={{ backgroundColor: theme.primary + '20' }}
                >
                  {theme.icon}
                </div>
                <h2 className="text-3xl font-bold text-white">
                  {theme.name} Campaigns
                </h2>
                <Badge 
                  variant="outline"
                  className="text-lg"
                  style={{ color: theme.primary, borderColor: theme.primary }}
                >
                  ${theme.symbol}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {heroCampaigns.map(campaign => (
                  <CampaignCard
                    key={campaign.id}
                    campaign={campaign}
                    eligibility={eligibilityMap.get(campaign.id) || null}
                    onClaim={handleClaim}
                    claiming={claiming}
                    isLoggedIn={isLoggedIn}
                  />
                ))}
              </div>
            </motion.div>
          );
        })}

        {campaigns.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="border-4 border-purple-500/50 bg-gradient-to-br from-purple-900/40 via-pink-900/30 to-purple-900/40 shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
              <CardContent className="relative pt-16 pb-12">
                <div className="text-center space-y-6">
                  {/* Arena Icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="mx-auto w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/50"
                  >
                    <Swords className="h-12 w-12 text-white" />
                  </motion.div>

                  {/* Title */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h2 className="text-4xl font-bold text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text mb-3">
                      Enter The Arena
                    </h2>
                    <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                      No campaigns right now? No problem! Jump into The Arena, battle for glory, and earn exclusive dNFT rewards!
                    </p>
                  </motion.div>

                  {/* Features Grid */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="grid md:grid-cols-3 gap-4 mt-8 mb-8"
                  >
                    <div className="bg-purple-900/40 rounded-lg p-4 border border-purple-500/30">
                      <Gamepad2 className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                      <h3 className="text-white font-bold mb-1">Battle & Win</h3>
                      <p className="text-gray-400 text-sm">Compete in epic battles</p>
                    </div>
                    <div className="bg-pink-900/40 rounded-lg p-4 border border-pink-500/30">
                      <Shield className="h-8 w-8 text-pink-400 mx-auto mb-2" />
                      <h3 className="text-white font-bold mb-1">Earn dNFTs</h3>
                      <p className="text-gray-400 text-sm">Unlock exclusive rewards</p>
                    </div>
                    <div className="bg-purple-900/40 rounded-lg p-4 border border-purple-500/30">
                      <Trophy className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                      <h3 className="text-white font-bold mb-1">Climb Ranks</h3>
                      <p className="text-gray-400 text-sm">Rise to the top</p>
                    </div>
                  </motion.div>

                  {/* CTA Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                  >
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 hover:from-purple-600 hover:via-pink-600 hover:to-purple-700 text-white font-bold text-lg px-8 py-6 shadow-lg shadow-purple-500/50"
                      onClick={() => {
                        console.log('⚔️ Enter The Arena clicked - isLoggedIn:', isLoggedIn, 'onSwitchToTab:', typeof onSwitchToTab);
                        if (!isLoggedIn) {
                          toast.info('Please login to access The Arena!');
                          console.log('🔒 Not logged in, opening login modal');
                          onOpenLogin?.();
                          return;
                        }
                        console.log('✅ Switching to game tab');
                        onSwitchToTab?.('game');
                      }}
                    >
                      <Swords className="mr-2 h-6 w-6" />
                      Enter The Arena
                      <ArrowRight className="ml-2 h-6 w-6" />
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-2 border-purple-500 text-purple-400 hover:bg-purple-500/20 font-bold text-lg px-8 py-6"
                      onClick={() => {
                        console.log('🛡️ View dNFT Collection clicked - isLoggedIn:', isLoggedIn, 'onSwitchToTab:', typeof onSwitchToTab);
                        if (!isLoggedIn) {
                          console.log('🔒 Not logged in, opening login modal');
                          onOpenLogin?.();
                          return;
                        }
                        console.log('✅ Switching to nfts tab');
                        onSwitchToTab?.('nfts');
                      }}
                    >
                      <Shield className="mr-2 h-5 w-5" />
                      View dNFT Collection
                    </Button>
                  </motion.div>

                  {/* Info Banner */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-6 p-4 bg-blue-900/30 rounded-lg border border-blue-500/30"
                  >
                    <p className="text-blue-300 text-sm">
                      💎 <strong>Pro Tip:</strong> Register now and get a starter dNFT to begin your Arena journey!
                    </p>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Next Steps Guide - Shows after first claim */}
      {showNextSteps && isLoggedIn && (
        <motion.div
          id="next-steps-section"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto my-12"
        >
          <Card className="border-4 border-green-500/50 bg-gradient-to-br from-green-900/30 to-emerald-900/30 shadow-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full animate-pulse">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-2xl">🎉 Claim Successful! What's Next?</CardTitle>
                    <CardDescription className="text-gray-300">
                      Maximize your earnings with these next steps
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-white"
                  onClick={() => setShowNextSteps(false)}
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Step 1: Purchase dNFT for Arena Access - PRIMARY CTA */}
                <Card className="bg-gradient-to-br from-pink-600/40 to-purple-600/40 border-pink-500 border-2 hover:border-pink-400 transition-all cursor-pointer shadow-lg shadow-pink-500/20" onClick={() => {
                  setShowNextSteps(false);
                  onSwitchToTab?.('nfts');
                }}>
                  <CardContent className="pt-6">
                    <div className="text-center space-y-3">
                      <div className="mx-auto w-14 h-14 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center animate-pulse">
                        <Shield className="h-7 w-7 text-white" />
                      </div>
                      <h3 className="text-white font-bold text-lg">1. Enter the Arena 🎮</h3>
                      <p className="text-gray-200 text-sm font-medium">Purchase dNFT Pass to unlock exclusive Arena battles!</p>
                      <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 font-bold">
                        Get Arena Pass <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Step 2: Generate Referral Link */}
                <Card className="bg-purple-900/30 border-purple-500/50 hover:border-purple-500 transition-all cursor-pointer" onClick={() => {
                  setShowNextSteps(false);
                  setTimeout(() => {
                    const referralSection = document.getElementById('referral-section');
                    if (referralSection) {
                      referralSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }, 100);
                }}>
                  <CardContent className="pt-6">
                    <div className="text-center space-y-3">
                      <div className="mx-auto w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-white font-bold">2. Share & Earn</h3>
                      <p className="text-gray-300 text-sm">Generate referral link for up to 30% bonus!</p>
                      <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                        Generate Link <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Step 3: Claim More Campaigns */}
                <Card className="bg-blue-900/30 border-blue-500/50 hover:border-blue-500 transition-all cursor-pointer" onClick={() => {
                  setShowNextSteps(false);
                  window.scrollTo({ top: 900, behavior: 'smooth' });
                }}>
                  <CardContent className="pt-6">
                    <div className="text-center space-y-3">
                      <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                        <Gift className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-white font-bold">3. Claim More</h3>
                      <p className="text-gray-300 text-sm">Explore other campaigns & claim more tokens!</p>
                      <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
                        View Campaigns <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Step 4: Upgrade to Battle Pass */}
                <Card className="bg-amber-900/30 border-amber-500/50 hover:border-amber-500 transition-all cursor-pointer" onClick={() => {
                  setShowNextSteps(false);
                  onSwitchToTab?.('battlepass');
                }}>
                  <CardContent className="pt-6">
                    <div className="text-center space-y-3">
                      <div className="mx-auto w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                        <Crown className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-white font-bold">4. Go Premium</h3>
                      <p className="text-gray-300 text-sm">Unlock exclusive rewards with Battle Pass!</p>
                      <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                        Upgrade Now <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Referral Section */}
      {isLoggedIn && (
        <motion.div
          id="referral-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-4xl mx-auto mt-16"
        >
          <Card className="border-2 border-purple-500/30 bg-gradient-to-br from-purple-900/20 to-pink-900/20 transition-all duration-300">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-purple-400" />
                <CardTitle className="text-white text-2xl">Referral Program</CardTitle>
              </div>
              <CardDescription className="text-gray-300">
                Invite friends and earn bonus tokens for every successful referral!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Referral Stats */}
              {referralStats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-purple-900/30 border-purple-500/30">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          {getTierIcon(referralStats.tier)}
                          <span className="text-gray-400 text-sm">Your Tier</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{referralStats.tier}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-blue-900/30 border-blue-500/30">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Users className="h-5 w-5 text-blue-400 mx-auto mb-2" />
                        <span className="text-gray-400 text-sm">Total Referrals</span>
                        <p className="text-2xl font-bold text-white">{referralStats.totalReferrals}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-green-900/30 border-green-500/30">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <TrendingUp className="h-5 w-5 text-green-400 mx-auto mb-2" />
                        <span className="text-gray-400 text-sm">Bonuses Earned</span>
                        <p className="text-2xl font-bold text-white">{referralStats.totalBonus.toLocaleString()}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Generate/Share Referral Link */}
              <div className="space-y-4">
                {!referralLink && !referralStats?.referralCode ? (
                  <Button 
                    onClick={generateReferralCode}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <Gift className="h-4 w-4 mr-2" />
                    Generate Referral Link
                  </Button>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-slate-800 rounded-lg px-4 py-3 text-white font-mono text-sm overflow-x-auto">
                        {referralLink || `${window.location.origin}/ref/${referralStats?.referralCode}`}
                      </div>
                      <Button 
                        onClick={copyReferralLink}
                        variant="outline"
                        className="border-purple-500 text-purple-400 hover:bg-purple-500/20"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <p className="text-gray-300 text-sm font-medium">Share on Social Media:</p>
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          onClick={shareOnTwitter}
                          className="bg-blue-500 hover:bg-blue-600"
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          Twitter
                        </Button>
                        <Button 
                          onClick={shareOnFacebook}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <FaFacebook className="h-4 w-4 mr-2" />
                          Facebook
                        </Button>
                        <Button 
                          onClick={shareOnLinkedIn}
                          className="bg-blue-700 hover:bg-blue-800"
                        >
                          <FaLinkedin className="h-4 w-4 mr-2" />
                          LinkedIn
                        </Button>
                        <Button 
                          onClick={shareOnInstagram}
                          className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600"
                        >
                          <FaInstagram className="h-4 w-4 mr-2" />
                          Instagram
                        </Button>
                        <Button 
                          onClick={shareOnTikTok}
                          className="bg-black hover:bg-gray-900 border border-cyan-400"
                        >
                          <FaTiktok className="h-4 w-4 mr-2" />
                          TikTok
                        </Button>
                        <Button 
                          variant="outline"
                          className="border-purple-500 text-purple-400 hover:bg-purple-500/20"
                          onClick={() => {
                            const discordUrl = `https://discord.com`;
                            window.open(discordUrl, '_blank');
                          }}
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          Discord
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Tier Progression Info */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="pt-6">
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-400" />
                    Tier Progression
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Bronze (0-10 referrals)</span>
                      <span className="text-amber-600 font-semibold">+10 bonus/referral</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Silver (11-50 referrals)</span>
                      <span className="text-gray-300 font-semibold">+25 bonus/referral</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Gold (51+ referrals)</span>
                      <span className="text-yellow-400 font-semibold">+50 bonus/referral</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Leaderboard Section */}
      {leaderboard.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-4xl mx-auto mt-16"
        >
          <Card className="border-2 border-amber-500/30 bg-gradient-to-br from-amber-900/20 to-yellow-900/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Trophy className="h-6 w-6 text-amber-400" />
                <CardTitle className="text-white text-2xl">Leaderboard</CardTitle>
              </div>
              <CardDescription className="text-gray-300">
                Top claimers and referrers this campaign
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.map((entry, index) => (
                  <motion.div
                    key={entry.rank}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 hover:bg-slate-800/70 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`text-2xl font-bold ${
                        entry.rank === 1 ? 'text-yellow-400' :
                        entry.rank === 2 ? 'text-gray-300' :
                        entry.rank === 3 ? 'text-amber-600' :
                        'text-gray-500'
                      }`}>
                        #{entry.rank}
                      </div>
                      <div>
                        <p className="text-white font-semibold">{entry.username}</p>
                        <p className="text-gray-400 text-sm">{entry.referrals} referrals</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">{entry.totalClaimed.toLocaleString()}</p>
                      <p className="text-gray-400 text-sm">tokens claimed</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Sign In CTA */}
      {!isLoggedIn && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50"
        >
          <Card className="border-2 border-purple-500 bg-gradient-to-r from-purple-900 to-pink-900 shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <AlertCircle className="h-6 w-6 text-yellow-400" />
                <div>
                  <p className="text-white font-semibold">Create an account to claim free airdrops!</p>
                  <p className="text-gray-300 text-sm">Join GXCOIN and start earning tokens today</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Visa Card Enrollment Form */}
      <BlackCardEnrollmentForm
        isOpen={showVisaCardForm}
        onClose={() => setShowVisaCardForm(false)}
        onSubmit={(data) => {
          console.log('Visa Card Enrollment submitted:', data);
          toast.success('Application submitted! We\'ll review and contact you soon.');
          setShowVisaCardForm(false);
        }}
      />
    </div>
  );
}
