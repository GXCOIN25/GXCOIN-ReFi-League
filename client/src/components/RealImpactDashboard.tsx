import React, { useState, useEffect } from 'react';
import { Leaf, Zap, Droplet, Recycle, TrendingUp } from 'lucide-react';

interface ImpactData {
  carbonOffset: number;
  plasticRemoved: number;
  renewableEnergy: number;
  treesPlanted: number;
  lastUpdated: string;
}

interface LiveMetrics {
  globalCO2Reduction: number;
  activeProjects: number;
  totalFunding: number;
  energyGenerated: number;
}

export const RealImpactDashboard: React.FC = () => {
  const [impactData, setImpactData] = useState<ImpactData>({
    carbonOffset: 0,
    plasticRemoved: 0,
    renewableEnergy: 0,
    treesPlanted: 0,
    lastUpdated: new Date().toISOString()
  });

  const [liveMetrics, setLiveMetrics] = useState<LiveMetrics>({
    globalCO2Reduction: 0,
    activeProjects: 0,
    totalFunding: 0,
    energyGenerated: 0
  });

  const [isLoading, setIsLoading] = useState(true);

  // Load real economic data from API
  useEffect(() => {
    const loadRealImpactData = async () => {
      try {
        const { GXCoinAPI } = await import('@/lib/api');
        const economicStats = await GXCoinAPI.getUserEconomicStats();
        
        if (economicStats) {
          setImpactData({
            carbonOffset: economicStats.carbonTonsSequestered || 0,
            plasticRemoved: economicStats.totalPlasticConverted || 0,
            renewableEnergy: economicStats.totalEnergyGenerated || 0,
            treesPlanted: (economicStats.carbonTonsSequestered || 0) * 40, // 40 trees per ton CO2
            lastUpdated: economicStats.updatedAt || new Date().toISOString()
          });

          setLiveMetrics({
            globalCO2Reduction: economicStats.carbonTonsSequestered || 0,
            activeProjects: economicStats.environmentalThreatsDefeated || 0,
            totalFunding: economicStats.totalEconomicValue || 0,
            energyGenerated: economicStats.totalEnergyGenerated || 0
          });
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load real impact data:', error);
        // Fallback to initial values
        setImpactData({
          carbonOffset: 0,
          plasticRemoved: 0,
          renewableEnergy: 0,
          treesPlanted: 0,
          lastUpdated: new Date().toISOString()
        });
        setLiveMetrics({
          globalCO2Reduction: 0,
          activeProjects: 0,
          totalFunding: 0,
          energyGenerated: 0
        });
        setIsLoading(false);
      }
    };

    loadRealImpactData();

    // Update every 10 seconds with fresh data
    const interval = setInterval(loadRealImpactData, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number, decimals = 1) => {
    return num.toLocaleString(undefined, { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    });
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  if (isLoading) {
    return (
      <div className="bg-black/80 backdrop-blur-sm rounded-xl border border-green-500/30 p-6">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-green-300">Loading real-time impact data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Personal Impact */}
      <div className="bg-black/80 backdrop-blur-sm rounded-xl border border-green-500/30 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold text-lg">Your Environmental Impact</h3>
          <div className="flex items-center space-x-2 text-yellow-400 text-sm">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            <span>Demo Data</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
            <Leaf className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{formatNumber(impactData.carbonOffset)}</p>
            <p className="text-green-300 text-sm">kg CO₂ Offset</p>
          </div>

          <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <Droplet className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{formatNumber(impactData.plasticRemoved)}</p>
            <p className="text-blue-300 text-sm">kg Plastic Removed</p>
          </div>

          <div className="text-center p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <Zap className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{formatNumber(impactData.renewableEnergy)}</p>
            <p className="text-yellow-300 text-sm">kWh Clean Energy</p>
          </div>

          <div className="text-center p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <Recycle className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{formatNumber(impactData.treesPlanted)}</p>
            <p className="text-emerald-300 text-sm">Trees Planted</p>
          </div>
        </div>

        <p className="text-gray-400 text-xs mt-4 text-center">
          Last updated: {new Date(impactData.lastUpdated).toLocaleTimeString()} (Demo simulation)
        </p>
      </div>

      {/* Global Metrics */}
      <div className="bg-black/80 backdrop-blur-sm rounded-xl border border-purple-500/30 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold text-lg">Global Impact Network</h3>
          <TrendingUp className="w-5 h-5 text-purple-400" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-400">{formatNumber(liveMetrics.globalCO2Reduction, 0)}</p>
            <p className="text-gray-300 text-sm">Total CO₂ Reduced (kg)</p>
          </div>

          <div className="text-center">
            <p className="text-3xl font-bold text-blue-400">{liveMetrics.activeProjects}</p>
            <p className="text-gray-300 text-sm">Active Projects</p>
          </div>

          <div className="text-center">
            <p className="text-3xl font-bold text-green-400">{formatCurrency(liveMetrics.totalFunding)}</p>
            <p className="text-gray-300 text-sm">Total Funding</p>
          </div>

          <div className="text-center">
            <p className="text-3xl font-bold text-yellow-400">{formatNumber(liveMetrics.energyGenerated, 0)}</p>
            <p className="text-gray-300 text-sm">Energy Generated (kWh)</p>
          </div>
        </div>
      </div>
    </div>
  );
};