import { create } from 'zustand';
import { ethers } from 'ethers';
import { HeroNFTContract, HERO_TYPES, HeroType, generateHeroMetadata } from '../../contracts/ERC721';
import { TokenManager, ERC20Contract, TokenSymbol, getTokenInfo } from '../../contracts/ERC20';

interface TransactionStatus {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  type: 'eth' | 'token' | 'nft';
  description: string;
  timestamp: number;
  blockNumber?: number;
  gasUsed?: string;
}

interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  tokenBalances: Record<string, string>;
  provider: ethers.BrowserProvider | null;
  chainId: number | null;
  isConnecting: boolean;
  error: string | null;
  transactions: TransactionStatus[];
  
  // Contract instances
  heroNFTContract: HeroNFTContract | null;
  tokenManager: TokenManager | null;
  
  // Actions
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  getBalance: () => Promise<void>;
  getTokenBalances: () => Promise<void>;
  sendTransaction: (to: string, amount: string) => Promise<string>;
  sendTokenTransaction: (tokenSymbol: TokenSymbol, to: string, amount: string) => Promise<string>;
  mintHeroNFT: (heroType: HeroType, level: number, heroData: any) => Promise<string>;
  getTransactionStatus: (hash: string) => Promise<TransactionStatus>;
  addTransaction: (tx: Omit<TransactionStatus, 'timestamp'>) => void;
  setError: (error: string | null) => void;
  switchNetwork: (chainId: number) => Promise<void>;
  switchToTestnet: () => Promise<void>;
  isTestnet: () => boolean;
}

