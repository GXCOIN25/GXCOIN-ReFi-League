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
