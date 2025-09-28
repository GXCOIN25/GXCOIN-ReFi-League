// ERC-20 Token Contract Interface for GXCOIN and Hero Tokens
import { ethers } from 'ethers';

// Standard ERC-20 ABI
export const ERC20_ABI = [
  // Read functions
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  
  // Write functions
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  
  // Events
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)"
];

// GXCOIN specific token ABI extensions
export const GXCOIN_TOKEN_ABI = [
  ...ERC20_ABI,
  // GXCOIN specific functions
  "function mint(address to, uint256 amount) returns (bool)",
  "function burn(uint256 amount) returns (bool)",
  "function pause() returns (bool)",
  "function unpause() returns (bool)",
  "function paused() view returns (bool)",
  
  // Rewards and staking
  "function stake(uint256 amount) returns (bool)",
  "function unstake(uint256 amount) returns (bool)",
  "function getRewards() returns (uint256)",
  "function stakedBalanceOf(address account) view returns (uint256)",
  "function pendingRewards(address account) view returns (uint256)"
];

// Hero token contract addresses for different networks
export const TOKEN_ADDRESSES = {
  // Ethereum Sepolia testnet
  11155111: {
    GXCOIN: "0x2345678901234567890123456789012345678901",
    WTR: "0x3456789012345678901234567890123456789012",
    HEMP: "0x4567890123456789012345678901234567890123", 
    GPWR: "0x5678901234567890123456789012345678901234",
    BATT: "0x6789012345678901234567890123456789012345",
    GCCT: "0x7890123456789012345678901234567890123456"
  },
  // Ethereum Goerli testnet  
  5: {
    GXCOIN: "0x8901234567890123456789012345678901234567",
    WTR: "0x9012345678901234567890123456789012345678",
    HEMP: "0xa123456789012345678901234567890123456789",
    GPWR: "0xb234567890123456789012345678901234567890", 
    BATT: "0xc345678901234567890123456789012345678901",
    GCCT: "0xd456789012345678901234567890123456789012"
  },
  // Polygon Mumbai testnet
  80001: {
    GXCOIN: "0xe567890123456789012345678901234567890123",
    WTR: "0xf678901234567890123456789012345678901234",
    HEMP: "0x1789012345678901234567890123456789012345",
    GPWR: "0x2890123456789012345678901234567890123456",
    BATT: "0x3901234567890123456789012345678901234567", 
    GCCT: "0x4012345678901234567890123456789012345678"
  },
  // BSC Testnet
  97: {
    GXCOIN: "0x5123456789012345678901234567890123456789",
    WTR: "0x6234567890123456789012345678901234567890",
    HEMP: "0x7345678901234567890123456789012345678901",
    GPWR: "0x8456789012345678901234567890123456789012",
    BATT: "0x9567890123456789012345678901234567890123",
    GCCT: "0xa678901234567890123456789012345678901234"
  }
};

export type TokenSymbol = keyof typeof TOKEN_ADDRESSES[11155111];

// Token metadata interface
export interface TokenInfo {
  symbol: TokenSymbol;
  name: string;
  decimals: number;
  address: string;
  heroAssociation?: string;
  color: string;
  icon: string;
}

// Contract interaction utilities
export class ERC20Contract {
  private contract: ethers.Contract;
  private provider: ethers.BrowserProvider;
  public readonly tokenInfo: TokenInfo;
  
