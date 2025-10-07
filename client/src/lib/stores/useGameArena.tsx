import React from 'react';
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { GameHero, EnvironmentalBattleResult, BattleTurn, EnvironmentalThreat, Patent, EconomicReward, UserEconomicStats } from "@/types/heroes";
import { gameHeroes as initialGameHeroes } from "@/data/gameHeroes";
import { environmentalThreats, getThreatById, calculateThreatRewards } from "@/data/environmentalThreats";
import { PATENTS_DATABASE } from "@/data/patents";

export type BattlePhase = "idle" | "selecting" | "battling" | "results";
export type ArenaView = "collection" | "battle" | "patents" | "economics" | "shop" | "leaderboard";

// Demo Data - Comprehensive demo experience for non-authenticated users
const DEMO_USER_PATENT_ACCESS = [1, 2, 3, 4, 5, 7, 8, 10, 11, 13, 15, 16]; // 12 out of 18 patents unlocked

const DEMO_PATENT_ECONOMIC_DATA: Record<number, { usageCount: number; totalValueGenerated: number }> = {
  1: { usageCount: 15, totalValueGenerated: 2250 },
  2: { usageCount: 8, totalValueGenerated: 2400 },
  3: { usageCount: 12, totalValueGenerated: 2400 },
  4: { usageCount: 22, totalValueGenerated: 11000 },
  5: { usageCount: 18, totalValueGenerated: 4500 },
  7: { usageCount: 6, totalValueGenerated: 2400 },
  8: { usageCount: 4, totalValueGenerated: 1400 },
  10: { usageCount: 5, totalValueGenerated: 3000 },
  11: { usageCount: 25, totalValueGenerated: 7000 },
  13: { usageCount: 10, totalValueGenerated: 3200 },
  15: { usageCount: 35, totalValueGenerated: 6300 },
  16: { usageCount: 2, totalValueGenerated: 1700 }
};

const DEMO_ECONOMIC_REWARDS: EconomicReward[] = [
  {
    id: 1001,
    userId: 1,
    heroId: "aqua_wtr",
    rewardType: "plastic_conversion",
    amount: 625.0,
    quantity: 500,
    battleId: "demo_battle_001",
    transactionData: { threatDefeated: "Fast Fashion Empire", heroUsed: "AQUA ($WTR)" },
    createdAt: new Date(Date.now() - 86400000) // 1 day ago
  },
  {
    id: 1002,
    userId: 1,
    heroId: "graphene_batt",
    rewardType: "carbon_credits",
    amount: 437.5,
    quantity: 2.5,
    battleId: "demo_battle_002",
    transactionData: { threatDefeated: "Big Tech AI Factory", heroUsed: "GRAPHENE ($BATT)" },
    createdAt: new Date(Date.now() - 172800000) // 2 days ago
  },
  {
    id: 1003,
    userId: 1,
    heroId: "voltra_gpwr",
    rewardType: "energy_generation",
    amount: 150.0,
    quantity: 1000,
    battleId: "demo_battle_003",
    transactionData: { threatDefeated: "Big Tech AI Factory", heroUsed: "VOLTRA ($GPWR)" },
    createdAt: new Date(Date.now() - 259200000) // 3 days ago
  },
  {
    id: 1004,
    userId: 1,
    heroId: "trader_gcct",
    rewardType: "patent_licensing",
    amount: 450.0,
    quantity: 3,
    patentId: 13,
    battleId: "demo_battle_004",
    transactionData: { threatDefeated: "Deforestation Syndicate", heroUsed: "CARBON ($GCCT)" },
    createdAt: new Date(Date.now() - 345600000) // 4 days ago
  }
];

const DEMO_USER_ECONOMIC_STATS: UserEconomicStats = {
  id: 1,
  userId: 1,
  totalCarbonCredits: 1184.50,
  totalPlasticConverted: 8450,
  totalEnergyGenerated: 45600,
  totalPatentLicensing: 7245.23,
  totalEconomicValue: 18945.23,
  carbonTonsSequestered: 156.7,
  environmentalThreatsDefeated: 23,
  patentsUnlocked: 12,
  updatedAt: new Date()
};

