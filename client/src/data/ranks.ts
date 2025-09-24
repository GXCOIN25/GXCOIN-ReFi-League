import { Rank, Mission } from "@/types/heroes";

export const ranks: Rank[] = [
  {
    id: "bronze",
    name: "Bronze Recruit",
    tier: "Recruit",
    minContribution: 175,
    color: "#cd7f32",
    benefits: [
      "Remove 1,000 gallons of plastic waste",
      "Eco-Warrior Hemp Badge",
      "GXCOIN Visa Spark Basic Plan",
      "Community access"
    ],
    cardType: "Basic Visa",
    nftType: "Bronze Badge",
    impactMultiplier: 1.0
  },
  {
    id: "silver",
    name: "Silver Defender",
    tier: "Defender",
    minContribution: 500,
    color: "#c0c0c0",
    benefits: [
      "Tradable Dynamic NFTs",
      "Hemp wellness discounts",
      "Community summit invites",
      "Bitcoin cashback",
      "Enhanced card benefits"
    ],
    cardType: "Silver Visa",
    nftType: "Dynamic NFT",
    impactMultiplier: 1.5
  },
  {
    id: "gold",
    name: "Gold Guardian",
    tier: "Guardian",
    minContribution: 1000,
    color: "#ffd700",
    benefits: [
      "Ecosystem rewards amplified",
      "Detailed impact reports",
      "Higher staking rewards",
      "VIP support access"
    ],
    cardType: "Gold Visa",
    nftType: "Gold Guardian NFT",
    impactMultiplier: 2.0
  },
  {
    id: "platinum",
    name: "Platinum Champion",
    tier: "Champion",
    minContribution: 5000,
    color: "#e5e4e2",
    benefits: [
      "Early token access",
      "Custom Ambassador NFTs",
      "Airdrop priority",
      "BLACK CARD premium benefits",
      "Partner briefings",
      "VIP events"
    ],
    cardType: "Platinum BLACK CARD",
    nftType: "Ambassador NFT",
    impactMultiplier: 3.0
  },
  {
    id: "diamond",
    name: "Diamond Legend",
    tier: "Legend",
    minContribution: 10000,
    color: "#b9f2ff",
    benefits: [
      "DAO voting rights",
      "Custom impact dashboard",
      "Leadership strategy calls",
      "Initiative proposals",
      "Ultimate BLACK CARD",
      "Inner circle access"
    ],
    cardType: "Diamond BLACK CARD",
    nftType: "Legend NFT",
    impactMultiplier: 5.0
  }
];

export const missions: Mission[] = [
  {
    id: "beta-launch",
    title: "Beta Launch",
    description: "GXCOIN heroes assemble for the first time",
    progress: 100,
    target: 100,
    reward: "Founder NFT Badge",
    unlocked: true,
    completed: true
  },
  {
    id: "dex-release",
    title: "DeX Release",
    description: "Full decentralized exchange goes live",
    progress: 75,
    target: 100,
    reward: "Trading Master Badge",
    unlocked: true,
    completed: false
  },
  {
    id: "community-million",
    title: "1M Community",
    description: "Reach 1 million eco-warriors",
    progress: 25,
    target: 100,
    reward: "Community Champion Badge",
    unlocked: true,
    completed: false
  },
  {
    id: "billion-assets",
    title: "$1B Regenerated",
    description: "Achieve $1 billion in regenerated assets",
    progress: 15,
    target: 100,
    reward: "Asset Guardian Badge",
    unlocked: false,
    completed: false
  }
];
