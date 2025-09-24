import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { ranks } from "@/data/ranks";
import { Rank } from "@/types/heroes";

interface ContributionState {
  totalContribution: number;
  currentRank: Rank;
  impactMetrics: {
    plasticRemoved: number;
    carbonOffset: number;
    renewableEnergy: number;
    treesPlanted: number;
    waterPurified: number;
  };
  
  // Actions
  addContribution: (amount: number) => void;
  calculateImpact: (contribution: number) => typeof ContributionState.prototype.impactMetrics;
  getCurrentRank: () => Rank;
  getNextRank: () => Rank | null;
  getProgressToNext: () => number;
}

export const useContribution = create<ContributionState>()(
  subscribeWithSelector((set, get) => ({
    totalContribution: 0,
    currentRank: ranks[0], // Bronze by default
    impactMetrics: {
      plasticRemoved: 0,
      carbonOffset: 0,
      renewableEnergy: 0,
      treesPlanted: 0,
      waterPurified: 0
    },
    
    addContribution: (amount: number) => {
      const newTotal = get().totalContribution + amount;
      const newRank = get().getCurrentRank();
      const impact = get().calculateImpact(newTotal);
      
      set({
        totalContribution: newTotal,
        currentRank: newRank,
        impactMetrics: impact
      });
    },
    
    calculateImpact: (contribution: number) => {
      const multiplier = get().currentRank.impactMultiplier;
      return {
        plasticRemoved: Math.floor(contribution * 5.7 * multiplier), // gallons
        carbonOffset: Math.floor(contribution * 0.1 * multiplier), // tons
        renewableEnergy: Math.floor(contribution * 2.3 * multiplier), // kWh
        treesPlanted: Math.floor(contribution * 0.05 * multiplier),
        waterPurified: Math.floor(contribution * 10 * multiplier) // gallons
      };
    },
    
    getCurrentRank: () => {
      const contribution = get().totalContribution;
      return [...ranks].reverse().find(rank => contribution >= rank.minContribution) || ranks[0];
    },
    
    getNextRank: () => {
      const currentRank = get().getCurrentRank();
      const currentIndex = ranks.findIndex(r => r.id === currentRank.id);
      return currentIndex < ranks.length - 1 ? ranks[currentIndex + 1] : null;
    },
    
    getProgressToNext: () => {
      const contribution = get().totalContribution;
      const currentRank = get().getCurrentRank();
      const nextRank = get().getNextRank();
      
      if (!nextRank) return 100;
      
      const progress = (contribution - currentRank.minContribution) / 
                      (nextRank.minContribution - currentRank.minContribution);
      return Math.min(progress * 100, 100);
    }
  }))
);
