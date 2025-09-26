import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Leaf, Zap, Recycle, Award, Globe, Factory } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useGameArena } from '@/lib/stores/useGameArena';

export function EconomicsDashboard() {
  const { 
    realTimeEconomics, 
    economicRewards,
    userEconomicStats,
    playerStats,
    getSessionEconomicSummary,
    getLifetimeEconomicSummary,
    getCarbonCreditValue,
    getPlasticConversionValue,
    getEnergyGenerationValue
  } = useGameArena();

  const recentRewards = economicRewards.slice(-10); // Last 10 rewards

  return (
    <div className="space-y-6">
      <div className="text-center bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-lg p-6 border border-green-500/30">
        <h2 className="text-3xl font-bold text-green-300 mb-2 flex items-center justify-center gap-2">
          <DollarSign className="w-8 h-8" />
          Real Economic Impact Dashboard
        </h2>
        <p className="text-cyan-400 text-lg">💰 Track your revolutionary environmental economics</p>
        <p className="text-yellow-400 mt-2">🌍 Every action generates measurable real-world value</p>
      </div>

      {/* Real-Time Session Economics */}
      <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg p-6 border border-blue-500/30">
        <h3 className="text-xl font-bold text-blue-300 mb-4 flex items-center gap-2">
          <TrendingUp className="w-6 h-6" />
          Live Session Impact
        </h3>
        <p className="text-green-400 text-lg font-medium mb-4">{getSessionEconomicSummary()}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-green-900/30 rounded-lg p-4 border border-green-500/30"
          >
            <div className="flex items-center gap-2 mb-2">
              <Leaf className="w-5 h-5 text-green-400" />
              <h4 className="font-medium text-green-300">Carbon Credits</h4>
            </div>
            <p className="text-2xl font-bold text-white">{realTimeEconomics.sessionCarbonCredits.toFixed(1)}t</p>
            <p className="text-sm text-green-400">${getCarbonCreditValue(realTimeEconomics.sessionCarbonCredits).toFixed(2)}</p>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-blue-900/30 rounded-lg p-4 border border-blue-500/30"
          >
            <div className="flex items-center gap-2 mb-2">
              <Recycle className="w-5 h-5 text-blue-400" />
              <h4 className="font-medium text-blue-300">Plastic Converted</h4>
            </div>
            <p className="text-2xl font-bold text-white">{realTimeEconomics.sessionPlasticConverted}</p>
            <p className="text-sm text-blue-400">${getPlasticConversionValue(realTimeEconomics.sessionPlasticConverted).toFixed(2)}</p>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-yellow-900/30 rounded-lg p-4 border border-yellow-500/30"
          >
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <h4 className="font-medium text-yellow-300">Clean Energy</h4>
            </div>
            <p className="text-2xl font-bold text-white">{realTimeEconomics.sessionEnergyGenerated.toFixed(0)} kWh</p>
            <p className="text-sm text-yellow-400">${getEnergyGenerationValue(realTimeEconomics.sessionEnergyGenerated).toFixed(2)}</p>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-purple-900/30 rounded-lg p-4 border border-purple-500/30"
          >
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-purple-400" />
              <h4 className="font-medium text-purple-300">Patent Licensing</h4>
            </div>
            <p className="text-2xl font-bold text-white">${realTimeEconomics.sessionPatentLicensing.toFixed(2)}</p>
            <p className="text-sm text-purple-400">Direct value</p>
          </motion.div>
        </div>

        <div className="mt-4 bg-emerald-900/20 rounded-lg p-4 border border-emerald-500/30">
          <div className="flex justify-between items-center">
            <span className="text-emerald-300 font-medium">Total Session Value:</span>
            <span className="text-2xl font-bold text-emerald-400">${realTimeEconomics.sessionEconomicValue.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Lifetime Statistics */}
      {userEconomicStats && (
        <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-lg p-6 border border-purple-500/30">
          <h3 className="text-xl font-bold text-purple-300 mb-4 flex items-center gap-2">
            <Globe className="w-6 h-6" />
            Lifetime Environmental Economics
          </h3>
          <p className="text-purple-400 text-lg font-medium mb-4">{getLifetimeEconomicSummary()}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-gray-300 text-sm font-medium mb-2">Total Economic Value</h4>
              <p className="text-2xl font-bold text-green-400">${userEconomicStats.totalEconomicValue.toFixed(2)}</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-gray-300 text-sm font-medium mb-2">CO₂ Sequestered</h4>
              <p className="text-2xl font-bold text-green-400">{userEconomicStats.carbonTonsSequestered.toFixed(1)}t</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-gray-300 text-sm font-medium mb-2">Threats Defeated</h4>
              <p className="text-2xl font-bold text-red-400">{userEconomicStats.environmentalThreatsDefeated}</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-gray-300 text-sm font-medium mb-2">Plastic Bottles Converted</h4>
              <p className="text-2xl font-bold text-blue-400">{userEconomicStats.totalPlasticConverted}</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-gray-300 text-sm font-medium mb-2">Clean Energy Generated</h4>
              <p className="text-2xl font-bold text-yellow-400">{userEconomicStats.totalEnergyGenerated.toFixed(0)} kWh</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-gray-300 text-sm font-medium mb-2">Patents Unlocked</h4>
              <p className="text-2xl font-bold text-purple-400">{userEconomicStats.patentsUnlocked}</p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Economic Rewards */}
      <div className="bg-gradient-to-r from-orange-900/20 to-red-900/20 rounded-lg p-6 border border-orange-500/30">
        <h3 className="text-xl font-bold text-orange-300 mb-4 flex items-center gap-2">
          <Factory className="w-6 h-6" />
          Recent Economic Transactions
        </h3>
        
        {recentRewards.length > 0 ? (
          <div className="space-y-3">
            {recentRewards.map((reward) => (
              <Card key={reward.id} className="bg-gray-800/50 border border-gray-600">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {reward.rewardType === 'carbon_credits' && <Leaf className="w-4 h-4 text-green-400" />}
                        {reward.rewardType === 'plastic_conversion' && <Recycle className="w-4 h-4 text-blue-400" />}
                        {reward.rewardType === 'energy_generation' && <Zap className="w-4 h-4 text-yellow-400" />}
                        {reward.rewardType === 'patent_licensing' && <Award className="w-4 h-4 text-purple-400" />}
                        <span className="font-medium text-white capitalize">
                          {reward.rewardType.replace('_', ' ')}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {reward.heroId}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-400">
                        Quantity: {reward.quantity} • 
                        Battle: {reward.battleId?.slice(-8) || 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-400">${reward.amount.toFixed(2)}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(reward.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Factory className="w-16 h-16 mx-auto mb-4 text-gray-500 opacity-50" />
            <p className="text-gray-400">No economic transactions yet</p>
            <p className="text-sm text-gray-500 mt-1">Start battling environmental threats to generate value!</p>
          </div>
        )}
      </div>

      {/* Economic Rates Reference */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-6 border border-gray-600">
        <h3 className="text-lg font-bold text-gray-200 mb-4">📊 Economic Conversion Rates</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-green-900/20 rounded p-3">
            <p className="text-green-400 font-medium">🌿 Carbon Credits</p>
            <p className="text-gray-300">$175.00 per ton CO₂ sequestered</p>
          </div>
          <div className="bg-blue-900/20 rounded p-3">
            <p className="text-blue-400 font-medium">♻️ Plastic Conversion</p>
            <p className="text-gray-300">$1.25 per bottle converted to hemp</p>
          </div>
          <div className="bg-yellow-900/20 rounded p-3">
            <p className="text-yellow-400 font-medium">⚡ Clean Energy</p>
            <p className="text-gray-300">$0.15 per kWh generated</p>
          </div>
        </div>
      </div>
    </div>
  );
}