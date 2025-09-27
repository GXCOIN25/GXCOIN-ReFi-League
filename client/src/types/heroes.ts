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

// Enhanced Game Arena specific types with Patent Integration
export interface GameHero {
  id: string;
  name: string;
  symbol: string;
  title: string;
  description: string;
  element: 'Fire' | 'Ice' | 'Electric' | 'Dark' | 'Earth' | 'Air' | 'Light' | 'Universal' | 'BioChar' | 'Water' | 'Carbon' | 'Energy' | 'Construction' | 'DeFi';
  rarity: 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
  color: string;
  gradient: string;
  
  // Battle Stats
  stats: {
    power: number;
    health: number;
    speed: number;
  };
  
  // Special Abilities with Economic Effects
  abilities: {
    name: string;
    description: string;
    cooldown: number;
    damage?: number;
    effect?: string;
    economicEffect?: {
      type: 'carbon_credits' | 'plastic_conversion' | 'patent_licensing' | 'energy_generation';
      baseValue: number;
      quantity: number;
    };
    requiredPatents?: number[]; // Patent IDs required to unlock this ability
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

// Patent System Types
export interface Patent {
  id: number;
  patentNumber: string;
  title: string;
  description: string;
  category: 'biochar' | 'water' | 'carbon' | 'energy' | 'construction';
  economicValue: number;
  environmentalImpact: Record<string, number>;
  accessLevel: number;
  heroAssociation?: string;
  createdAt?: Date;
}

// Environmental Battle System Types
export interface EnvironmentalThreat {
  id: string;
  name: string;
  type: 'big_tech_ai' | 'toxic_mining' | 'fast_fashion' | 'fossil_fuel' | 'industrial_pollution' | 'deforestation';
  icon: string;
  description: string;
  threatLevel: number; // 1-10 difficulty
  economicRewards: {
    carbonCredits?: number; // tons of CO2
    plasticConversion?: number; // bottles converted
    energyGeneration?: number; // kWh generated
    patentLicensing?: number; // direct licensing value
  };
  environmentalImpact: Record<string, number>;
  requiredHeroLevel: number;
  weaknesses: string[]; // Hero elements that are effective
  resistances: string[]; // Hero elements that are less effective
}

// Economic Reward Types
export interface EconomicReward {
  id: number;
  userId: number;
  heroId: string;
  rewardType: 'carbon_credits' | 'plastic_conversion' | 'patent_licensing' | 'energy_generation';
  amount: number; // Dollar value
  quantity: number; // Resource quantity (tons, bottles, kWh, etc.)
  patentId?: number;
  battleId?: string;
  transactionData: Record<string, any>;
  createdAt: Date;
}

// User Economic Statistics
export interface UserEconomicStats {
  id: number;
  userId: number;
  totalCarbonCredits: number;
  totalPlasticConverted: number;
  totalEnergyGenerated: number;
  totalPatentLicensing: number;
  totalEconomicValue: number;
  carbonTonsSequestered: number;
  environmentalThreatsDefeated: number;
  patentsUnlocked: number;
  updatedAt: Date;
}

// Enhanced Battle Result with Economic Data
export interface EnvironmentalBattleResult extends Omit<BattleResult, 'opponentHero'> {
  environmentalThreat: EnvironmentalThreat;
  economicRewards: {
    carbonCreditsEarned: number;
    plasticConverted: number;
    energyGenerated: number;
    patentLicensing: number;
    totalDollarValue: number;
  };
  environmentalImpact: Record<string, number>;
  patentsUnlocked?: Patent[];
}