const DEMO_BATTLE_HISTORY: EnvironmentalBattleResult[] = [
  {
    winner: 'player',
    playerHero: initialGameHeroes[0], // AQUA
    environmentalThreat: environmentalThreats[2], // Fast Fashion Empire
    turns: [],
    rewards: { experience: 120, coins: 60 },
    economicRewards: {
      carbonCreditsEarned: 1.2,
      plasticConverted: 500,
      energyGenerated: 0,
      patentLicensing: 275,
      totalDollarValue: 1160
    },
    environmentalImpact: { wasteReduction: 1, waterCleanup: 1, sustainableProduction: 1 }
  },
  {
    winner: 'player',
    playerHero: initialGameHeroes[3], // GRAPHENE
    environmentalThreat: environmentalThreats[0], // Big Tech AI Factory
    turns: [],
    rewards: { experience: 160, coins: 80 },
    economicRewards: {
      carbonCreditsEarned: 2.5,
      plasticConverted: 0,
      energyGenerated: 1000,
      patentLicensing: 500,
      totalDollarValue: 1087.5
    },
    environmentalImpact: { carbonReduction: 2.5, energySaved: 1000, techDemocratization: 1 }
  }
];

// Demo Heroes - All heroes owned with enhanced stats
const DEMO_GAME_HEROES: GameHero[] = initialGameHeroes.map(hero => ({
  ...hero,
  owned: true,
  level: hero.id === "gxcoin_anchor" ? 10 : 
         hero.id === "graphene_batt" ? 8 : 
         hero.id === "aqua_wtr" ? 6 : 
         hero.id === "hemp_builder" ? 4 : 
         hero.id === "voltra_gpwr" ? 5 : 
         hero.id === "trader_gcct" ? 7 : 3
}));

interface GameArenaState {
  // Hero Management
  gameHeroes: GameHero[];
  selectedHero: GameHero | null;
  
  // Patent System
  availablePatents: Patent[];
  userPatentAccess: number[]; // Patent IDs the user has access to
  patentEconomicData: Record<number, { usageCount: number; totalValueGenerated: number }>;
  
  // Environmental Battle System
  battlePhase: BattlePhase;
  currentBattle: {
    playerHero: GameHero | null;
    environmentalThreat: EnvironmentalThreat | null;
    playerHealth: number;
    threatHealth: number;
    turn: number;
    playerTurn: boolean;
    battleId: string;
  } | null;
  battleHistory: EnvironmentalBattleResult[];
  
  // Economic Rewards System
  economicRewards: EconomicReward[];
  userEconomicStats: UserEconomicStats | null;
  realTimeEconomics: {
    sessionCarbonCredits: number;
    sessionPlasticConverted: number;
    sessionEnergyGenerated: number;
    sessionPatentLicensing: number;
    sessionEconomicValue: number;
  };
  
  // Arena State
  currentView: ArenaView;
  playerStats: {
    wins: number;
    losses: number;
    totalBattles: number;
    arenaCoins: number;
    rank: number;
    experience: number;
    environmentalThreatsDefeated: number;
  };
  
  // Loading states
  isLoading: boolean;
  isCalculatingRewards: boolean;
  
  // Actions - Hero Management
  selectHero: (heroId: string) => void;
  clearHeroSelection: () => void;
  updateHeroStats: (heroId: string, stats: Partial<GameHero['stats']>) => void;
  unlockHero: (heroId: string) => void;
  upgradeHero: (heroId: string) => void;
  
  // Actions - Patent System
  loadPatents: () => Promise<void>;
  unlockPatent: (patentId: number) => Promise<boolean>;
  checkPatentAccess: (patentId: number) => boolean;
  calculatePatentValue: (patentId: number) => Promise<number>;
  usePatent: (patentId: number, heroId: string, usageType: string) => Promise<EconomicReward | null>;
  
  // Actions - Environmental Battle System
  startEnvironmentalBattle: (playerHeroId: string, threatId?: string) => void;
  selectThreatForBattle: (threatId: string) => void;
  executeTurn: (abilityIndex: number) => void;
  endBattle: () => void;
  resetBattle: () => void;
  
