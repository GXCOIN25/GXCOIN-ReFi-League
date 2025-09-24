import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { GXCoinAPI, type ApiUser } from "@/lib/api";

interface UserState {
  currentUser: ApiUser | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  register: (userData: { username: string; password: string; walletAddress?: string }) => Promise<void>;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  setError: (error: string | null) => void;
}

export const useUser = create<UserState>()(
  subscribeWithSelector((set, get) => ({
    currentUser: null,
    isLoggedIn: false,
    isLoading: false,
    error: null,
    
    register: async (userData) => {
      set({ isLoading: true, error: null });
      try {
        const result = await GXCoinAPI.register(userData);
        set({ 
          currentUser: result.user, 
          isLoggedIn: true, 
          isLoading: false 
        });
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to register', 
          isLoading: false 
        });
      }
    },
    
    login: async (credentials) => {
      set({ isLoading: true, error: null });
      try {
        const result = await GXCoinAPI.login(credentials);
        set({ 
          currentUser: result.user, 
          isLoggedIn: true, 
          isLoading: false 
        });
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to login', 
          isLoading: false 
        });
      }
    },
    
    logout: async () => {
      try {
        await GXCoinAPI.logout();
      } catch (error) {
        console.warn('Logout API call failed:', error);
      }
      set({ 
        currentUser: null, 
        isLoggedIn: false, 
        error: null 
      });
    },
    
    initializeAuth: async () => {
      const token = localStorage.getItem('gxcoin_token');
      if (!token) return;
      
      set({ isLoading: true });
      try {
        const user = await GXCoinAPI.getCurrentUser();
        set({ 
          currentUser: user, 
          isLoggedIn: true, 
          isLoading: false 
        });
      } catch (error) {
        localStorage.removeItem('gxcoin_token');
        set({ 
          currentUser: null, 
          isLoggedIn: false, 
          isLoading: false 
        });
      }
    },
    
    setError: (error) => {
      set({ error });
    }
  }))
);