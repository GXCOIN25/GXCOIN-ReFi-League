import { ethers } from 'ethers';

/**
 * Gas Relayer - Platform wallet that sponsors blockchain transactions for users
 * This wallet pays gas fees so users can mint NFTs via Stripe without needing crypto
 */

export class GasRelayer {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet | null = null;
  private networkName: string;

  constructor(rpcUrl: string, networkName: string = 'polygon') {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.networkName = networkName;
  }

  /**
   * Initialize the relayer wallet with private key
   */
  async initialize(privateKey: string) {
    try {
      this.wallet = new ethers.Wallet(privateKey, this.provider);
      const balance = await this.provider.getBalance(this.wallet.address);
      
      console.log('🔐 Gas Relayer initialized:');
      console.log(`   Address: ${this.wallet.address}`);
      console.log(`   Network: ${this.networkName}`);
      console.log(`   Balance: ${ethers.formatEther(balance)} ${this.networkName === 'polygon' ? 'MATIC' : 'ETH'}`);
      
      if (balance < ethers.parseEther('0.1')) {
        console.warn('⚠️  WARNING: Relayer wallet balance is low. Please add funds to continue sponsoring transactions.');
      }
      
      return true;
    } catch (error: any) {
      console.error('Failed to initialize gas relayer:', error.message);
      return false;
    }
  }

  /**
   * Check if relayer is ready to sponsor transactions
   */
  isReady(): boolean {
    return this.wallet !== null;
  }

  /**
   * Get relayer wallet address
   */
  getAddress(): string | null {
    return this.wallet?.address || null;
  }

  /**
   * Get current gas price from network
   */
  async getCurrentGasPrice(): Promise<bigint> {
    const feeData = await this.provider.getFeeData();
    return feeData.gasPrice || BigInt(0);
  }

  /**
   * Estimate gas fee for a transaction in USD
   */
  async estimateGasFeeUSD(estimatedGasUnits: bigint = BigInt(250000)): Promise<number> {
    try {
      const gasPrice = await this.getCurrentGasPrice();
      const gasCostWei = gasPrice * estimatedGasUnits;
      const gasCostMatic = parseFloat(ethers.formatEther(gasCostWei));
      
      // Approximate MATIC/ETH to USD conversion (update with real price feed in production)
      const maticPriceUSD = this.networkName === 'polygon' ? 0.80 : 2500; // Example prices
      const gasFeeUSD = gasCostMatic * maticPriceUSD;
      
      console.log(`⛽ Gas estimate: ${gasCostMatic.toFixed(6)} ${this.networkName === 'polygon' ? 'MATIC' : 'ETH'} (~$${gasFeeUSD.toFixed(2)} USD)`);
      
      return gasFeeUSD;
    } catch (error) {
      console.error('Error estimating gas fee:', error);
      return 2.50; // Fallback estimate
    }
  }

  /**
   * Mint NFT for user (platform pays gas)
   */
  async mintNFTForUser(
    contractAddress: string,
    contractABI: any[],
    recipientAddress: string,
    tokenURI: string
  ): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
    if (!this.wallet) {
      return { success: false, error: 'Relayer not initialized' };
    }

