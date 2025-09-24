import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { heroes as heroData } from "@/data/heroes";
import { Hero, NFTBadge } from "@/types/heroes";
import { GXCoinAPI } from "@/lib/api";
import { useUser } from "./useUser";

interface HeroState {
  heroes: Hero[];
  selectedHero: Hero | null;
  nftBadges: NFTBadge[];
  
  // Actions
  selectHero: (heroId: string) => void;
  clearSelection: () => void;
  unlockNFTBadge: (heroId: string, level: number) => Promise<void>;
  loadUserNFTs: () => Promise<void>;
  getNFTBadges: (heroId: string) => NFTBadge[];
  isLoading: boolean;
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
    }
  }))
);
