// NFT Configuration for GXCOIN ReFi Heroes
// Controls demo vs production mode and network settings

export type NFTMode = 'demo' | 'production';
export type SupportedNetwork = 'sepolia' | 'goerli' | 'mumbai' | 'bsc-testnet' | 'ethereum' | 'polygon' | 'bsc';

export interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  blockExplorer: string;
  isTestnet: boolean;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export interface ContractAddresses {
  HERO_NFT?: string;
  GXCOIN_TOKEN?: string;
  WTR_TOKEN?: string;
  HEMP_TOKEN?: string;
  GPWR_TOKEN?: string;
  BATT_TOKEN?: string;
  GCCT_TOKEN?: string;
}

export interface NFTConfig {
  mode: NFTMode;
  enableRealMinting: boolean;
  defaultNetwork: SupportedNetwork;
  networks: Record<SupportedNetwork, NetworkConfig>;
  contractAddresses: Record<SupportedNetwork, ContractAddresses>;
}

// Network configurations
const NETWORKS: Record<SupportedNetwork, NetworkConfig> = {
  sepolia: {
    chainId: 11155111,
    name: 'Sepolia Testnet',
    rpcUrl: 'https://sepolia.infura.io/v3/',
    blockExplorer: 'https://sepolia.etherscan.io',
    isTestnet: true,
    nativeCurrency: {
      name: 'Sepolia ETH',
      symbol: 'SEP',
      decimals: 18
    }
  },
  goerli: {
    chainId: 5,
    name: 'Goerli Testnet',
    rpcUrl: 'https://goerli.infura.io/v3/',
    blockExplorer: 'https://goerli.etherscan.io',
    isTestnet: true,
    nativeCurrency: {
      name: 'Goerli ETH',
      symbol: 'GOR',
      decimals: 18
    }
  },
  mumbai: {
    chainId: 80001,
    name: 'Polygon Mumbai',
    rpcUrl: 'https://rpc-mumbai.maticvigil.com',
    blockExplorer: 'https://mumbai.polygonscan.com',
    isTestnet: true,
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    }
  },
  'bsc-testnet': {
    chainId: 97,
    name: 'BSC Testnet',
    rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
    blockExplorer: 'https://testnet.bscscan.com',
    isTestnet: true,
    nativeCurrency: {
      name: 'BNB',
      symbol: 'tBNB',
      decimals: 18
    }
  },
  ethereum: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://mainnet.infura.io/v3/',
    blockExplorer: 'https://etherscan.io',
    isTestnet: false,
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    }
  },
  polygon: {
    chainId: 137,
    name: 'Polygon Mainnet',
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorer: 'https://polygonscan.com',
    isTestnet: false,
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    }
  },
  bsc: {
    chainId: 56,
    name: 'BNB Smart Chain',
    rpcUrl: 'https://bsc-dataseed.binance.org',
    blockExplorer: 'https://bscscan.com',
    isTestnet: false,
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18
    }
  }
};

// Contract addresses - Production addresses (to be filled when deployed)
const PRODUCTION_CONTRACTS: Record<SupportedNetwork, ContractAddresses> = {
  sepolia: {
    HERO_NFT: import.meta.env.VITE_HERO_NFT_CONTRACT_SEPOLIA || undefined,
    GXCOIN_TOKEN: import.meta.env.VITE_GXCOIN_TOKEN_SEPOLIA || undefined,
  },
  goerli: {
    HERO_NFT: import.meta.env.VITE_HERO_NFT_CONTRACT_GOERLI || undefined,
    GXCOIN_TOKEN: import.meta.env.VITE_GXCOIN_TOKEN_GOERLI || undefined,
  },
  mumbai: {
    HERO_NFT: import.meta.env.VITE_HERO_NFT_CONTRACT_MUMBAI || undefined,
    GXCOIN_TOKEN: import.meta.env.VITE_GXCOIN_TOKEN_MUMBAI || undefined,
  },
  'bsc-testnet': {
    HERO_NFT: import.meta.env.VITE_HERO_NFT_CONTRACT_BSC_TESTNET || undefined,
    GXCOIN_TOKEN: import.meta.env.VITE_GXCOIN_TOKEN_BSC_TESTNET || undefined,
  },
  ethereum: {
    HERO_NFT: import.meta.env.VITE_HERO_NFT_CONTRACT_ETHEREUM || undefined,
    GXCOIN_TOKEN: import.meta.env.VITE_GXCOIN_TOKEN_ETHEREUM || undefined,
  },
  polygon: {
    HERO_NFT: import.meta.env.VITE_HERO_NFT_CONTRACT_POLYGON || undefined,
    GXCOIN_TOKEN: import.meta.env.VITE_GXCOIN_TOKEN_POLYGON || undefined,
  },
  bsc: {
    HERO_NFT: import.meta.env.VITE_HERO_NFT_CONTRACT_BSC || undefined,
    GXCOIN_TOKEN: import.meta.env.VITE_GXCOIN_TOKEN_BSC || undefined,
  }
};

