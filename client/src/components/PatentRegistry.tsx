import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Unlock, Award, TrendingUp, DollarSign, Zap, Factory, Leaf, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useGameArena } from '@/lib/stores/useGameArena';
import { useUser } from '@/lib/stores/useUser';

export function PatentRegistry() {
  const { 
    availablePatents, 
    userPatentAccess, 
    patentEconomicData, 
    loadPatents, 
    unlockPatent, 
    checkPatentAccess,
    calculatePatentValue,
    isLoading,
    playerStats 
  } = useGameArena();
  const { isLoggedIn } = useUser();

  useEffect(() => {
    // Only load patents for authenticated users - demo data is already in store initialization
    if (isLoggedIn) {
      console.log('🔑 User authenticated, loading real patent data...');
      loadPatents();
    } else {
      console.log('🎮 Demo mode active, using pre-loaded demo patent data');
      // Demo data is already loaded in store initialization, no API call needed
    }
  }, [loadPatents, isLoggedIn]);

  const handleUnlockPatent = async (patentId: number) => {
    const success = await unlockPatent(patentId);
    if (success) {
      console.log(`Patent ${patentId} unlocked successfully!`);
    } else {
      console.log(`Failed to unlock patent ${patentId} - insufficient funds or already unlocked`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Factory className="w-16 h-16 mx-auto mb-4 text-green-500 animate-spin" />
          <p className="text-green-400 text-lg">Loading Patent Registry...</p>
          <p className="text-gray-400 text-sm">Accessing revolutionary technologies</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center bg-gradient-to-r from-emerald-900/20 to-green-900/20 rounded-lg p-6 border border-green-500/30">
        {!isLoggedIn && (
          <div className="mb-4 p-3 bg-blue-900/30 border border-blue-500/50 rounded-lg">
            <div className="flex items-center justify-center gap-2 text-blue-300 font-bold">
              <Bot className="w-4 h-4" />
              DEMO MODE - Full Patent Access
            </div>
            <p className="text-blue-200 text-xs mt-1">Experience all {availablePatents.length} real patents with {userPatentAccess.length} unlocked</p>
          </div>
        )}
        <h2 className="text-3xl font-bold text-green-300 mb-2 flex items-center justify-center gap-2">
          <Unlock className="w-8 h-8" />
          Revolutionary Patent Registry
        </h2>
        <p className="text-cyan-400 text-lg">🔓 Real patent technologies for environmental restoration</p>
        <p className="text-yellow-400 mt-2">💰 Each patent generates actual economic value through licensing</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-green-900/20 rounded-lg p-3">
            <p className="text-green-400 text-sm font-medium">Patents Unlocked</p>
            <p className="text-2xl font-bold text-white">{userPatentAccess.length}</p>
          </div>
          <div className="bg-blue-900/20 rounded-lg p-3">
            <p className="text-blue-400 text-sm font-medium">Total Patents</p>
            <p className="text-2xl font-bold text-white">{availablePatents.length}</p>
          </div>
          <div className="bg-yellow-900/20 rounded-lg p-3">
            <p className="text-yellow-400 text-sm font-medium">Arena Coins</p>
            <p className="text-2xl font-bold text-white">{playerStats.arenaCoins}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {availablePatents.map((patent) => {
          const hasAccess = checkPatentAccess(patent.id);
          const usageData = patentEconomicData[patent.id];
          const unlockCost = patent.accessLevel * 100;

          return (
            <motion.div
              key={patent.id}
              whileHover={{ scale: 1.02 }}
              className="cursor-pointer"
            >
              <Card className={`overflow-hidden transition-all duration-300 ${
                hasAccess 
                  ? 'ring-2 ring-green-500 shadow-lg shadow-green-500/20 bg-green-900/10' 
                  : 'hover:shadow-lg bg-gray-900/50'
              } backdrop-blur-sm`}>
                <div className={`h-3 bg-gradient-to-r ${
                  hasAccess 
                    ? 'from-green-500 to-emerald-500' 
                    : patent.category === 'biochar' 
                      ? 'from-amber-600 to-orange-700'
                      : patent.category === 'water'
                        ? 'from-blue-400 to-cyan-500'
                        : patent.category === 'carbon'
                          ? 'from-green-800 to-lime-600'
                          : 'from-yellow-400 to-orange-400'
                }`} />
                
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-bold text-green-300">{patent.title}</CardTitle>
                      <p className="text-sm text-cyan-400 font-medium">{patent.patentNumber}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={hasAccess ? 'default' : 'outline'}>
                        {hasAccess ? '🔓 Unlocked' : '🔒 Locked'}
                      </Badge>
                      <p className="text-xs text-emerald-400 mt-1 font-medium capitalize">
                        {patent.category}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-300 line-clamp-3 leading-relaxed">
                    {patent.description}
                  </p>
                  
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400 flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        Base Economic Value
                      </span>
                      <span className="text-green-400 font-bold">${patent.economicValue}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400 flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        Access Level
                      </span>
                      <span className="text-purple-400 font-bold">Level {patent.accessLevel}</span>
                    </div>
                  </div>

                  {hasAccess && usageData && (
                    <div className="bg-green-900/20 rounded-lg p-3 border border-green-500/30">
                      <h4 className="text-green-400 text-sm font-medium mb-2 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Usage Statistics
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-gray-400">Times Used:</p>
                          <p className="text-white font-bold">{usageData.usageCount}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Value Generated:</p>
                          <p className="text-green-400 font-bold">${usageData.totalValueGenerated.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-900/20 rounded-lg p-3">
                    <h4 className="text-blue-400 text-sm font-medium mb-2 flex items-center gap-1">
                      <Leaf className="w-3 h-3" />
                      Environmental Impact
                    </h4>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      {Object.entries(patent.environmentalImpact).map(([key, value]) => (
                        <div key={key} className="text-gray-300">
                          {key}: {value}
                        </div>
                      ))}
                    </div>
                  </div>

                  {!hasAccess ? (
                    <div className="text-center">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white border-green-500"
                        onClick={() => handleUnlockPatent(patent.id)}
                        disabled={playerStats.arenaCoins < unlockCost}
                      >
                        <Unlock className="w-3 h-3 mr-1" />
                        Unlock Patent ({unlockCost} coins)
                      </Button>
                      {playerStats.arenaCoins < unlockCost && (
                        <p className="text-xs text-red-400 mt-1">Insufficient coins</p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center bg-green-900/20 rounded-lg p-2 border border-green-500/30">
                      <p className="text-green-400 text-sm font-medium">✅ Patent Active</p>
                      <p className="text-xs text-gray-300">Generate economic value in battles</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}