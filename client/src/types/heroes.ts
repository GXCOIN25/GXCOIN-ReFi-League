export interface Hero {
  id: string;
  name: string;
  symbol: string;
  title: string;
  description: string;
  color: string;
  gradient: string;
  powers: string[];
  assetValue: string;
  impact: string;
  nftBadge: string;
}

export interface Rank {
  id: string;
  name: string;
  tier: string;
  minContribution: number;
  color: string;
  benefits: string[];
  cardType: string;
  nftType: string;
  impactMultiplier: number;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  reward: string;
  unlocked: boolean;
  completed: boolean;
}

export interface NFTBadge {
  id: string;
  heroId: string;
  level: number;
  evolution: string;
  rarity: string;
  attributes: Record<string, number>;
}

// Game Arena specific types
export interface GameHero {
  id: string;
  name: string;
  title: string;
  description: string;
  element: 'Fire' | 'Ice' | 'Electric' | 'Dark' | 'Earth' | 'Air' | 'Light';
  rarity: 'Rare' | 'Epic' | 'Legendary';
  color: string;
  gradient: string;
  
  // Battle Stats
  stats: {
    power: number;
    health: number;
    speed: number;
  };
  
  // Special Abilities
  abilities: {
    name: string;
    description: string;
    cooldown: number;
    damage?: number;
    effect?: string;
  }[];
  
  // Ownership and progression
  owned: boolean;
  level: number;
  experience: number;
  maxExperience: number;
  
  // Visual
  avatar: string;
  battleSprite: string;
}

export interface BattleResult {
  winner: 'player' | 'opponent' | 'draw';
  playerHero: GameHero;
  opponentHero: GameHero;
  turns: BattleTurn[];
  rewards: {
    experience: number;
    coins?: number;
    items?: string[];
  };
}

export interface BattleTurn {
  attacker: string;
  ability: string;
  damage: number;
  effect?: string;
  targetHealth: number;
}
