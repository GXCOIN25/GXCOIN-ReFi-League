import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { heroes as heroData } from "@/data/heroes";
import { Hero, NFTBadge } from "@/types/heroes";

interface HeroState {
  heroes: Hero[];
  selectedHero: Hero | null;
  nftBadges: NFTBadge[];
  
  // Actions
  selectHero: (heroId: string) => void;
  clearSelection: () => void;
  unlockNFTBadge: (heroId: string, level: number) => void;
  getNFTBadges: (heroId: string) => NFTBadge[];
}

export const useHeroes = create<HeroState>()(
  subscribeWithSelector((set, get) => ({
    heroes: heroData,
    selectedHero: null,
    nftBadges: [],
    
    selectHero: (heroId: string) => {
      const hero = get().heroes.find(h => h.id === heroId);
      if (hero) {
        set({ selectedHero: hero });
      }
    },
    
    clearSelection: () => {
      set({ selectedHero: null });
    },
    
    unlockNFTBadge: (heroId: string, level: number) => {
      const newBadge: NFTBadge = {
        id: `${heroId}-${level}`,
        heroId,
        level,
        evolution: level > 3 ? "Legendary" : level > 1 ? "Rare" : "Common",
        rarity: level > 3 ? "Legendary" : level > 1 ? "Rare" : "Common",
        attributes: {
          power: level * 10,
          impact: level * 15,
          rarity: level * 5
        }
      };
      
      set(state => ({
        nftBadges: [...state.nftBadges.filter(b => b.id !== newBadge.id), newBadge]
      }));
    },
    
    getNFTBadges: (heroId: string) => {
      return get().nftBadges.filter(badge => badge.heroId === heroId);
    }
  }))
);
