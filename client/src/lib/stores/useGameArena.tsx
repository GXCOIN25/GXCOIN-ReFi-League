import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { GameHero, EnvironmentalBattleResult, BattleTurn, EnvironmentalThreat, Patent, EconomicReward, UserEconomicStats } from "@/types/heroes";
import { gameHeroes as initialGameHeroes } from "@/data/gameHeroes";
import { environmentalThreats, getThreatById, calculateThreatRewards } from "@/data/environmentalThreats";

export type BattlePhase = "idle" | "selecting" | "battling" | "results";
export type ArenaView = "collection" | "battle" | "patents" | "economics" | "shop" | "leaderboard";

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
    // Initial state
    gameHeroes: initialGameHeroes,
    selectedHero: null,
    availablePatents: [],
    userPatentAccess: [], // Will be loaded from backend API
    patentEconomicData: {},
    battlePhase: "idle",
    currentBattle: null,
    battleHistory: [],
    economicRewards: [],
    userEconomicStats: null,
    realTimeEconomics: {
      sessionCarbonCredits: 0,
      sessionPlasticConverted: 0,
      sessionEnergyGenerated: 0,
      sessionPatentLicensing: 0,
      sessionEconomicValue: 0
    },
    currentView: "collection",
    playerStats: {
      wins: 0,
      losses: 0,
      totalBattles: 0,
      arenaCoins: 1000,
      rank: 1,
      experience: 0,
      environmentalThreatsDefeated: 0
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
      } catch (error) {
        console.error("Failed to load patents:", error);
        set({ availablePatents: [], userPatentAccess: [] });
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
        const { GXCoinAPI } = await import('@/lib/api');
        
        // Call backend API to unlock patent with server-side validation
        const result = await GXCoinAPI.unlockPatent(patentId);
        
        // Update local state with backend response
        set(state => ({
          userPatentAccess: [...state.userPatentAccess, patentId],
          patentEconomicData: {
            ...state.patentEconomicData,
            [patentId]: { usageCount: 0, totalValueGenerated: 0 }
          }
        }));
        
        console.log(`✅ Patent ${patentId} unlocked successfully via backend API`);
        return true;
      } catch (error) {
        console.error('❌ Failed to unlock patent via backend API:', error);
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
        const { GXCoinAPI } = await import('@/lib/api');
        
        // Call backend API to use patent with server-side validation
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
      } catch (error) {
        console.error('❌ Failed to use patent via backend API:', error);
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