// Demo contract addresses (placeholder addresses for testing)
const DEMO_CONTRACTS: Record<SupportedNetwork, ContractAddresses> = {
  sepolia: {
    HERO_NFT: "0x1234567890123456789012345678901234567890",
    GXCOIN_TOKEN: "0x2345678901234567890123456789012345678901",
    WTR_TOKEN: "0x3456789012345678901234567890123456789012",
    HEMP_TOKEN: "0x4567890123456789012345678901234567890123",
    GPWR_TOKEN: "0x5678901234567890123456789012345678901234",
    BATT_TOKEN: "0x6789012345678901234567890123456789012345",
    GCCT_TOKEN: "0x7890123456789012345678901234567890123456"
  },
  goerli: {
    HERO_NFT: "0x3456789012345678901234567890123456789012",
    GXCOIN_TOKEN: "0x4567890123456789012345678901234567890123",
  },
  mumbai: {
    HERO_NFT: "0x5678901234567890123456789012345678901234",
    GXCOIN_TOKEN: "0x6789012345678901234567890123456789012345",
  },
  'bsc-testnet': {
    HERO_NFT: "0x7890123456789012345678901234567890123456",
    GXCOIN_TOKEN: "0x8901234567890123456789012345678901234567",
  },
  ethereum: {},
  polygon: {},
  bsc: {}
};

// Main NFT Configuration
const currentMode = (import.meta.env.VITE_NFT_MODE as NFTMode) || 'demo';

export const nftConfig: NFTConfig = {
  mode: currentMode,
  enableRealMinting: import.meta.env.VITE_ENABLE_REAL_MINTING === 'true',
  defaultNetwork: 'sepolia',
  networks: NETWORKS,
  contractAddresses: currentMode === 'production' ? PRODUCTION_CONTRACTS : DEMO_CONTRACTS
};

// Utility functions
export function isProductionMode(): boolean {
  return nftConfig.mode === 'production' && nftConfig.enableRealMinting;
}

export function isDemoMode(): boolean {
  return nftConfig.mode === 'demo' || !nftConfig.enableRealMinting;
}

export function getNetworkConfig(chainId: number): NetworkConfig | undefined {
  return Object.values(NETWORKS).find(network => network.chainId === chainId);
}

export function getContractAddress(
  network: SupportedNetwork,
  contractType: keyof ContractAddresses
): string | undefined {
  const addresses = isProductionMode() ? PRODUCTION_CONTRACTS : DEMO_CONTRACTS;
  return addresses[network]?.[contractType];
}

export function isTestnetNetwork(chainId: number): boolean {
  const network = getNetworkConfig(chainId);
  return network?.isTestnet ?? false;
}

export function canMintOnNetwork(chainId: number): boolean {
  if (isDemoMode()) {
    return isTestnetNetwork(chainId);
  }
  return true;
}

export function getModeDescription(): string {
  if (isDemoMode()) {
    return 'Demo Mode - NFT badges stored in database, not on blockchain';
  }
  return 'Production Mode - Real NFTs minted on blockchain';
}

export function getFeatureComparison() {
  return {
    demo: {
      cost: 'Free (no real ETH required)',
      speed: 'Instant',
      storage: 'Database',
      ownership: 'Platform-based',
      transferable: 'No',
      permanent: 'No (can be reset)',
      benefits: ['Quick testing', 'No wallet required', 'Free to use', 'Instant minting']
    },
    production: {
      cost: 'Costs ETH/MATIC/BNB',
      speed: '1-5 minutes',
      storage: 'Blockchain',
      ownership: 'True ownership (wallet)',
      transferable: 'Yes',
      permanent: 'Yes (immutable)',
      benefits: ['Real ownership', 'Tradeable on OpenSea', 'Permanent record', 'True NFT']
    }
  };
}

export default nftConfig;