  constructor(
    provider: ethers.BrowserProvider, 
    chainId: number, 
    tokenSymbol: TokenSymbol,
    tokenInfo: TokenInfo
  ) {
    this.provider = provider;
    this.tokenInfo = tokenInfo;
    
    const contractAddress = TOKEN_ADDRESSES[chainId as keyof typeof TOKEN_ADDRESSES]?.[tokenSymbol];
    
    if (!contractAddress) {
      throw new Error(`${tokenSymbol} token not deployed on network ${chainId}`);
    }
    
    this.contract = new ethers.Contract(
      contractAddress, 
      tokenSymbol === 'GXCOIN' ? GXCOIN_TOKEN_ABI : ERC20_ABI, 
      provider
    );
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
  
  async getDecimals(): Promise<number> {
    return Number(await this.contract.decimals());
  }
  
  async getTotalSupply(): Promise<string> {
    const supply = await this.contract.totalSupply();
    return ethers.formatUnits(supply, this.tokenInfo.decimals);
  }
  
  async getBalance(address: string): Promise<string> {
    const balance = await this.contract.balanceOf(address);
    return ethers.formatUnits(balance, this.tokenInfo.decimals);
  }
  
  async getAllowance(owner: string, spender: string): Promise<string> {
    const allowance = await this.contract.allowance(owner, spender);
    return ethers.formatUnits(allowance, this.tokenInfo.decimals);
  }
  
  // GXCOIN specific read functions
  async getStakedBalance(address: string): Promise<string> {
    if (this.tokenInfo.symbol !== 'GXCOIN') {
      throw new Error('Staking only available for GXCOIN');
    }
    
    const stakedBalance = await this.contract.stakedBalanceOf(address);
    return ethers.formatUnits(stakedBalance, this.tokenInfo.decimals);
  }
  
  async getPendingRewards(address: string): Promise<string> {
    if (this.tokenInfo.symbol !== 'GXCOIN') {
      throw new Error('Rewards only available for GXCOIN');
    }
    
    const rewards = await this.contract.pendingRewards(address);
    return ethers.formatUnits(rewards, this.tokenInfo.decimals);
  }
  
  async isPaused(): Promise<boolean> {
    if (this.tokenInfo.symbol !== 'GXCOIN') {
      return false;
    }
    
    return await this.contract.paused();
  }
  
  // Write functions
  async transfer(to: string, amount: string): Promise<ethers.ContractTransactionResponse> {
    const contractWithSigner = await this.getContractWithSigner();
    const parsedAmount = ethers.parseUnits(amount, this.tokenInfo.decimals);
    
    return await contractWithSigner.transfer(to, parsedAmount);
  }
  
  async approve(spender: string, amount: string): Promise<ethers.ContractTransactionResponse> {
    const contractWithSigner = await this.getContractWithSigner();
    const parsedAmount = ethers.parseUnits(amount, this.tokenInfo.decimals);
    
    return await contractWithSigner.approve(spender, parsedAmount);
  }
  
  async transferFrom(from: string, to: string, amount: string): Promise<ethers.ContractTransactionResponse> {
    const contractWithSigner = await this.getContractWithSigner();
    const parsedAmount = ethers.parseUnits(amount, this.tokenInfo.decimals);
    
    return await contractWithSigner.transferFrom(from, to, parsedAmount);
  }
  
  // GXCOIN specific write functions
  async stake(amount: string): Promise<ethers.ContractTransactionResponse> {
    if (this.tokenInfo.symbol !== 'GXCOIN') {
      throw new Error('Staking only available for GXCOIN');
    }
    
    const contractWithSigner = await this.getContractWithSigner();
    const parsedAmount = ethers.parseUnits(amount, this.tokenInfo.decimals);
    
    return await contractWithSigner.stake(parsedAmount);
  }
  
  async unstake(amount: string): Promise<ethers.ContractTransactionResponse> {
    if (this.tokenInfo.symbol !== 'GXCOIN') {
      throw new Error('Unstaking only available for GXCOIN');
    }
    
    const contractWithSigner = await this.getContractWithSigner();
    const parsedAmount = ethers.parseUnits(amount, this.tokenInfo.decimals);
    
    return await contractWithSigner.unstake(parsedAmount);
  }
  
  async claimRewards(): Promise<ethers.ContractTransactionResponse> {
    if (this.tokenInfo.symbol !== 'GXCOIN') {
      throw new Error('Rewards only available for GXCOIN');
    }
    
    const contractWithSigner = await this.getContractWithSigner();
    return await contractWithSigner.getRewards();
  }
}

// Helper function to get token info
export function getTokenInfo(tokenSymbol: TokenSymbol): TokenInfo {
  const tokenInfoMap: Record<TokenSymbol, Omit<TokenInfo, 'address'>> = {
    GXCOIN: {
      symbol: 'GXCOIN',
      name: 'GXCOIN',
      decimals: 18,
      color: '#ffd700',
      icon: '👑',
      heroAssociation: 'Anchor'
    },
    WTR: {
      symbol: 'WTR', 
      name: 'Water Token',
      decimals: 18,
      color: '#1e90ff',
      icon: '💧',
      heroAssociation: 'AQUA'
    },
    HEMP: {
      symbol: 'HEMP',
      name: 'Hemp Token', 
      decimals: 18,
      color: '#228b22',
      icon: '🌿',
      heroAssociation: 'HEMP'
    },
    GPWR: {
      symbol: 'GPWR',
      name: 'Green Power Token',
      decimals: 18,
      color: '#ffff00', 
      icon: '⚡',
      heroAssociation: 'VOLTRA'
    },
    BATT: {
      symbol: 'BATT',
      name: 'Battery Token',
      decimals: 18,
      color: '#8b4513',
      icon: '🔋', 
      heroAssociation: 'GRAPHENE'
    },
    GCCT: {
      symbol: 'GCCT',
      name: 'Green Carbon Credit Token',
      decimals: 18,
      color: '#2d5a27',
      icon: '📈',
      heroAssociation: 'TRADER'
    }
  };
  
  const info = tokenInfoMap[tokenSymbol];
  if (!info) {
    throw new Error(`Unknown token symbol: ${tokenSymbol}`);
  }
  
  return {
    ...info,
    address: '' // Will be set by contract instance
  };
}

// Multi-token manager class
export class TokenManager {
  private providers: Map<TokenSymbol, ERC20Contract> = new Map();
  private provider: ethers.BrowserProvider;
  private chainId: number;
  
  constructor(provider: ethers.BrowserProvider, chainId: number) {
    this.provider = provider;
    this.chainId = chainId;
  }
  
  // Initialize token contracts
  async initializeTokens(tokens: TokenSymbol[] = ['GXCOIN', 'WTR', 'HEMP', 'GPWR', 'BATT', 'GCCT']) {
    for (const tokenSymbol of tokens) {
      try {
        const tokenInfo = getTokenInfo(tokenSymbol);
        const contract = new ERC20Contract(this.provider, this.chainId, tokenSymbol, tokenInfo);
        this.providers.set(tokenSymbol, contract);
      } catch (error) {
        console.warn(`Failed to initialize ${tokenSymbol} token:`, error);
      }
    }
  }
  
  // Get token contract
  getToken(symbol: TokenSymbol): ERC20Contract | null {
    return this.providers.get(symbol) || null;
  }
  
  // Get all initialized tokens
  getAllTokens(): ERC20Contract[] {
    return Array.from(this.providers.values());
  }
  
  // Get balances for all tokens
  async getAllBalances(address: string): Promise<Record<string, string>> {
    const balances: Record<string, string> = {};
    
    for (const [symbol, contract] of this.providers) {
      try {
        balances[symbol] = await contract.getBalance(address);
      } catch (error) {
        console.warn(`Failed to get balance for ${symbol}:`, error);
        balances[symbol] = '0';
      }
    }
    
    return balances;
  }
}