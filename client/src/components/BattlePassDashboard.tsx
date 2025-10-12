import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Trophy,
  Lock,
  Check,
  Sparkles,
  Gift,
  Star,
  Zap,
  Clock,
  Crown,
  Loader2,
  AlertCircle,
  CreditCard,
} from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@/lib/stores/useUser';
import type {
  BattlePassSeasonWithRewards,
  BattlePassProgress,
  UserBattlePassProgress,
  BattlePassReward,
} from 'shared/types';

const API_BASE = '/api';

interface ClaimedReward {
  level: number;
  tier: 'free' | 'premium';
}

export default function BattlePassDashboard() {
  const { isLoggedIn } = useUser();
  
  const [season, setSeason] = useState<BattlePassSeasonWithRewards | null>(null);
  const [progress, setProgress] = useState<BattlePassProgress | null>(null);
  const [unclaimedRewards, setUnclaimedRewards] = useState<{ level: number; tier: 'free' | 'premium'; reward: BattlePassReward }[]>([]);
  const [claimedRewards, setClaimedRewards] = useState<ClaimedReward[]>([]);
  
  const [loadingSeason, setLoadingSeason] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [loadingClaim, setLoadingClaim] = useState<number | null>(null);
  const [loadingPurchase, setLoadingPurchase] = useState(false);
  
  const [showConfetti, setShowConfetti] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('gxcoin_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  };

  const fetchActiveSeason = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/battle-pass/active`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('No active season available');
          return;
        }
        throw new Error('Failed to fetch active season');
      }

      const data = await response.json();
      setSeason(data.data);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load season';
      setError(message);
      toast.error('Season Error', { description: message });
    } finally {
      setLoadingSeason(false);
    }
  }, []);

  const fetchUserProgress = useCallback(async () => {
    if (!isLoggedIn) {
      setLoadingProgress(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/battle-pass/progress`, {
        headers: getAuthHeaders(),
      });

      if (response.status === 401) {
        setLoadingProgress(false);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch user progress');
      }

      const data: UserBattlePassProgress = await response.json();
      setProgress(data.progress);
      setUnclaimedRewards(data.unclaimedRewards);
      
      const response2 = await fetch(`${API_BASE}/battle-pass/rewards/claimed`, {
        headers: getAuthHeaders(),
      });
      
      if (response2.ok) {
        const claimedData = await response2.json();
        setClaimedRewards(claimedData.data || []);
      }
    } catch (err) {
      console.error('Progress fetch error:', err);
    } finally {
      setLoadingProgress(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    fetchActiveSeason();
  }, [fetchActiveSeason]);

  useEffect(() => {
    fetchUserProgress();
  }, [fetchUserProgress]);

  useEffect(() => {
    if (!isLoggedIn) return;

    const progressInterval = setInterval(fetchUserProgress, 30000);
    return () => clearInterval(progressInterval);
  }, [isLoggedIn, fetchUserProgress]);

  const handleClaimReward = async (level: number, tier: 'free' | 'premium') => {
    if (!isLoggedIn) {
      toast.error('Login required', { description: 'Please login to claim rewards' });
      return;
    }

    setLoadingClaim(level);

    try {
      const response = await fetch(`${API_BASE}/battle-pass/rewards/${level}/claim`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ tier }),
      });

      const data = await response.json();

      if (response.status === 409) {
        toast.info('Already claimed', { description: 'You have already claimed this reward' });
        await fetchUserProgress();
        return;
      }

      if (response.status === 403) {
        toast.error('Premium required', { description: 'Unlock premium to claim this reward' });
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to claim reward');
      }

      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);

      toast.success('Reward claimed!', {
        description: `You claimed your level ${level} ${tier} reward!`,
      });

      await fetchUserProgress();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to claim reward';
      toast.error('Claim failed', { description: message });
    } finally {
      setLoadingClaim(null);
    }
  };

  const handlePurchasePremium = async () => {
    if (!isLoggedIn) {
      toast.error('Login required', { description: 'Please login to purchase premium' });
      return;
    }

    setLoadingPurchase(true);

    try {
      const response = await fetch(`${API_BASE}/battle-pass/purchase/stripe-checkout`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start checkout';
      toast.error('Purchase failed', { description: message });
      setLoadingPurchase(false);
    }
  };

  const getTimeRemaining = () => {
    if (!season) return 'N/A';

    const now = new Date().getTime();
    const end = new Date(season.endDate).getTime();
    const diff = end - now;

    if (diff <= 0) return 'Season ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    return `${days}d ${hours}h`;
  };

  const getCurrentLevelProgress = () => {
    if (!progress) return 0;
    const xpInLevel = (progress.currentXp || 0) % 100;
    return xpInLevel;
  };

  const isRewardClaimed = (level: number, tier: 'free' | 'premium') => {
    return claimedRewards.some(r => r.level === level && r.tier === tier);
  };

  const canClaimReward = (level: number, tier: 'free' | 'premium') => {
    if (!progress || !isLoggedIn) return false;
    if (level > (progress.currentLevel || 0)) return false;
    if (tier === 'premium' && !progress.isPremium) return false;
    if (isRewardClaimed(level, tier)) return false;
    return true;
  };

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'token':
        return <Zap className="w-5 h-5" />;
      case 'nft':
        return <Sparkles className="w-5 h-5" />;
      case 'bundle':
        return <Gift className="w-5 h-5" />;
      case 'cosmetic':
        return <Star className="w-5 h-5" />;
      default:
        return <Trophy className="w-5 h-5" />;
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-blue-900 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <Card className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 border-blue-500/30">
            <CardContent className="p-12 text-center">
              <Lock className="w-16 h-16 mx-auto mb-4 text-blue-400" />
              <h2 className="text-2xl font-bold text-white mb-2">Login Required</h2>
              <p className="text-gray-400 mb-6">
                Please login to access the Battle Pass and track your progress
              </p>
              <Button
                onClick={() => {
                  const loginBtn = document.querySelector('[data-login-trigger]') as HTMLElement;
                  if (loginBtn) loginBtn.click();
                }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Login Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loadingSeason || loadingProgress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-blue-900 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-32 w-full bg-gray-800/50" />
          <Skeleton className="h-64 w-full bg-gray-800/50" />
        </div>
      </div>
    );
  }

  if (error || !season) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-blue-900 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <Card className="bg-gradient-to-br from-red-900/40 to-orange-900/40 border-red-500/30">
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
              <h2 className="text-2xl font-bold text-white mb-2">
                {error || 'No Active Season'}
              </h2>
              <p className="text-gray-400 mb-6">
                Check back later for the next Battle Pass season!
              </p>
              <Button onClick={fetchActiveSeason} variant="outline">
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentLevel = progress?.currentLevel || 0;
  const currentXP = progress?.currentXp || 0;
  const isPremium = progress?.isPremium || false;
  const levelProgress = getCurrentLevelProgress();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-blue-900 p-4 md:p-8">
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={500}
        />
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 border-purple-500/30">
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <CardTitle className="text-3xl font-bold text-white flex items-center gap-2">
                    <Trophy className="w-8 h-8 text-yellow-400" />
                    {season.name}
                  </CardTitle>
                  <CardDescription className="text-gray-400 mt-2">
                    Season {season.seasonNumber}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm text-gray-400 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Time Remaining
                    </div>
                    <div className="text-xl font-bold text-white">{getTimeRemaining()}</div>
                  </div>
                  {!isPremium && (
                    <Button
                      onClick={handlePurchasePremium}
                      disabled={loadingPurchase}
                      className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
                    >
                      {loadingPurchase ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Crown className="w-4 h-4 mr-2" />
                      )}
                      Unlock Premium ($29.99)
                    </Button>
                  )}
                  {isPremium && (
                    <Badge className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white">
                      <Crown className="w-4 h-4 mr-1" />
                      Premium Active
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm text-gray-400">Current Level</div>
                    <div className="text-2xl font-bold text-white">Level {currentLevel}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Total XP</div>
                    <div className="text-2xl font-bold text-cyan-400">{currentXP} XP</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Level Progress</span>
                    <span className="text-white">{levelProgress}/100 XP</span>
                  </div>
                  <Progress value={levelProgress} className="h-3" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 border-blue-500/30">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                  <Gift className="w-6 h-6 text-blue-400" />
                  Free Tier Rewards
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {season.freeTierRewards.map((reward) => {
                    const claimed = isRewardClaimed(reward.level, 'free');
                    const canClaim = canClaimReward(reward.level, 'free');
                    const locked = reward.level > currentLevel;

                    return (
                      <motion.div
                        key={`free-${reward.level}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-lg border ${
                          claimed
                            ? 'bg-green-900/20 border-green-500/30'
                            : locked
                            ? 'bg-gray-900/20 border-gray-500/30'
                            : 'bg-blue-900/20 border-blue-500/30'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-full ${
                                claimed
                                  ? 'bg-green-500/20 text-green-400'
                                  : locked
                                  ? 'bg-gray-500/20 text-gray-400'
                                  : 'bg-blue-500/20 text-blue-400'
                              }`}
                            >
                              {getRewardIcon(reward.type)}
                            </div>
                            <div>
                              <div className="font-semibold text-white">
                                Level {reward.level}
                              </div>
                              <div className="text-sm text-gray-400">{reward.reward}</div>
                            </div>
                          </div>
                          <div>
                            {claimed ? (
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                <Check className="w-4 h-4 mr-1" />
                                Claimed
                              </Badge>
                            ) : locked ? (
                              <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                                <Lock className="w-4 h-4 mr-1" />
                                Locked
                              </Badge>
                            ) : canClaim ? (
                              <Button
                                size="sm"
                                onClick={() => handleClaimReward(reward.level, 'free')}
                                disabled={loadingClaim === reward.level}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                {loadingClaim === reward.level ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  'Claim'
                                )}
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className={`bg-gradient-to-br ${isPremium ? 'from-yellow-900/40 to-orange-900/40 border-yellow-500/30' : 'from-gray-900/40 to-gray-800/40 border-gray-500/30'}`}>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                  <Crown className={`w-6 h-6 ${isPremium ? 'text-yellow-400' : 'text-gray-400'}`} />
                  Premium Tier Rewards
                  {isPremium && (
                    <Badge className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white ml-auto">
                      Active
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {season.premiumTierRewards.map((reward) => {
                    const claimed = isRewardClaimed(reward.level, 'premium');
                    const canClaim = canClaimReward(reward.level, 'premium');
                    const locked = reward.level > currentLevel;
                    const needsPremium = !isPremium;

                    return (
                      <motion.div
                        key={`premium-${reward.level}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-lg border ${
                          claimed
                            ? 'bg-green-900/20 border-green-500/30'
                            : needsPremium
                            ? 'bg-gray-900/20 border-gray-500/30'
                            : locked
                            ? 'bg-gray-900/20 border-gray-500/30'
                            : 'bg-yellow-900/20 border-yellow-500/30'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-full ${
                                claimed
                                  ? 'bg-green-500/20 text-green-400'
                                  : needsPremium
                                  ? 'bg-gray-500/20 text-gray-400'
                                  : locked
                                  ? 'bg-gray-500/20 text-gray-400'
                                  : 'bg-yellow-500/20 text-yellow-400'
                              }`}
                            >
                              {getRewardIcon(reward.type)}
                            </div>
                            <div>
                              <div className="font-semibold text-white">
                                Level {reward.level}
                              </div>
                              <div className="text-sm text-gray-400">{reward.reward}</div>
                            </div>
                          </div>
                          <div>
                            {claimed ? (
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                <Check className="w-4 h-4 mr-1" />
                                Claimed
                              </Badge>
                            ) : needsPremium ? (
                              <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                                <Lock className="w-4 h-4 mr-1" />
                                Premium
                              </Badge>
                            ) : locked ? (
                              <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                                <Lock className="w-4 h-4 mr-1" />
                                Locked
                              </Badge>
                            ) : canClaim ? (
                              <Button
                                size="sm"
                                onClick={() => handleClaimReward(reward.level, 'premium')}
                                disabled={loadingClaim === reward.level}
                                className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
                              >
                                {loadingClaim === reward.level ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  'Claim'
                                )}
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {!isPremium && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border-yellow-500/30">
              <CardContent className="p-8 text-center">
                <Crown className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
                <h3 className="text-2xl font-bold text-white mb-2">
                  Unlock Premium Battle Pass
                </h3>
                <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                  Get instant access to premium tier rewards, exclusive cosmetics, and double
                  the rewards for just $29.99!
                </p>
                <Button
                  onClick={handlePurchasePremium}
                  disabled={loadingPurchase}
                  size="lg"
                  className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-bold"
                >
                  {loadingPurchase ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 mr-2" />
                      Purchase Premium - $29.99
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
