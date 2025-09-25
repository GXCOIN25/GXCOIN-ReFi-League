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
    if (!window.ethereum) {
      set({ error: 'Please install MetaMask or another Web3 wallet' });
      return;
    }

    set({ isConnecting: true, error: null });

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      set({
        isConnected: true,
        address,
        provider,
        isConnecting: false
      });
      
      // Get initial balance
      await get().getBalance();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to connect wallet',
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

// Add global type for ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}