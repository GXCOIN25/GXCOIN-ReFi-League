// Thirdweb Configuration for GXCOIN NFT Integration
// NOTE: Thirdweb SDK requires ethers v5, but this project uses ethers v6
// This file is a REFERENCE TEMPLATE showing how to configure Thirdweb
// To use Thirdweb, you would need to either:
// 1. Downgrade to ethers v5 (may break existing code)
// 2. Wait for Thirdweb to support ethers v6
// 3. Use a separate micro-service with ethers v5 for Thirdweb operations

import { Chain } from '@thirdweb-dev/chains';

// NOTE: Uncomment these imports when Thirdweb packages are installed
// import { ThirdwebSDK } from '@thirdweb-dev/sdk';
// import { Sepolia, Mumbai, BscTestnet, Ethereum, Polygon, BNBChain } from '@thirdweb-dev/chains';

export interface ThirdwebConfig {
  clientId: string;
  supportedChains: Chain[];
  activeChain: Chain;
  contractAddresses: Record<string, string>;
}

// Supported blockchain networks for Thirdweb
export const THIRDWEB_CHAINS = {
  // Testnets
  sepolia: {
    chainId: 11155111,
    name: 'Sepolia',
    rpc: ['https://rpc.sepolia.org'],
  },
  mumbai: {
    chainId: 80001,
    name: 'Mumbai',
    rpc: ['https://rpc-mumbai.maticvigil.com'],
  },
  bscTestnet: {
    chainId: 97,
    name: 'BSC Testnet',
    rpc: ['https://data-seed-prebsc-1-s1.binance.org:8545'],
  },
  // Mainnets
  ethereum: {
    chainId: 1,
    name: 'Ethereum',
    rpc: ['https://eth.llamarpc.com'],
  },
  polygon: {
    chainId: 137,
    name: 'Polygon',
    rpc: ['https://polygon-rpc.com'],
  },
  bsc: {
    chainId: 56,
    name: 'BNB Chain',
    rpc: ['https://bsc-dataseed.binance.org'],
  },
};

// Thirdweb Client Configuration
export const thirdwebConfig: ThirdwebConfig = {
  // Get your client ID from https://thirdweb.com/dashboard
  clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID || '',
  
  // Supported chains for the application
  supportedChains: [
    // NOTE: These would be actual Thirdweb chain objects
    // Sepolia, Mumbai, BscTestnet, Ethereum, Polygon, BNBChain
  ],
  
  // Default active chain (Sepolia testnet for development)
  activeChain: THIRDWEB_CHAINS.sepolia as any,
  
  // Contract addresses per network
  contractAddresses: {
    // Sepolia testnet
    [THIRDWEB_CHAINS.sepolia.chainId]: import.meta.env.VITE_HERO_NFT_CONTRACT_SEPOLIA || '',
    // Mumbai testnet
    [THIRDWEB_CHAINS.mumbai.chainId]: import.meta.env.VITE_HERO_NFT_CONTRACT_MUMBAI || '',
    // BSC testnet
    [THIRDWEB_CHAINS.bscTestnet.chainId]: import.meta.env.VITE_HERO_NFT_CONTRACT_BSC_TESTNET || '',
    // Ethereum mainnet
    [THIRDWEB_CHAINS.ethereum.chainId]: import.meta.env.VITE_HERO_NFT_CONTRACT_ETHEREUM || '',
    // Polygon mainnet
    [THIRDWEB_CHAINS.polygon.chainId]: import.meta.env.VITE_HERO_NFT_CONTRACT_POLYGON || '',
    // BSC mainnet
    [THIRDWEB_CHAINS.bsc.chainId]: import.meta.env.VITE_HERO_NFT_CONTRACT_BSC || '',
  }
};

// Helper function to get contract address for current chain
export function getContractAddress(chainId: number): string | undefined {
  return thirdwebConfig.contractAddresses[chainId];
}

// Helper function to check if Thirdweb is properly configured
export function isThirdwebConfigured(): boolean {
  return !!thirdwebConfig.clientId && thirdwebConfig.clientId.length > 0;
}

// Helper to get chain configuration
export function getChainConfig(chainId: number) {
  const chain = Object.values(THIRDWEB_CHAINS).find(c => c.chainId === chainId);
  return chain;
}

export default thirdwebConfig;