export const useWallet = create<WalletState>((set, get) => ({
  isConnected: false,
  address: null,
  balance: null,
  tokenBalances: {},
  provider: null,
  chainId: null,
  isConnecting: false,
  error: null,
  transactions: [],
  heroNFTContract: null,
  tokenManager: null,

  connectWallet: async () => {
    console.log('Attempting to connect wallet...');
    
    if (!window.ethereum) {
      const errorMsg = 'Please install MetaMask or another Web3 wallet';
      console.error('No ethereum provider found:', errorMsg);
      set({ error: errorMsg });
      return;
    }

    console.log('Ethereum provider found:', window.ethereum);
    set({ isConnecting: true, error: null });

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      console.log('Provider created:', provider);
      
      await provider.send('eth_requestAccounts', []);
      console.log('Accounts requested');
      
      const signer = await provider.getSigner();
      console.log('Signer obtained:', signer);
      
      const address = await signer.getAddress();
      console.log('Address obtained:', address);
      
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      console.log('Network:', { chainId, name: network.name });
      
      // Initialize contract instances
      let heroNFTContract = null;
      let tokenManager = null;
      
      try {
        heroNFTContract = new HeroNFTContract(provider, chainId);
        tokenManager = new TokenManager(provider, chainId);
        await tokenManager.initializeTokens();
        console.log('Contract instances initialized');
      } catch (error) {
        console.warn('Failed to initialize contracts (testnet may not have deployments):', error);
      }
      
      set({
        isConnected: true,
        address,
        provider,
        chainId,
        heroNFTContract,
        tokenManager,
        isConnecting: false
      });
      
      console.log('Wallet connected successfully');
      // Get initial balances
      await get().getBalance();
      await get().getTokenBalances();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to connect wallet';
      console.error('Wallet connection error:', error);
      set({
        error: errorMsg,
        isConnecting: false
      });
    }
  },

  disconnectWallet: () => {
    set({
      isConnected: false,
      address: null,
      balance: null,
      tokenBalances: {},
      provider: null,
      chainId: null,
      heroNFTContract: null,
      tokenManager: null,
      transactions: [],
      error: null
    });
  },

  getBalance: async () => {
    const { provider, address } = get();
    if (!provider || !address) return;

    try {
      const balance = await provider.getBalance(address);
      const formattedBalance = ethers.formatEther(balance);
      set({ balance: parseFloat(formattedBalance).toFixed(4) });
    } catch (error) {
      console.error('Failed to get balance:', error);
    }
  },

  sendTransaction: async (to: string, amount: string): Promise<string> => {
    const { provider } = get();
    if (!provider) throw new Error('Wallet not connected');

    const signer = await provider.getSigner();
    const tx = await signer.sendTransaction({
      to,
      value: ethers.parseEther(amount)
    });

    // Add transaction to history
    get().addTransaction({
      hash: tx.hash,
      status: 'pending',
      type: 'eth',
      description: `Send ${amount} ETH to ${to.slice(0, 6)}...${to.slice(-4)}`
    });

    return tx.hash;
  },

  getTokenBalances: async () => {
    const { tokenManager, address } = get();
    if (!tokenManager || !address) return;

    try {
      const balances = await tokenManager.getAllBalances(address);
      set({ tokenBalances: balances });
    } catch (error) {
      console.error('Failed to get token balances:', error);
    }
  },

  sendTokenTransaction: async (tokenSymbol: TokenSymbol, to: string, amount: string): Promise<string> => {
    const { tokenManager } = get();
    if (!tokenManager) throw new Error('Token manager not initialized');

    const tokenContract = tokenManager.getToken(tokenSymbol);
    if (!tokenContract) throw new Error(`${tokenSymbol} token not available`);

    const tx = await tokenContract.transfer(to, amount);

    // Add transaction to history
    get().addTransaction({
      hash: tx.hash,
      status: 'pending',
      type: 'token',
      description: `Send ${amount} ${tokenSymbol} to ${to.slice(0, 6)}...${to.slice(-4)}`
    });

    return tx.hash;
  },

  mintHeroNFT: async (heroType: HeroType, level: number, heroData: any): Promise<string> => {
    const { heroNFTContract, chainId } = get();
    
    if (!heroNFTContract) {
      throw new Error('Hero NFT contract not initialized');
    }
    
    // Ensure testnet only
    const allowedTestnets = [11155111, 5, 80001, 97]; // Sepolia, Goerli, Mumbai, BSC Testnet
    if (chainId && !allowedTestnets.includes(chainId)) {
      throw new Error(`MAINNET BLOCKED: Please switch to a testnet. Current network: ${chainId}`);
    }

    const metadata = generateHeroMetadata(`${heroType.toLowerCase()}_${heroData.symbol?.toLowerCase()}`, level, heroData);
    const tx = await heroNFTContract.mintHero(heroType, level, metadata);

    // Add transaction to history
    get().addTransaction({
      hash: tx.hash,
      status: 'pending',
      type: 'nft',
      description: `Mint ${heroType} Level ${level} NFT`
    });

    return tx.hash;
  },

  getTransactionStatus: async (hash: string): Promise<TransactionStatus> => {
    const { provider, transactions } = get();
    if (!provider) throw new Error('Provider not available');

    const existingTx = transactions.find(tx => tx.hash === hash);
    if (!existingTx) throw new Error('Transaction not found');

    try {
      const receipt = await provider.getTransactionReceipt(hash);
      
      const updatedTx: TransactionStatus = {
        ...existingTx,
        status: receipt ? 'confirmed' : 'pending',
        blockNumber: receipt?.blockNumber,
        gasUsed: receipt?.gasUsed?.toString(),
        timestamp: existingTx.timestamp
      };

      // Update transaction in store
      const updatedTransactions = transactions.map(tx => 
        tx.hash === hash ? updatedTx : tx
      );
      set({ transactions: updatedTransactions });

      return updatedTx;
    } catch (error) {
      const failedTx: TransactionStatus = {
        ...existingTx,
        status: 'failed',
        timestamp: existingTx.timestamp
      };

      // Update transaction in store
      const updatedTransactions = transactions.map(tx => 
        tx.hash === hash ? failedTx : tx
      );
      set({ transactions: updatedTransactions });

      return failedTx;
    }
  },

  addTransaction: (tx: Omit<TransactionStatus, 'timestamp'>) => {
    const newTransaction: TransactionStatus = {
      ...tx,
      timestamp: Date.now()
    };
    
    set(state => ({
      transactions: [newTransaction, ...state.transactions.slice(0, 49)] // Keep last 50 transactions
    }));
  },

  switchNetwork: async (chainId: number): Promise<void> => {
    if (!window.ethereum) throw new Error('Ethereum provider not available');
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }]
      });
      
      // Reconnect after network switch
      await get().connectWallet();
    } catch (error: any) {
      if (error.code === 4902) {
        // Network not added to wallet, could add it here
        throw new Error(`Network ${chainId} not added to wallet`);
      }
      throw error;
    }
  },

  switchToTestnet: async (): Promise<void> => {
    if (!window.ethereum) {
      throw new Error('MetaMask not found');
    }
    
    // Try to switch to Sepolia first (most common testnet)
    try {
      await get().switchNetwork(11155111); // Sepolia
    } catch (error: any) {
      if (error.code === 4902) {
        // Network not added, try to add Sepolia
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0xaa36a7', // 11155111 in hex
              chainName: 'Sepolia Test Network',
              nativeCurrency: {
                name: 'SepoliaETH',
                symbol: 'SEP',
                decimals: 18,
              },
              rpcUrls: ['https://sepolia.infura.io/v3/'],
              blockExplorerUrls: ['https://sepolia.etherscan.io'],
            }],
          });
        } catch (addError) {
          throw new Error('Failed to add Sepolia network');
        }
      } else {
        throw error;
      }
    }
  },

  isTestnet: (): boolean => {
    const { chainId } = get();
    const testnets = [11155111, 5, 80001, 97]; // Sepolia, Goerli, Mumbai, BSC Testnet
    return chainId ? testnets.includes(chainId) : false;
  },

  setError: (error: string | null) => {
    set({ error });
  }
}));

