import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { GameHero, BattleResult, BattleTurn } from "@/types/heroes";
import { gameHeroes as initialGameHeroes } from "@/data/gameHeroes";

export type BattlePhase = "idle" | "selecting" | "battling" | "results";
export type ArenaView = "collection" | "battle" | "shop" | "leaderboard";

interface GameArenaState {
  // Hero Management
  gameHeroes: GameHero[];
  selectedHero: GameHero | null;
  
  // Battle System
  battlePhase: BattlePhase;
  currentBattle: {
    playerHero: GameHero | null;
    opponentHero: GameHero | null;
    playerHealth: number;
    opponentHealth: number;
    turn: number;
    playerTurn: boolean;
  } | null;
  battleHistory: BattleResult[];
  
  // Arena State
  currentView: ArenaView;
  playerStats: {
    wins: number;
    losses: number;
    totalBattles: number;
    arenaCoins: number;
    rank: number;
    experience: number;
  };
  
  // Loading states
  isLoading: boolean;
  
  // Actions - Hero Management
  selectHero: (heroId: string) => void;
  clearHeroSelection: () => void;
  updateHeroStats: (heroId: string, stats: Partial<GameHero['stats']>) => void;
  unlockHero: (heroId: string) => void;
  upgradeHero: (heroId: string) => void;
  
  // Actions - Battle System
  startBattle: (playerHeroId: string, opponentHeroId?: string) => void;
  executeTurn: (abilityIndex: number) => void;
  endBattle: () => void;
  resetBattle: () => void;
  
  // Actions - Arena Navigation
  setArenaView: (view: ArenaView) => void;
  
  // Actions - Progression
  gainExperience: (heroId: string, amount: number) => void;
  spendArenaCoins: (amount: number) => boolean;
  addArenaCoins: (amount: number) => void;
  
  // Utility functions
  getHeroById: (heroId: string) => GameHero | undefined;
  getOwnedHeroes: () => GameHero[];
  getAvailableHeroes: () => GameHero[];
  canAfford: (cost: number) => boolean;
}

export const useGameArena = create<GameArenaState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    gameHeroes: initialGameHeroes,
    selectedHero: null,
    battlePhase: "idle",
    currentBattle: null,
    battleHistory: [],
    currentView: "collection",
    playerStats: {
      wins: 0,
      losses: 0,
      totalBattles: 0,
      arenaCoins: 1000, // Starting coins
      rank: 1,
      experience: 0
    },
    isLoading: false,
    
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
    
    // Battle System Actions
    startBattle: (playerHeroId: string, opponentHeroId?: string) => {
      const playerHero = get().getHeroById(playerHeroId);
      if (!playerHero || !playerHero.owned) return;
      
      // Select random opponent if none specified
      const availableOpponents = get().gameHeroes.filter(h => h.id !== playerHeroId);
      const opponentHero = opponentHeroId 
        ? get().getHeroById(opponentHeroId)
        : availableOpponents[Math.floor(Math.random() * availableOpponents.length)];
      
      if (!opponentHero) return;
      
      set({
        battlePhase: "battling",
        currentBattle: {
          playerHero,
          opponentHero,
          playerHealth: playerHero.stats.health,
          opponentHealth: opponentHero.stats.health,
          turn: 1,
          playerTurn: playerHero.stats.speed >= opponentHero.stats.speed
        }
      });
    },
    
    executeTurn: (abilityIndex: number) => {
      const state = get();
      const battle = state.currentBattle;
      if (!battle || state.battlePhase !== "battling") return;
      
      const attacker = battle.playerTurn ? battle.playerHero : battle.opponentHero;
      const defender = battle.playerTurn ? battle.opponentHero : battle.playerHero;
      
      if (!attacker || !defender) return;
      
      const ability = attacker.abilities[abilityIndex] || attacker.abilities[0];
      const damage = ability.damage || 0;
      const baseDamage = damage + (attacker.stats.power * 0.5);
      const finalDamage = Math.max(1, Math.floor(baseDamage * (0.8 + Math.random() * 0.4)));
      
      const newDefenderHealth = battle.playerTurn 
        ? Math.max(0, battle.opponentHealth - finalDamage)
        : Math.max(0, battle.playerHealth - finalDamage);
      
      const updatedBattle = {
        ...battle,
        playerHealth: battle.playerTurn ? battle.playerHealth : newDefenderHealth,
        opponentHealth: battle.playerTurn ? newDefenderHealth : battle.opponentHealth,
        turn: battle.turn + 1,
        playerTurn: !battle.playerTurn
      };
      
      // Check for battle end
      if (newDefenderHealth <= 0) {
        const winner = battle.playerTurn ? 'player' : 'opponent';
        const battleResult: BattleResult = {
          winner,
          playerHero: battle.playerHero!,
          opponentHero: battle.opponentHero!,
          turns: [], // Could be expanded to track all turns
          rewards: {
            experience: winner === 'player' ? 100 : 25,
            coins: winner === 'player' ? 50 : 10
          }
        };
        
        set(state => ({
          battlePhase: "results",
          currentBattle: updatedBattle,
          battleHistory: [...state.battleHistory, battleResult],
          playerStats: {
            ...state.playerStats,
            wins: winner === 'player' ? state.playerStats.wins + 1 : state.playerStats.wins,
            losses: winner === 'opponent' ? state.playerStats.losses + 1 : state.playerStats.losses,
            totalBattles: state.playerStats.totalBattles + 1,
            arenaCoins: state.playerStats.arenaCoins + (battleResult.rewards.coins || 0),
            experience: state.playerStats.experience + battleResult.rewards.experience
          }
        }));
        
        // Award experience to hero
        if (winner === 'player') {
          get().gainExperience(battle.playerHero!.id, battleResult.rewards.experience);
        }
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
    }
  }))
);