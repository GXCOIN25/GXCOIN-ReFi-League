import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    
    if (!publishableKey) {
      console.warn('Stripe publishable key not found in environment variables');
      return Promise.resolve(null);
    }
    
    stripePromise = loadStripe(publishableKey);
  }
  
  return stripePromise;
};

export type HeroRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';

export interface PricingTier {
  rarity: HeroRarity;
  price: number;
  displayPrice: string;
}

export const PRICING_TIERS: Record<HeroRarity, PricingTier> = {
  Common: {
    rarity: 'Common',
    price: 9.99,
    displayPrice: '$9.99'
  },
  Rare: {
    rarity: 'Rare',
    price: 24.99,
    displayPrice: '$24.99'
  },
  Epic: {
    rarity: 'Epic',
    price: 49.99,
    displayPrice: '$49.99'
  },
  Legendary: {
    rarity: 'Legendary',
    price: 99.99,
    displayPrice: '$99.99'
  },
  Mythic: {
    rarity: 'Mythic',
    price: 199.99,
    displayPrice: '$199.99'
  }
};

export const getPriceForRarity = (rarity: HeroRarity): PricingTier => {
  return PRICING_TIERS[rarity] || PRICING_TIERS.Common;
};

export const formatPrice = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const estimateGasFee = (): string => {
  return '$2.50';
};