  // Actions - Economic Rewards System
  calculateEconomicRewards: (hero: GameHero, threat: EnvironmentalThreat, victory: boolean) => Promise<EconomicReward[]>;
  processEconomicRewards: (rewards: EconomicReward[]) => Promise<void>;
  getSessionEconomicSummary: () => string;
  getLifetimeEconomicSummary: () => string;
  
  // Actions - Arena Navigation
  setArenaView: (view: ArenaView) => void;
  
  // Actions - Progression
  gainExperience: (heroId: string, amount: number) => void;
  spendArenaCoins: (amount: number) => boolean;
  addArenaCoins: (amount: number) => void;
  
  // Real-world Economic Functions
  getCarbonCreditValue: (tons: number) => number;
  getPlasticConversionValue: (bottles: number) => number;
  getEnergyGenerationValue: (kwh: number) => number;
  
  // Utility functions
  getHeroById: (heroId: string) => GameHero | undefined;
  getOwnedHeroes: () => GameHero[];
  getAvailableHeroes: () => GameHero[];
  canAfford: (cost: number) => boolean;
  getThreatsByHeroEffectiveness: (heroElement: string) => EnvironmentalThreat[];
}

export const useGameArena = create<GameArenaState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state - Demo data for full functionality without authentication
    gameHeroes: DEMO_GAME_HEROES,
    selectedHero: null,
    availablePatents: PATENTS_DATABASE,
    userPatentAccess: DEMO_USER_PATENT_ACCESS, // Demo patent access for immediate functionality
    patentEconomicData: DEMO_PATENT_ECONOMIC_DATA,
    battlePhase: "idle",
    currentBattle: null,
    battleHistory: DEMO_BATTLE_HISTORY,
    economicRewards: DEMO_ECONOMIC_REWARDS,
    userEconomicStats: DEMO_USER_ECONOMIC_STATS,
    realTimeEconomics: {
      sessionCarbonCredits: 156.7,
      sessionPlasticConverted: 2847,
      sessionEnergyGenerated: 18450,
      sessionPatentLicensing: 2847.50,
      sessionEconomicValue: 2847.50
    },
    currentView: "collection",
    playerStats: {
      wins: 47,
      losses: 4,
      totalBattles: 51,
      arenaCoins: 1250,
      rank: 5,
      experience: 2840,
      environmentalThreatsDefeated: 23
    },
    isLoading: false,
    isCalculatingRewards: false,
    
    // Hero Management Actions
    selectHero: (heroId: string) => {
      const hero = get().getHeroById(heroId);
      if (hero) {
        set({ selectedHero: hero });
      }
    },
    
    clearHeroSelection: () => {
      set({ selectedHero: null });
    },
    
    updateHeroStats: (heroId: string, newStats: Partial<GameHero['stats']>) => {
      set(state => ({
        gameHeroes: state.gameHeroes.map(hero =>
          hero.id === heroId
            ? { ...hero, stats: { ...hero.stats, ...newStats } }
            : hero
        )
      }));
    },
    
    unlockHero: (heroId: string) => {
      set(state => ({
        gameHeroes: state.gameHeroes.map(hero =>
          hero.id === heroId
            ? { ...hero, owned: true, level: 1 }
            : hero
        )
      }));
    },
    
    upgradeHero: (heroId: string) => {
      set(state => ({
        gameHeroes: state.gameHeroes.map(hero =>
          hero.id === heroId && hero.owned
            ? {
                ...hero,
                level: hero.level + 1,
                stats: {
                  power: hero.stats.power + 5,
                  health: hero.stats.health + 10,
                  speed: hero.stats.speed + 3
                },
                experience: 0,
                maxExperience: hero.maxExperience + 200
              }
            : hero
        )
      }));
    },
    
    // Patent System Actions
    loadPatents: async () => {
      set({ isLoading: true });
      try {
        // Check if user is authenticated
        const { useUser } = await import('@/lib/stores/useUser');
        const isLoggedIn = useUser.getState().isLoggedIn;
        
        if (isLoggedIn) {
          // Load real data for authenticated users
          const { GXCoinAPI } = await import('@/lib/api');
          const [patents, userAccess] = await Promise.all([
            GXCoinAPI.getAllPatents(),
            GXCoinAPI.getUserPatentAccess()
          ]);
          
          set({ 
            availablePatents: patents,
            userPatentAccess: userAccess.map(access => access.patentId),
            patentEconomicData: userAccess.reduce((acc, access) => ({
              ...acc,
              [access.patentId]: {
                usageCount: access.usageCount || 0,
                totalValueGenerated: access.totalValueGenerated || 0
              }
            }), {})
          });
        } else {
          // Load demo data for non-authenticated users
          console.log('🎮 Loading demo patents for non-authenticated user');
          set({ 
            availablePatents: PATENTS_DATABASE,
            userPatentAccess: DEMO_USER_PATENT_ACCESS,
            patentEconomicData: DEMO_PATENT_ECONOMIC_DATA,
            economicRewards: DEMO_ECONOMIC_REWARDS,
            userEconomicStats: DEMO_USER_ECONOMIC_STATS,
            battleHistory: DEMO_BATTLE_HISTORY
          });
        }
      } catch (error) {
        console.error("Failed to load patents:", error);
        // Fallback to demo data on error
        console.log('🎮 Falling back to demo data due to error');
        set({ 
          availablePatents: PATENTS_DATABASE,
          userPatentAccess: DEMO_USER_PATENT_ACCESS,
          patentEconomicData: DEMO_PATENT_ECONOMIC_DATA,
          economicRewards: DEMO_ECONOMIC_REWARDS,
          userEconomicStats: DEMO_USER_ECONOMIC_STATS,
          battleHistory: DEMO_BATTLE_HISTORY
        });
      } finally {
        set({ isLoading: false });
      }
    },
    
    unlockPatent: async (patentId: number): Promise<boolean> => {
      const state = get();
      if (state.userPatentAccess.includes(patentId)) {
        return false; // Already unlocked
      }
      
      set({ isLoading: true });
      
      try {
        // Check if user is authenticated
        const { useUser } = await import('@/lib/stores/useUser');
        const isLoggedIn = useUser.getState().isLoggedIn;
        
        if (isLoggedIn) {
          // Real unlock for authenticated users
          const { GXCoinAPI } = await import('@/lib/api');
          const result = await GXCoinAPI.unlockPatent(patentId);
          
          set(state => ({
            userPatentAccess: [...state.userPatentAccess, patentId],
            patentEconomicData: {
              ...state.patentEconomicData,
              [patentId]: { usageCount: 0, totalValueGenerated: 0 }
            }
          }));
          
          console.log(`✅ Patent ${patentId} unlocked successfully via backend API`);
        } else {
          // Demo unlock for non-authenticated users
          const patent = PATENTS_DATABASE.find(p => p.id === patentId);
          if (patent && state.canAfford(patent.unlockCost)) {
            state.spendArenaCoins(patent.unlockCost);
            
            set(state => ({
              userPatentAccess: [...state.userPatentAccess, patentId],
              patentEconomicData: {
                ...state.patentEconomicData,
                [patentId]: { usageCount: 0, totalValueGenerated: 0 }
              }
            }));
            
            console.log(`🎮 Demo: Patent ${patentId} unlocked successfully for ${patent.unlockCost} Arena Coins`);
          } else {
            console.log(`🎮 Demo: Insufficient Arena Coins to unlock patent ${patentId}`);
            return false;
          }
        }
        
        return true;
      } catch (error) {
        console.error('❌ Failed to unlock patent:', error);
        return false;
      } finally {
        set({ isLoading: false });
      }
    },
    
    checkPatentAccess: (patentId: number): boolean => {
      return get().userPatentAccess.includes(patentId);
    },
    
    calculatePatentValue: async (patentId: number): Promise<number> => {
      const state = get();
      const patent = state.availablePatents.find(p => p.id === patentId);
      const usageData = state.patentEconomicData[patentId];
      
      if (!patent || !usageData) return 0;
      
      // Calculate value based on patent's economic potential and usage count
      const baseValue = patent.economicValue;
      const usageMultiplier = Math.log(usageData.usageCount + 1) / Math.log(10);
      return baseValue * (0.8 + usageMultiplier * 0.4);
    },
    
    usePatent: async (patentId: number, heroId: string, usageType: string): Promise<EconomicReward | null> => {
      const state = get();
      if (!state.checkPatentAccess(patentId)) {
        console.warn(`❌ Patent ${patentId} access denied - not unlocked for user`);
        return null;
      }
      
      set({ isCalculatingRewards: true });
      
      try {
        // Check if user is authenticated before making API calls
        const { useUser } = await import('@/lib/stores/useUser');
        const isLoggedIn = useUser.getState().isLoggedIn;
        
        if (isLoggedIn) {
          // Real API call for authenticated users
          const { GXCoinAPI } = await import('@/lib/api');
          const result = await GXCoinAPI.usePatent(patentId, heroId, usageType, 1);
          
          if (result.reward) {
            // Update local state with backend-validated data
            set(state => ({
              patentEconomicData: {
                ...state.patentEconomicData,
                [patentId]: {
                  usageCount: result.newUsageCount,
                  totalValueGenerated: (state.patentEconomicData[patentId]?.totalValueGenerated || 0) + result.economicValue
                }
              },
              realTimeEconomics: {
                ...state.realTimeEconomics,
                sessionPatentLicensing: state.realTimeEconomics.sessionPatentLicensing + result.economicValue,
                sessionEconomicValue: state.realTimeEconomics.sessionEconomicValue + result.economicValue
              }
            }));
            
            console.log(`✅ Patent ${patentId} used successfully:`, {
              economicValue: result.economicValue,
              environmentalImpact: result.environmentalImpact,
              newUsageCount: result.newUsageCount
            });
            
            await get().processEconomicRewards([result.reward]);
            return result.reward;
          }
          
          return null;
        } else {
          // Demo mode - simulate patent usage without API calls
          console.log(`🎮 Demo: Using patent ${patentId} with hero ${heroId}`);
          
          const patent = state.availablePatents.find(p => p.id === patentId);
          if (!patent) return null;
          
          // Create demo economic reward
          const demoReward: EconomicReward = {
            id: Date.now(),
            userId: 1,
            heroId,
            rewardType: 'patent_licensing',
            amount: patent.economicValue,
            quantity: 1,
            patentId,
            battleId: `demo_patent_${Date.now()}`,
            transactionData: { patentUsed: patent.title, heroUsed: heroId },
            createdAt: new Date()
          };
          
          // Update demo state
          const currentUsage = state.patentEconomicData[patentId] || { usageCount: 0, totalValueGenerated: 0 };
          set(state => ({
            patentEconomicData: {
              ...state.patentEconomicData,
              [patentId]: {
                usageCount: currentUsage.usageCount + 1,
                totalValueGenerated: currentUsage.totalValueGenerated + patent.economicValue
              }
            },
            realTimeEconomics: {
              ...state.realTimeEconomics,
              sessionPatentLicensing: state.realTimeEconomics.sessionPatentLicensing + patent.economicValue,
              sessionEconomicValue: state.realTimeEconomics.sessionEconomicValue + patent.economicValue
            },
            economicRewards: [...state.economicRewards, demoReward]
          }));
          
          console.log(`🎮 Demo: Patent ${patentId} used successfully - earned $${patent.economicValue}`);
          return demoReward;
        }
      } catch (error) {
        console.error('❌ Failed to use patent:', error);
        // Fallback to demo mode on API error
        const patent = state.availablePatents.find(p => p.id === patentId);
        if (patent) {
          console.log('🎮 Falling back to demo patent usage due to error');
          // Create fallback demo reward
          const fallbackReward: EconomicReward = {
            id: Date.now(),
            userId: 1,
            heroId,
            rewardType: 'patent_licensing',
            amount: patent.economicValue * 0.5, // Reduced value for fallback
            quantity: 1,
            patentId,
            battleId: `fallback_${Date.now()}`,
            transactionData: { patentUsed: patent.title, heroUsed: heroId, note: 'fallback_mode' },
            createdAt: new Date()
          };
          
          set(state => ({
            economicRewards: [...state.economicRewards, fallbackReward]
          }));
          
          return fallbackReward;
        }
        return null;
      } finally {
        set({ isCalculatingRewards: false });
      }
    },
    
    // Environmental Battle System Actions
    startEnvironmentalBattle: (playerHeroId: string, threatId?: string) => {
      const playerHero = get().getHeroById(playerHeroId);
      if (!playerHero || !playerHero.owned) return;
      
      // Select threat based on hero effectiveness or random
      let selectedThreat: EnvironmentalThreat;
      if (threatId) {
        selectedThreat = getThreatById(threatId)!;
      } else {
        const effectiveThreats = get().getThreatsByHeroEffectiveness(playerHero.element);
        selectedThreat = effectiveThreats[Math.floor(Math.random() * effectiveThreats.length)] || environmentalThreats[0];
      }
      
      const battleId = `battle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      set({
        battlePhase: "battling",
        currentBattle: {
          playerHero,
          environmentalThreat: selectedThreat,
          playerHealth: playerHero.stats.health,
          threatHealth: selectedThreat.threatLevel * 15, // Scale health based on threat level
          turn: 1,
          playerTurn: playerHero.stats.speed >= selectedThreat.threatLevel * 5,
          battleId
        }
      });
    },
    
    selectThreatForBattle: (threatId: string) => {
      const threat = getThreatById(threatId);
      const selectedHero = get().selectedHero;
      
      if (threat && selectedHero) {
        get().startEnvironmentalBattle(selectedHero.id, threatId);
      }
    },
    
    executeTurn: async (abilityIndex: number) => {
      const state = get();
      const battle = state.currentBattle;
      if (!battle || state.battlePhase !== "battling") return;
      
      const attacker = battle.playerTurn ? battle.playerHero : null;
      const threat = battle.environmentalThreat;
      
      if (!attacker || !threat) return;
      
      const ability = attacker.abilities[abilityIndex] || attacker.abilities[0];
      let damage = ability.damage || 0;
      
      // Calculate damage with hero stats and threat weaknesses/resistances
      const baseDamage = damage + (attacker.stats.power * 0.5);
      let effectiveness = 1.0;
      
      if (threat.weaknesses.includes(attacker.element)) {
        effectiveness = 1.5; // 50% more effective
      } else if (threat.resistances.includes(attacker.element)) {
        effectiveness = 0.7; // 30% less effective
      }
      
      const finalDamage = Math.max(1, Math.floor(baseDamage * effectiveness * (0.8 + Math.random() * 0.4)));
      
      const newThreatHealth = battle.playerTurn 
        ? Math.max(0, battle.threatHealth - finalDamage)
        : battle.threatHealth;
      
      // Update battle state
      const updatedBattle = {
        ...battle,
        threatHealth: newThreatHealth,
        turn: battle.turn + 1,
        playerTurn: !battle.playerTurn
      };
      
      // Check for battle end
      if (newThreatHealth <= 0) {
        // Player victory!
        set({ isCalculatingRewards: true });
        
        const economicRewards = await get().calculateEconomicRewards(attacker, threat, true);
        await get().processEconomicRewards(economicRewards);
        
        const battleResult: EnvironmentalBattleResult = {
          winner: 'player',
          playerHero: attacker,
          environmentalThreat: threat,
          turns: [], // Could be expanded
          rewards: {
            experience: threat.threatLevel * 20,
            coins: threat.threatLevel * 10
          },
          economicRewards: {
            carbonCreditsEarned: threat.economicRewards.carbonCredits || 0,
            plasticConverted: threat.economicRewards.plasticConversion || 0,
            energyGenerated: threat.economicRewards.energyGeneration || 0,
            patentLicensing: threat.economicRewards.patentLicensing || 0,
            totalDollarValue: calculateThreatRewards(threat)
          },
          environmentalImpact: threat.environmentalImpact
        };
        
        set(state => ({
          battlePhase: "results",
          currentBattle: updatedBattle,
          battleHistory: [...state.battleHistory, battleResult],
          playerStats: {
            ...state.playerStats,
            wins: state.playerStats.wins + 1,
            totalBattles: state.playerStats.totalBattles + 1,
            arenaCoins: state.playerStats.arenaCoins + (battleResult.rewards.coins || 0),
            experience: state.playerStats.experience + battleResult.rewards.experience,
            environmentalThreatsDefeated: state.playerStats.environmentalThreatsDefeated + 1
          },
          isCalculatingRewards: false
        }));
        
        // Award experience to hero
        get().gainExperience(attacker.id, battleResult.rewards.experience);
      } else {
        set({ currentBattle: updatedBattle });
      }
    },
    
    endBattle: () => {
      set({
        battlePhase: "idle",
        currentBattle: null
      });
    },
    
    resetBattle: () => {
      set({
        battlePhase: "idle",
        currentBattle: null
      });
    },
    
    // Economic Rewards System Actions
    calculateEconomicRewards: async (hero: GameHero, threat: EnvironmentalThreat, victory: boolean): Promise<EconomicReward[]> => {
      if (!victory) return [];
      
      const rewards: EconomicReward[] = [];
      const state = get();
      
      // Carbon Credits Reward
      if (threat.economicRewards.carbonCredits) {
        const carbonValue = state.getCarbonCreditValue(threat.economicRewards.carbonCredits);
        rewards.push({
          id: Date.now() + Math.random(),
          userId: 1,
          heroId: hero.id,
          rewardType: 'carbon_credits',
          amount: carbonValue,
          quantity: threat.economicRewards.carbonCredits,
          battleId: state.currentBattle?.battleId,
          transactionData: { 
            threatDefeated: threat.name,
            heroUsed: hero.name,
            timestamp: new Date().toISOString()
          },
          createdAt: new Date()
        });
      }
      
      // Plastic Conversion Reward
      if (threat.economicRewards.plasticConversion) {
        const plasticValue = state.getPlasticConversionValue(threat.economicRewards.plasticConversion);
        rewards.push({
          id: Date.now() + Math.random() + 1,
          userId: 1,
          heroId: hero.id,
          rewardType: 'plastic_conversion',
          amount: plasticValue,
          quantity: threat.economicRewards.plasticConversion,
          battleId: state.currentBattle?.battleId,
          transactionData: {
            threatDefeated: threat.name,
            heroUsed: hero.name,
            timestamp: new Date().toISOString()
          },
          createdAt: new Date()
        });
      }
      
      // Energy Generation Reward
      if (threat.economicRewards.energyGeneration) {
        const energyValue = state.getEnergyGenerationValue(threat.economicRewards.energyGeneration);
        rewards.push({
          id: Date.now() + Math.random() + 2,
          userId: 1,
          heroId: hero.id,
          rewardType: 'energy_generation',
          amount: energyValue,
          quantity: threat.economicRewards.energyGeneration,
          battleId: state.currentBattle?.battleId,
          transactionData: {
            threatDefeated: threat.name,
            heroUsed: hero.name,
            timestamp: new Date().toISOString()
          },
          createdAt: new Date()
        });
      }
      
      // Patent Licensing Reward (if applicable patents are unlocked)
      if (threat.economicRewards.patentLicensing) {
        const heroPatents = state.availablePatents.filter(p => 
          p.heroAssociation === hero.id && state.checkPatentAccess(p.id)
        );
        
        if (heroPatents.length > 0) {
          rewards.push({
            id: Date.now() + Math.random() + 3,
            userId: 1,
            heroId: hero.id,
            rewardType: 'patent_licensing',
            amount: threat.economicRewards.patentLicensing,
            quantity: heroPatents.length,
            battleId: state.currentBattle?.battleId,
            transactionData: {
              threatDefeated: threat.name,
              heroUsed: hero.name,
              patentsUsed: heroPatents.map(p => p.patentNumber),
              timestamp: new Date().toISOString()
            },
            createdAt: new Date()
          });
        }
      }
      
      return rewards;
    },
    
    processEconomicRewards: async (rewards: EconomicReward[]): Promise<void> => {
      if (!rewards.length) return;
      
      try {
        const { GXCoinAPI } = await import('@/lib/api');
        
        // Process each reward through backend API for server-side validation
        for (const reward of rewards) {
          // Send to backend for persistence and audit trail
          await GXCoinAPI.addEconomicReward(reward);
          
          // Add to local rewards list after backend confirmation
          set(state => ({
            economicRewards: [...state.economicRewards, reward]
          }));
          
          // Update real-time session economics
          set(state => ({
            realTimeEconomics: {
              ...state.realTimeEconomics,
              sessionCarbonCredits: state.realTimeEconomics.sessionCarbonCredits + (reward.rewardType === 'carbon_credits' ? reward.quantity : 0),
              sessionPlasticConverted: state.realTimeEconomics.sessionPlasticConverted + (reward.rewardType === 'plastic_conversion' ? reward.quantity : 0),
              sessionEnergyGenerated: state.realTimeEconomics.sessionEnergyGenerated + (reward.rewardType === 'energy_generation' ? reward.quantity : 0),
              sessionPatentLicensing: state.realTimeEconomics.sessionPatentLicensing + (reward.rewardType === 'patent_licensing' ? reward.amount : 0),
              sessionEconomicValue: state.realTimeEconomics.sessionEconomicValue + reward.amount
            }
          }));
        }
        
        console.log(`✅ ${rewards.length} economic rewards processed and persisted via backend API`);
      } catch (error) {
        console.error('❌ Failed to process economic rewards via backend API:', error);
        // Still update local state even if backend fails, but log the issue
        for (const reward of rewards) {
          set(state => ({
            economicRewards: [...state.economicRewards, reward]
          }));
        }
      }
    },
    
    getSessionEconomicSummary: (): string => {
      const state = get();
      const econ = state.realTimeEconomics;
      return `Session: $${econ.sessionEconomicValue.toFixed(2)} earned | ${econ.sessionCarbonCredits.toFixed(1)}t CO₂ | ${econ.sessionPlasticConverted} bottles | ${econ.sessionEnergyGenerated.toFixed(0)} kWh`;
    },
    
    getLifetimeEconomicSummary: (): string => {
      const state = get();
      const stats = state.userEconomicStats;
      if (!stats) return "No lifetime data available";
      return `Lifetime: $${stats.totalEconomicValue.toFixed(2)} | ${stats.carbonTonsSequestered.toFixed(1)}t CO₂ | ${stats.totalPlasticConverted} bottles | ${stats.environmentalThreatsDefeated} threats defeated`;
    },
    
    // Arena Navigation
    setArenaView: (view: ArenaView) => {
      set({ currentView: view });
    },
    
    // Progression Actions
    gainExperience: (heroId: string, amount: number) => {
      set(state => ({
        gameHeroes: state.gameHeroes.map(hero => {
          if (hero.id === heroId && hero.owned) {
            const newExp = hero.experience + amount;
            if (newExp >= hero.maxExperience) {
              // Level up!
              return {
                ...hero,
                level: hero.level + 1,
                experience: newExp - hero.maxExperience,
                maxExperience: hero.maxExperience + 200,
                stats: {
                  power: hero.stats.power + 3,
                  health: hero.stats.health + 5,
                  speed: hero.stats.speed + 2
                }
              };
            }
            return { ...hero, experience: newExp };
          }
          return hero;
        })
      }));
    },
    
    spendArenaCoins: (amount: number) => {
      const state = get();
      if (state.playerStats.arenaCoins >= amount) {
        set(state => ({
          playerStats: {
            ...state.playerStats,
            arenaCoins: state.playerStats.arenaCoins - amount
          }
        }));
        return true;
      }
      return false;
    },
    
    addArenaCoins: (amount: number) => {
      set(state => ({
        playerStats: {
          ...state.playerStats,
          arenaCoins: state.playerStats.arenaCoins + amount
        }
      }));
    },
    
    // Real-world Economic Functions
    getCarbonCreditValue: (tons: number): number => {
      return tons * 175; // $175 per ton of CO2
    },
    
    getPlasticConversionValue: (bottles: number): number => {
      return bottles * 1.25; // $1.25 per bottle converted
    },
    
    getEnergyGenerationValue: (kwh: number): number => {
      return kwh * 0.15; // $0.15 per kWh clean energy generated
    },
    
    // Utility functions
    getHeroById: (heroId: string) => {
      return get().gameHeroes.find(hero => hero.id === heroId);
    },
    
    getOwnedHeroes: () => {
      return get().gameHeroes.filter(hero => hero.owned);
    },
    
    getAvailableHeroes: () => {
      return get().gameHeroes.filter(hero => !hero.owned);
    },
    
    canAfford: (cost: number) => {
      return get().playerStats.arenaCoins >= cost;
    },
    
    getThreatsByHeroEffectiveness: (heroElement: string): EnvironmentalThreat[] => {
      return environmentalThreats.filter(threat => 
        threat.weaknesses.includes(heroElement)
      );
    }
  }))
);