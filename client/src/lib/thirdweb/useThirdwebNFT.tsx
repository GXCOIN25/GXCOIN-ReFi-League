// Thirdweb NFT Hook for GXCOIN Hero NFTs
// NOTE: This is a REFERENCE TEMPLATE - Thirdweb SDK requires ethers v5
// This project uses ethers v6, which is incompatible with current Thirdweb version
// 
// INSTALLATION REQUIREMENTS (when compatible):
// npm install @thirdweb-dev/react @thirdweb-dev/sdk ethers@^5
//
// HOW TO SWITCH FROM ETHERS.JS TO THIRDWEB:
// 1. Install Thirdweb packages (resolve ethers version conflict first)
// 2. Wrap your app with ThirdwebProvider in main.tsx
// 3. Replace useWallet calls with useThirdwebNFT
// 4. Update mint functions to use Thirdweb's simplified API

import { useState } from 'react';

// NOTE: Uncomment these imports when packages are installed
// import { useSDK, useContract, useNFTs, useOwnedNFTs } from '@thirdweb-dev/react';
// import { NFT, NFTMetadata } from '@thirdweb-dev/sdk';
import { thirdwebConfig, getContractAddress } from './thirdwebConfig';

export interface ThirdwebNFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

export interface UseThirdwebNFTResult {
  mintNFT: (metadata: ThirdwebNFTMetadata, to?: string) => Promise<string>;
  getNFTs: () => Promise<any[]>;
  getOwnedNFTs: (address: string) => Promise<any[]>;
  transferNFT: (tokenId: string, to: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Thirdweb NFT Hook - Simplified NFT operations using Thirdweb SDK
 * 
 * ADVANTAGES OVER ETHERS.JS:
 * - Simplified API (no need to write ABIs or contract methods)
 * - Built-in wallet connection and network switching
 * - Automatic gas estimation and optimization
 * - IPFS metadata upload handled automatically
 * - Better error handling and transaction tracking
 * 
 * EXAMPLE USAGE:
 * ```tsx
 * function MyComponent() {
 *   const { mintNFT, getNFTs, isLoading } = useThirdwebNFT();
 * 
 *   const handleMint = async () => {
 *     const metadata = {
 *       name: "AQUA Hero Level 1",
 *       description: "Water Guardian NFT",
 *       image: "ipfs://...",
 *       attributes: [
 *         { trait_type: "Level", value: 1 },
 *         { trait_type: "Hero Type", value: "WTR" }
 *       ]
 *     };
 *     
 *     const tokenId = await mintNFT(metadata);
 *     console.log("Minted NFT:", tokenId);
 *   };
 * 
 *   return <button onClick={handleMint}>Mint Hero</button>;
 * }
 * ```
 */
export function useThirdwebNFT(chainId?: number): UseThirdwebNFTResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // NOTE: Uncomment when Thirdweb packages are installed
  // const sdk = useSDK();
  // const contractAddress = getContractAddress(chainId || 11155111);
  // const { contract } = useContract(contractAddress, 'nft-collection');
  // const { data: nfts } = useNFTs(contract);
  // const { data: ownedNFTs } = useOwnedNFTs(contract, address);

  /**
   * Mint a new NFT with Thirdweb
   * Automatically uploads metadata to IPFS and mints the NFT
   */
  const mintNFT = async (
    metadata: ThirdwebNFTMetadata,
    to?: string
  ): Promise<string> => {
    setIsLoading(true);
    setError(null);

    try {
      // NOTE: This is how you would mint with Thirdweb
      // const tx = await contract?.mintTo(to || sdk?.getSigner()?.getAddress(), metadata);
      // const receipt = await tx.receipt;
      // const tokenId = receipt.events[0].args.tokenId.toString();
      // return tokenId;

      // Placeholder return for template
      throw new Error('Thirdweb SDK not installed - see comments for setup');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Minting failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get all NFTs from the collection
   */
  const getNFTs = async (): Promise<any[]> => {
    setIsLoading(true);
    setError(null);

    try {
      // NOTE: With Thirdweb, this is simple:
      // const allNFTs = await contract?.getAll();
      // return allNFTs || [];

      throw new Error('Thirdweb SDK not installed - see comments for setup');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch NFTs';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get NFTs owned by a specific address
   */
  const getOwnedNFTs = async (address: string): Promise<any[]> => {
    setIsLoading(true);
    setError(null);

    try {
      // NOTE: With Thirdweb, this is simple:
      // const owned = await contract?.getOwned(address);
      // return owned || [];

      throw new Error('Thirdweb SDK not installed - see comments for setup');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch owned NFTs';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Transfer an NFT to another address
   */
  const transferNFT = async (tokenId: string, to: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // NOTE: With Thirdweb, this is simple:
      // await contract?.transfer(to, tokenId);

      throw new Error('Thirdweb SDK not installed - see comments for setup');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Transfer failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    mintNFT,
    getNFTs,
    getOwnedNFTs,
    transferNFT,
    isLoading,
    error
  };
}

/**
 * MIGRATION GUIDE: Switching from ethers.js to Thirdweb
 * 
 * 1. SETUP (in main.tsx):
 * ```tsx
 * import { ThirdwebProvider } from '@thirdweb-dev/react';
 * 
 * <ThirdwebProvider
 *   activeChain="sepolia"
 *   clientId={import.meta.env.VITE_THIRDWEB_CLIENT_ID}
 * >
 *   <App />
 * </ThirdwebProvider>
 * ```
 * 
 * 2. REPLACE useWallet with Thirdweb hooks:
 * ```tsx
 * // Before (ethers.js):
 * const { mintHeroNFT, heroNFTContract } = useWallet();
 * 
 * // After (Thirdweb):
 * const { mintNFT } = useThirdwebNFT();
 * const { connect, address } = useConnect();
 * ```
 * 
 * 3. UPDATE MINTING LOGIC:
 * ```tsx
 * // Before (ethers.js):
 * const tx = await heroNFTContract.mintHero(heroType, level, metadata);
 * await tx.wait();
 * 
 * // After (Thirdweb):
 * const tokenId = await mintNFT(metadata);
 * // That's it! No ABI, no gas estimation, no receipt waiting
 * ```
 * 
 * 4. BENEFITS:
 * - 80% less code to maintain
 * - Automatic IPFS uploads for metadata
 * - Built-in error handling
 * - Better TypeScript support
 * - Automatic gas optimization
 * - No need to manage ABIs or contract instances
 */

export default useThirdwebNFT;
