// ERC-721 NFT Contract Interface for GXCOIN Hero dNFTs
import { ethers } from 'ethers';

// Standard ERC-721 ABI for NFT minting
export const ERC721_ABI = [
  // Read functions
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function balanceOf(address owner) view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function totalSupply() view returns (uint256)",
  
  // Minting functions
  "function mint(address to, uint256 tokenId, string memory uri) payable",
  "function safeMint(address to, string memory uri) payable returns (uint256)",
  "function mintHero(address to, uint256 heroType, uint256 level, bytes memory data) payable returns (uint256)",
  
  // Price and cost functions
  "function mintPrice() view returns (uint256)",
  "function heroMintCost(uint256 heroType, uint256 level) view returns (uint256)",
  
  // Events
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)",
  "event ApprovalForAll(address indexed owner, address indexed operator, bool approved)",
  "event HeroMinted(address indexed owner, uint256 indexed tokenId, uint256 heroType, uint256 level)"
];

// GXCOIN Hero NFT specific ABI extensions
export const HERO_NFT_ABI = [
  ...ERC721_ABI,
  // Hero-specific functions
  "function getHeroData(uint256 tokenId) view returns (uint256 heroType, uint256 level, uint256 experience, uint256 power)",
  "function upgradeHero(uint256 tokenId, uint256 newLevel) payable",
  "function heroTypes(uint256 heroType) view returns (string memory name, string memory symbol, uint256 basePower)",
  "function isHeroUnlocked(address owner, uint256 heroType) view returns (bool)",
  
  // Evolution functions
  "function evolveHero(uint256 tokenId, bytes memory evolutionData) payable returns (bool)",
  "function getEvolutionCost(uint256 tokenId, uint256 targetLevel) view returns (uint256)",
  
  // Hero-specific events
  "event HeroUpgraded(uint256 indexed tokenId, uint256 oldLevel, uint256 newLevel)",
  "event HeroEvolved(uint256 indexed tokenId, uint256 evolutionStage)"
];

// Demo contract addresses (fallback when environment variables not set)
const DEMO_ADDRESSES = {
  // Ethereum Sepolia testnet
  11155111: {
    HERO_NFT: "0x1234567890123456789012345678901234567890",
    GXCOIN_TOKEN: "0x2345678901234567890123456789012345678901"
  },
  // Ethereum Goerli testnet
  5: {
    HERO_NFT: "0x3456789012345678901234567890123456789012",
    GXCOIN_TOKEN: "0x4567890123456789012345678901234567890123"
  },
  // Polygon Mumbai testnet
  80001: {
    HERO_NFT: "0x5678901234567890123456789012345678901234",
    GXCOIN_TOKEN: "0x6789012345678901234567890123456789012345"
  },
  // BSC Testnet
  97: {
    HERO_NFT: "0x7890123456789012345678901234567890123456",
    GXCOIN_TOKEN: "0x8901234567890123456789012345678901234567"
  }
};

// Production contract addresses from environment variables
const PRODUCTION_ADDRESSES = {
  // Ethereum Sepolia testnet
  11155111: {
    HERO_NFT: import.meta.env.VITE_HERO_NFT_CONTRACT_SEPOLIA,
    GXCOIN_TOKEN: import.meta.env.VITE_GXCOIN_TOKEN_SEPOLIA
  },
  // Ethereum Goerli testnet
  5: {
    HERO_NFT: import.meta.env.VITE_HERO_NFT_CONTRACT_GOERLI,
    GXCOIN_TOKEN: import.meta.env.VITE_GXCOIN_TOKEN_GOERLI
  },
  // Polygon Mumbai testnet
  80001: {
    HERO_NFT: import.meta.env.VITE_HERO_NFT_CONTRACT_MUMBAI,
    GXCOIN_TOKEN: import.meta.env.VITE_GXCOIN_TOKEN_MUMBAI
  },
  // BSC Testnet
  97: {
    HERO_NFT: import.meta.env.VITE_HERO_NFT_CONTRACT_BSC_TESTNET,
    GXCOIN_TOKEN: import.meta.env.VITE_GXCOIN_TOKEN_BSC_TESTNET
  },
  // Ethereum Mainnet
  1: {
    HERO_NFT: import.meta.env.VITE_HERO_NFT_CONTRACT_ETHEREUM,
    GXCOIN_TOKEN: import.meta.env.VITE_GXCOIN_TOKEN_ETHEREUM
  },
  // Polygon Mainnet
  137: {
    HERO_NFT: import.meta.env.VITE_HERO_NFT_CONTRACT_POLYGON,
    GXCOIN_TOKEN: import.meta.env.VITE_GXCOIN_TOKEN_POLYGON
  },
  // BSC Mainnet
  56: {
    HERO_NFT: import.meta.env.VITE_HERO_NFT_CONTRACT_BSC,
    GXCOIN_TOKEN: import.meta.env.VITE_GXCOIN_TOKEN_BSC
  }
};

