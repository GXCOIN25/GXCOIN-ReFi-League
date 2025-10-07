import React from 'react';
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { gameHeroes as heroData } from "@/data/gameHeroes";
import { GameHero, NFTBadge } from "@/types/heroes";
import { GXCoinAPI } from "@/lib/api";
import { useUser } from "./useUser";
import { useContribution } from "./useContribution";
import { HeroType } from "../../contracts/ERC721";

interface NFTMintingProgress {
  heroId: string;
  level: number;
  stage: 'preparing' | 'minting' | 'confirming' | 'completed' | 'failed';
  transactionHash?: string;
  error?: string;
  timestamp: number;
}

interface HeroState {
  heroes: GameHero[];
  selectedHero: GameHero | null;
  nftBadges: NFTBadge[];
  mintingProgress: NFTMintingProgress[];
  
  // Actions
  selectHero: (heroId: string) => void;
  clearSelection: () => void;
  unlockNFTBadge: (heroId: string, level: number, transactionHash?: string) => Promise<void>;
  loadUserNFTs: () => Promise<void>;
  getNFTBadges: (heroId: string) => NFTBadge[];
  
  // NFT minting progress tracking
  startMinting: (heroId: string, level: number) => void;
  updateMintingProgress: (heroId: string, level: number, stage: NFTMintingProgress['stage'], transactionHash?: string, error?: string) => void;
  completeMinting: (heroId: string, level: number, transactionHash: string) => Promise<void>;
  getMintingProgress: (heroId: string, level: number) => NFTMintingProgress | null;
  clearMintingProgress: (heroId: string, level: number) => void;
  
  // Hero progression integration
  upgradeHeroFromNFT: (heroId: string, level: number) => void;
  getHeroMintingEligibility: (heroId: string, level: number) => { eligible: boolean; reason?: string };
  
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
    mintingProgress: [],
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
    
    unlockNFTBadge: async (heroId: string, level: number, transactionHash?: string) => {
      const user = useUser.getState().currentUser;
      if (!user) return;
      
      set({ isLoading: true });
      
      try {
        const hero = heroData.find(h => h.id === heroId);
        if (!hero) {
          throw new Error(`Hero not found: ${heroId}`);
        }
        
        const evolution = level > 6 ? "Legendary" : level > 4 ? "Epic" : level > 2 ? "Rare" : "Common";
        const rarity = evolution;
        const attributes = {
          power: level * 10 + (hero.stats?.power || 50),
          impact: level * 15,
          rarity: level * 5,
          health: hero.stats?.health || 100,
          speed: hero.stats?.speed || 75
        };
        
        // Save to backend with transaction hash if provided
        const apiBadge = await GXCoinAPI.createNFTBadge({
          heroId,
          level,
          evolution,
          rarity,
          attributes,
          minted: !!transactionHash
        });
        
        const newBadge: NFTBadge = {
          id: `${heroId}-${level}-${Date.now()}`,
          heroId,
          level,
          evolution,
          rarity,
          attributes
        };
        
        set(state => ({
          nftBadges: [...state.nftBadges.filter(b => !(b.heroId === heroId && b.level === level)), newBadge],
          isLoading: false
        }));
        
        // Upgrade hero stats based on NFT
        get().upgradeHeroFromNFT(heroId, level);
        
      } catch (error) {
        console.error('Failed to unlock NFT badge:', error);
        set({ isLoading: false });
        throw error; // Re-throw to handle in UI
      }
    },
    
    startMinting: (heroId: string, level: number) => {
      const progress: NFTMintingProgress = {
        heroId,
        level,
        stage: 'preparing',
        timestamp: Date.now()
      };
      
      set(state => ({
        mintingProgress: [
          ...state.mintingProgress.filter(p => !(p.heroId === heroId && p.level === level)),
          progress
        ]
      }));
    },
    
    updateMintingProgress: (heroId: string, level: number, stage: NFTMintingProgress['stage'], transactionHash?: string, error?: string) => {
      set(state => ({
        mintingProgress: state.mintingProgress.map(p => 
          p.heroId === heroId && p.level === level
            ? { ...p, stage, transactionHash, error, timestamp: Date.now() }
            : p
        )
      }));
    },
    
