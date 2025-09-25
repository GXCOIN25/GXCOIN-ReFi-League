import { create } from 'zustand';
import { ethers } from 'ethers';

interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  provider: ethers.BrowserProvider | null;
  isConnecting: boolean;
  error: string | null;
  
  // Actions
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  getBalance: () => Promise<void>;
  sendTransaction: (to: string, amount: string) => Promise<string>;
  setError: (error: string | null) => void;
}

export const useWallet = create<WalletState>((set, get) => ({
  isConnected: false,
  address: null,
  balance: null,
  provider: null,
  isConnecting: false,
  error: null,

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
      
      set({
        isConnected: true,
        address,
        provider,
        isConnecting: false
      });
      
      console.log('Wallet connected successfully');
      // Get initial balance
      await get().getBalance();
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
      provider: null,
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

    return tx.hash;
  },

  setError: (error: string | null) => {
    set({ error });
  }
}));