// Contract addresses - uses production addresses if set, falls back to demo
export const CONTRACT_ADDRESSES = Object.keys(DEMO_ADDRESSES).reduce((acc, chainId) => {
  const id = Number(chainId);
  const prodAddresses = PRODUCTION_ADDRESSES[id as keyof typeof PRODUCTION_ADDRESSES];
  const demoAddresses = DEMO_ADDRESSES[id as keyof typeof DEMO_ADDRESSES];
  
  acc[id] = {
    HERO_NFT: prodAddresses?.HERO_NFT || demoAddresses.HERO_NFT,
    GXCOIN_TOKEN: prodAddresses?.GXCOIN_TOKEN || demoAddresses.GXCOIN_TOKEN
  };
  
  return acc;
}, {} as Record<number, { HERO_NFT: string; GXCOIN_TOKEN: string }>);

// Hero type mappings
export const HERO_TYPES = {
  WTR: 0,    // AQUA Water Guardian
  HEMP: 1,   // HEMP Earth Protector  
  GPWR: 2,   // VOLTRA Energy Champion
  BATT: 3,   // GRAPHENE Tech Innovator
  GCCT: 4    // TRADER Market Strategist
} as const;

export type HeroType = keyof typeof HERO_TYPES;

// Hero metadata structure for NFT
export interface HeroNFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  hero_type: HeroType;
  level: number;
  power: number;
  rarity: string;
  collection: string;
}

// Contract interaction utilities
export class HeroNFTContract {
  private contract: ethers.Contract;
  private provider: ethers.BrowserProvider;
  
  constructor(provider: ethers.BrowserProvider, chainId: number) {
    this.provider = provider;
    const contractAddress = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]?.HERO_NFT;
    
    if (!contractAddress) {
      throw new Error(`Hero NFT contract not deployed on network ${chainId}`);
    }
    