    completeMinting: async (heroId: string, level: number, transactionHash: string) => {
      try {
        // Update progress to completed
        get().updateMintingProgress(heroId, level, 'completed', transactionHash);
        
        // Create the NFT badge
        await get().unlockNFTBadge(heroId, level, transactionHash);
        
        // Clear progress after successful completion
        setTimeout(() => {
          get().clearMintingProgress(heroId, level);
        }, 5000); // Keep visible for 5 seconds
        
      } catch (error) {
        get().updateMintingProgress(heroId, level, 'failed', transactionHash, error instanceof Error ? error.message : 'Failed to complete minting');
        throw error;
      }
    },
    
    getMintingProgress: (heroId: string, level: number) => {
      const { mintingProgress } = get();
      return mintingProgress.find(p => p.heroId === heroId && p.level === level) || null;
    },
    
    clearMintingProgress: (heroId: string, level: number) => {
      set(state => ({
        mintingProgress: state.mintingProgress.filter(p => !(p.heroId === heroId && p.level === level))
      }));
    },
    
    upgradeHeroFromNFT: (heroId: string, level: number) => {
      set(state => ({
        heroes: state.heroes.map(hero => {
          if (hero.id === heroId) {
            const newLevel = Math.max(hero.level, level);
            const experienceGain = level * 100;
            const newExperience = hero.experience + experienceGain;
            const maxExp = newLevel * 200; // Dynamic max experience
            
            return {
              ...hero,
              level: newLevel,
              experience: Math.min(newExperience, maxExp),
              maxExperience: maxExp,
              // Boost stats based on NFT level
              stats: {
                power: hero.stats.power + (level * 2),
                health: hero.stats.health + (level * 3),
                speed: hero.stats.speed + (level * 1)
              }
            };
          }
          return hero;
        })
      }));
    },
    
    getHeroMintingEligibility: (heroId: string, level: number) => {
      const hero = heroData.find(h => h.id === heroId);
      if (!hero) {
        return { eligible: false, reason: 'Hero not found' };
      }
      
      const user = useUser.getState().currentUser;
      if (!user) {
        return { eligible: false, reason: 'Please log in to mint NFTs' };
      }
      
      // Check if hero is owned/unlocked
      if (!hero.owned) {
        return { eligible: false, reason: 'Hero must be unlocked first' };
      }
      
      // Check if already minted this level
      const existingBadge = get().nftBadges.find(b => b.heroId === heroId && b.level === level);
      if (existingBadge) {
        return { eligible: false, reason: `Level ${level} NFT already minted for this hero` };
      }
      
      // Check if hero meets level requirement
      if (hero.level < level) {
        return { eligible: false, reason: `Hero must reach level ${level} before minting this NFT` };
      }
      
      // Check if currently minting
      const currentProgress = get().getMintingProgress(heroId, level);
      if (currentProgress && ['preparing', 'minting', 'confirming'].includes(currentProgress.stage)) {
        return { eligible: false, reason: 'Already minting this NFT' };
      }
      
      return { eligible: true };
    },
    
    loadUserNFTs: async () => {
      const user = useUser.getState().currentUser;
      if (!user) return;
      
      set({ isLoading: true });
      
      try {
        const badges = await GXCoinAPI.getUserNFTBadges();
        const nftBadges: NFTBadge[] = badges.map(badge => ({
          id: `${badge.heroId}-${badge.level}-${Date.now()}`,
          heroId: badge.heroId,
          level: badge.level,
          evolution: badge.evolution,
          rarity: badge.rarity,
          attributes: badge.attributes
        }));
        
        set({ nftBadges, isLoading: false });
        
        // Apply NFT upgrades to heroes
        nftBadges.forEach(badge => {
          get().upgradeHeroFromNFT(badge.heroId, badge.level);
        });
        
      } catch (error) {
        console.error('Failed to load NFT badges:', error);
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