    try {
      console.log(`🎨 Minting NFT for ${recipientAddress}...`);
      console.log(`📜 Contract: ${contractAddress}`);
      
      const contract = new ethers.Contract(contractAddress, contractABI, this.wallet);
      
      // Call the mint function (adjust based on your contract's interface)
      const tx = await contract.safeMint(recipientAddress, tokenURI);
      
      console.log(`⏳ Transaction submitted: ${tx.hash}`);
      console.log(`💰 Gas paid by platform relayer: ${this.wallet.address}`);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      console.log(`✅ NFT minted successfully!`);
      console.log(`   Block: ${receipt.blockNumber}`);
      console.log(`   Gas used: ${receipt.gasUsed.toString()}`);
      
      return {
        success: true,
        transactionHash: tx.hash
      };
    } catch (error: any) {
      console.error('❌ Minting failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Mint Battle Pass for user (platform pays gas)
   */
  async mintBattlePass(
    contractAddress: string,
    contractABI: any[],
    recipientAddress: string,
    seasonId: number
  ): Promise<{ success: boolean; transactionHash?: string; tokenId?: number; error?: string }> {
    if (!this.wallet) {
      return { success: false, error: 'Relayer not initialized' };
    }

    try {
      console.log(`🎮 Minting Battle Pass for ${recipientAddress}...`);
      
      const contract = new ethers.Contract(contractAddress, contractABI, this.wallet);
      const tx = await contract.mintPass(recipientAddress, seasonId);
      
      console.log(`⏳ Transaction submitted: ${tx.hash}`);
      console.log(`💰 Gas paid by platform relayer`);
      
      const receipt = await tx.wait();
      
      // Extract tokenId from event logs if needed
      const tokenId = receipt.logs && receipt.logs.length > 0 ? parseInt(receipt.logs[0].topics[3], 16) : undefined;
      
      console.log(`✅ Battle Pass minted successfully!`);
      if (tokenId) console.log(`   Token ID: ${tokenId}`);
      
      return {
        success: true,
        transactionHash: tx.hash,
        tokenId
      };
    } catch (error: any) {
      console.error('❌ Battle Pass minting failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Award cosmetic items to user (platform pays gas)
   */
  async mintCosmetic(
    contractAddress: string,
    contractABI: any[],
    recipientAddress: string,
    itemId: number,
    amount: number
  ): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
    if (!this.wallet) {
      return { success: false, error: 'Relayer not initialized' };
    }

    try {
      console.log(`✨ Minting cosmetic item ${itemId} for ${recipientAddress}...`);
      
      const contract = new ethers.Contract(contractAddress, contractABI, this.wallet);
      const tx = await contract.mintItem(recipientAddress, itemId, amount);
      
      console.log(`⏳ Transaction submitted: ${tx.hash}`);
      console.log(`💰 Gas paid by platform relayer`);
      
      const receipt = await tx.wait();
      
      console.log(`✅ Cosmetic item minted successfully!`);
      
      return {
        success: true,
        transactionHash: tx.hash
      };
    } catch (error: any) {
      console.error('❌ Cosmetic minting failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get relayer balance
   */
  async getBalance(): Promise<string> {
    if (!this.wallet) {
      return '0';
    }
    
    const balance = await this.provider.getBalance(this.wallet.address);
    return ethers.formatEther(balance);
  }

  /**
   * Check if relayer has enough balance to sponsor transactions
   */
  async hasEnoughBalance(minimumBalance: string = '0.1'): Promise<boolean> {
    const balance = await this.getBalance();
    return parseFloat(balance) >= parseFloat(minimumBalance);
  }
}

// Singleton instance
let relayerInstance: GasRelayer | null = null;

/**
 * Get or create the gas relayer instance
 */
export function getGasRelayer(): GasRelayer | null {
  return relayerInstance;
}

/**
 * Initialize the gas relayer with environment configuration
 */
export async function initializeGasRelayer(): Promise<boolean> {
  const rpcUrl = process.env.POLYGON_RPC_URL;
  const privateKey = process.env.RELAYER_PRIVATE_KEY || process.env.PRIVATE_KEY;

  if (!rpcUrl) {
    console.warn('⚠️  POLYGON_RPC_URL not set - gas relayer disabled');
    return false;
  }

  if (!privateKey) {
    console.warn('⚠️  RELAYER_PRIVATE_KEY not set - gas relayer disabled');
    return false;
  }

  try {
    relayerInstance = new GasRelayer(rpcUrl, 'polygon');
    const initialized = await relayerInstance.initialize(privateKey);
    
    if (initialized) {
      console.log('✅ Gas Relayer ready to sponsor user transactions');
      return true;
    }
    
    return false;
  } catch (error: any) {
    console.error('Failed to initialize gas relayer:', error.message);
    return false;
  }
}