    this.contract = new ethers.Contract(contractAddress, HERO_NFT_ABI, provider);
  }
  
  // Get contract with signer for write operations
  private async getContractWithSigner() {
    const signer = await this.provider.getSigner();
    return this.contract.connect(signer);
  }
  
  // Read functions
  async getName(): Promise<string> {
    return await this.contract.name();
  }
  
  async getSymbol(): Promise<string> {
    return await this.contract.symbol();
  }
  
  async getTotalSupply(): Promise<number> {
    const supply = await this.contract.totalSupply();
    return Number(supply);
  }
  
  async getTokenURI(tokenId: number): Promise<string> {
    return await this.contract.tokenURI(tokenId);
  }
  
  async getBalanceOf(address: string): Promise<number> {
    const balance = await this.contract.balanceOf(address);
    return Number(balance);
  }
  
  async getHeroData(tokenId: number): Promise<{
    heroType: number;
    level: number;
    experience: number;
    power: number;
  }> {
    const [heroType, level, experience, power] = await this.contract.getHeroData(tokenId);
    return {
      heroType: Number(heroType),
      level: Number(level),
      experience: Number(experience),
      power: Number(power)
    };
  }
  
  async getMintPrice(): Promise<string> {
    const price = await this.contract.mintPrice();
    return ethers.formatEther(price);
  }
  
  async getHeroMintCost(heroType: number, level: number): Promise<string> {
    const cost = await this.contract.heroMintCost(heroType, level);
    return ethers.formatEther(cost);
  }
  
  async isHeroUnlocked(address: string, heroType: number): Promise<boolean> {
    return await this.contract.isHeroUnlocked(address, heroType);
  }
  
  // Write functions
  async mintHero(
    heroType: HeroType, 
    level: number, 
    metadata: HeroNFTMetadata
  ): Promise<ethers.ContractTransactionResponse> {
    const contractWithSigner = await this.getContractWithSigner() as any;
    const heroTypeId = HERO_TYPES[heroType];
    const cost = await this.getHeroMintCost(heroTypeId, level);
    
    // Encode metadata as bytes
    const encodedMetadata = ethers.toUtf8Bytes(JSON.stringify(metadata));
    
    return await contractWithSigner.mintHero(
      await (await this.provider.getSigner()).getAddress(),
      heroTypeId,
      level,
      encodedMetadata,
      { value: ethers.parseEther(cost) }
    );
  }
  
  async safeMint(uri: string): Promise<ethers.ContractTransactionResponse> {
    const contractWithSigner = await this.getContractWithSigner() as any;
    const mintPrice = await this.getMintPrice();
    
    return await contractWithSigner.safeMint(
      await (await this.provider.getSigner()).getAddress(),
      uri,
      { value: ethers.parseEther(mintPrice) }
    );
  }
  
  async upgradeHero(tokenId: number, newLevel: number): Promise<ethers.ContractTransactionResponse> {
    const contractWithSigner = await this.getContractWithSigner() as any;
    
    return await contractWithSigner.upgradeHero(tokenId, newLevel);
  }
}

// Helper functions for production mode detection
export function isProduction(): boolean {
  const mode = import.meta.env.VITE_NFT_MODE;
  const enableRealMinting = import.meta.env.VITE_ENABLE_REAL_MINTING === 'true';
  return mode === 'production' && enableRealMinting;
}

export function hasProductionContract(chainId: number): boolean {
  const prodAddresses = PRODUCTION_ADDRESSES[chainId as keyof typeof PRODUCTION_ADDRESSES];
  return !!(prodAddresses?.HERO_NFT && prodAddresses?.GXCOIN_TOKEN);
}

export function getContractAddressForChain(chainId: number, contractType: 'HERO_NFT' | 'GXCOIN_TOKEN'): string | undefined {
  return CONTRACT_ADDRESSES[chainId]?.[contractType];
}

// Utility functions
export function getHeroTypeFromSymbol(symbol: string): HeroType | null {
  const symbolMap: Record<string, HeroType> = {
    'WTR': 'WTR',
    'HEMP': 'HEMP', 
    'GPWR': 'GPWR',
    'BATT': 'BATT',
    'GCCT': 'GCCT'
  };
  
  return symbolMap[symbol.toUpperCase()] || null;
}

export function generateHeroMetadata(
  heroId: string,
  level: number,
  heroData: any
): HeroNFTMetadata {
  const heroType = getHeroTypeFromSymbol(heroData.symbol);
  if (!heroType) {
    throw new Error(`Invalid hero symbol: ${heroData.symbol}`);
  }
  
  const rarity = level <= 2 ? 'Common' : level <= 4 ? 'Rare' : level <= 6 ? 'Epic' : 'Legendary';
  
  return {
    name: `${heroData.name} Level ${level}`,
    description: heroData.description,
    image: `https://gxcoin.io/nft/heroes/${heroId}_${level}.png`, // Placeholder URL
    attributes: [
      { trait_type: "Level", value: level },
      { trait_type: "Rarity", value: rarity },
      { trait_type: "Power", value: heroData.stats?.power || level * 10 },
      { trait_type: "Health", value: heroData.stats?.health || level * 8 },
      { trait_type: "Speed", value: heroData.stats?.speed || level * 6 },
      { trait_type: "Element", value: heroData.element || "Universal" },
      { trait_type: "Hero Type", value: heroType }
    ],
    hero_type: heroType,
    level,
    power: heroData.stats?.power || level * 10,
    rarity,
    collection: "GXCOIN ReFi Heroes"
  };
}