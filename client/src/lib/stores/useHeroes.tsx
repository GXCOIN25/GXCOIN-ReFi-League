import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { gameHeroes as heroData } from "@/data/gameHeroes";
import { GameHero, NFTBadge } from "@/types/heroes";
import { GXCoinAPI } from "@/lib/api";
import { useUser } from "./useUser";
import { useContribution } from "./useContribution";

interface HeroState {
  heroes: GameHero[];
  selectedHero: GameHero | null;
  nftBadges: NFTBadge[];
  
  // Actions
  selectHero: (heroId: string) => void;
  clearSelection: () => void;
  unlockNFTBadge: (heroId: string, level: number) => Promise<void>;
  loadUserNFTs: () => Promise<void>;
  getNFTBadges: (heroId: string) => NFTBadge[];
  isLoading: boolean;
  
  // GXCOIN Anchor Power selectors
  isHeroUnlocked: (heroId: string) => boolean;
  getEffectiveStats: (heroId: string) => { power: number; health: number; speed: number } | null;
}

export const useHeroes = create<HeroState>()(
  subscribeWithSelector((set, get) => ({
    heroes: heroData,
    selectedHero: null,
    nftBadges: [],
    isLoading: false,
    
    selectHero: (heroId: string) => {
      const hero = get().heroes.find(h => h.id === heroId);
      if (hero) {
        set({ selectedHero: hero });
      }
    },
    
    clearSelection: () => {
      set({ selectedHero: null });
    },
    
    unlockNFTBadge: async (heroId: string, level: number) => {
      const user = useUser.getState().currentUser;
      if (!user) return;
      
      set({ isLoading: true });
      
      try {
        const evolution = level > 3 ? "Legendary" : level > 1 ? "Rare" : "Common";
        const rarity = evolution;
        const attributes = {
          power: level * 10,
          impact: level * 15,
          rarity: level * 5
        };
        
        // Save to backend
        const apiBadge = await GXCoinAPI.createNFTBadge({
          heroId,
          level,
          evolution,
          rarity,
          attributes
        });
        
        const newBadge: NFTBadge = {
          id: `${heroId}-${level}`,
          heroId,
          level,
          evolution,
          rarity,
          attributes
        };
        
        set(state => ({
          nftBadges: [...state.nftBadges.filter(b => b.id !== newBadge.id), newBadge],
          isLoading: false
        }));
      } catch (error) {
        console.error('Failed to unlock NFT badge:', error);
        set({ isLoading: false });
      }
    },
    
    loadUserNFTs: async () => {
      const user = useUser.getState().currentUser;
      if (!user) return;
      
      set({ isLoading: true });
      
      try {
        const apiBadges = await GXCoinAPI.getUserNFTBadges();
        const nftBadges = apiBadges.map(badge => ({
          id: `${badge.heroId}-${badge.level}`,
          heroId: badge.heroId,
          level: badge.level,
          evolution: badge.evolution,
          rarity: badge.rarity,
          attributes: badge.attributes
        }));
        
        set({ nftBadges, isLoading: false });
      } catch (error) {
        console.error('Failed to load user NFTs:', error);
        set({ isLoading: false });
      }
    },
    
    getNFTBadges: (heroId: string) => {
      return get().nftBadges.filter(badge => badge.heroId === heroId);
    },
    
    // GXCOIN Anchor Power selectors
    isHeroUnlocked: (heroId: string) => {
      const hero = get().heroes.find(h => h.id === heroId);
      if (!hero) {
        console.log(`[GXCOIN] Hero not found: ${heroId}`);
        return false;
      }
      
      // Anchor heroes are always unlocked
      if (hero.isAnchor) {
        console.log(`[GXCOIN] Anchor hero ${heroId} is always unlocked`);
        return true;
      }
      
      // Non-anchor heroes that require anchor need anchorPower >= 1
      if (hero.requireAnchor) {
        const anchorPower = useContribution.getState().anchorPower;
        const unlocked = anchorPower >= 1;
        console.log(`[GXCOIN] Hero ${heroId} requires anchor. AnchorPower: ${anchorPower}, Unlocked: ${unlocked}`);
        return unlocked;
      }
      
      // Heroes that don't require anchor are always unlocked
      console.log(`[GXCOIN] Hero ${heroId} doesn't require anchor, always unlocked`);
      return true;
    },
    
    getEffectiveStats: (heroId: string) => {
      const hero = get().heroes.find(h => h.id === heroId);
      if (!hero || !hero.stats) {
        console.log(`[GXCOIN] Hero not found or has no stats: ${heroId}`);
        return null;
      }
      
      // Anchor heroes return their base stats unchanged
      if (hero.isAnchor) {
        console.log(`[GXCOIN] Anchor hero ${heroId} returns base stats:`, hero.stats);
        return hero.stats;
      }
      
      // Non-anchor heroes get their stats multiplied by anchor multiplier
      const anchorMultiplier = useContribution.getState().getAnchorMultiplier();
      const effectiveStats = {
        power: Math.round(hero.stats.power * anchorMultiplier),
        health: Math.round(hero.stats.health * anchorMultiplier),
        speed: Math.round(hero.stats.speed * anchorMultiplier)
      };
      
      console.log(`[GXCOIN] Hero ${heroId} effective stats (${anchorMultiplier}x):`, effectiveStats);
      return effectiveStats;
    }
  }))
);
