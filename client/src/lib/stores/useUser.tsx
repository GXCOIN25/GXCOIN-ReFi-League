import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { GXCoinAPI, type ApiUser, type GitHubProfile, type GitHubRepository } from "@/lib/api";

interface UserState {
  currentUser: ApiUser | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
  
  // GitHub state
  githubProfile: GitHubProfile | null;
  githubRepositories: GitHubRepository[];
  isGitHubConnected: boolean;
  isLoadingGitHub: boolean;
  githubError: string | null;
  
  // Actions
  register: (userData: { username: string; password: string; walletAddress?: string }) => Promise<void>;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  setError: (error: string | null) => void;
  
  // GitHub actions
  startGitHubOAuth: () => Promise<void>;
  completeGitHubOAuth: (code: string, state: string) => Promise<void>;
  handleGitHubConnection: () => Promise<void>;
  fetchGitHubProfile: () => Promise<void>;
  fetchGitHubRepositories: () => Promise<void>;
  setGitHubError: (error: string | null) => void;
}

export const useUser = create<UserState>()(
  subscribeWithSelector((set, get) => ({
    currentUser: null,
    isLoggedIn: false,
    isLoading: false,
    error: null,
    
    // GitHub state
    githubProfile: null,
    githubRepositories: [],
    isGitHubConnected: false,
    isLoadingGitHub: false,
    githubError: null,
    
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
    },
    
    // GitHub OAuth actions
    startGitHubOAuth: async () => {
      set({ isLoadingGitHub: true, githubError: null });
      try {
        const { authUrl, state } = await GXCoinAPI.startGitHubOAuth();
        
        // Store OAuth state for verification
        sessionStorage.setItem('github_oauth_state', state);
        
        // Redirect to GitHub OAuth
        window.location.href = authUrl;
      } catch (error) {
        set({ 
          githubError: error instanceof Error ? error.message : 'Failed to start GitHub OAuth', 
          isLoadingGitHub: false 
        });
      }
    },

    completeGitHubOAuth: async (code: string, state: string) => {
      set({ isLoadingGitHub: true, githubError: null });
      try {
        const result = await GXCoinAPI.completeGitHubOAuth(code, state);
        set({ 
          currentUser: result.user, 
          isGitHubConnected: !!result.user.githubUsername,
          isLoadingGitHub: false 
        });
        
        // Auto-fetch GitHub profile after successful connection
        get().fetchGitHubProfile();
        
        // Clean up stored OAuth state
        sessionStorage.removeItem('github_oauth_state');
        
        // Clean up URL parameters
        const cleanUrl = window.location.href.split('?')[0];
        window.history.replaceState({}, document.title, cleanUrl);
      } catch (error) {
        set({ 
          githubError: error instanceof Error ? error.message : 'Failed to complete GitHub OAuth', 
          isLoadingGitHub: false 
        });
      }
    },

    handleGitHubConnection: async () => {
      set({ isLoadingGitHub: true, githubError: null });
      try {
        // Try to use the initiateGitHubConnection method which handles OAuth flow properly
        const result = await GXCoinAPI.initiateGitHubConnection();
        set({ 
          currentUser: result.user, 
          isGitHubConnected: !!result.user.githubUsername,
          isLoadingGitHub: false 
        });
        
        // Auto-fetch GitHub profile after successful connection
        get().fetchGitHubProfile();
      } catch (error) {
        if (error instanceof Error && error.message === 'REDIRECTING_TO_OAUTH') {
          // This is expected when redirecting to OAuth, don't set it as an error
          return;
        }
        set({ 
          githubError: error instanceof Error ? error.message : 'Failed to connect GitHub', 
          isLoadingGitHub: false 
        });
      }
    },
    
    fetchGitHubProfile: async () => {
      set({ isLoadingGitHub: true, githubError: null });
      try {
        const profile = await GXCoinAPI.getGitHubProfile();
        set({ 
          githubProfile: profile,
          isGitHubConnected: true,
          isLoadingGitHub: false 
        });
      } catch (error) {
        set({ 
          githubError: error instanceof Error ? error.message : 'Failed to fetch GitHub profile', 
          isLoadingGitHub: false,
          isGitHubConnected: false
        });
      }
    },
    
    fetchGitHubRepositories: async () => {
      set({ isLoadingGitHub: true, githubError: null });
      try {
        const repositories = await GXCoinAPI.getGitHubRepositories();
        set({ 
          githubRepositories: repositories,
          isLoadingGitHub: false 
        });
      } catch (error) {
        set({ 
          githubError: error instanceof Error ? error.message : 'Failed to fetch GitHub repositories', 
          isLoadingGitHub: false 
        });
      }
    },
    
    setGitHubError: (error) => {
      set({ githubError: error });
    }
  }))
);

// Initialize GitHub connection status based on current user
useUser.subscribe(
  (state) => state.currentUser,
  (currentUser) => {
    if (currentUser) {
      const isConnected = !!currentUser.githubUsername;
      useUser.setState({ isGitHubConnected: isConnected });
      
      // Auto-fetch GitHub profile if connected
      if (isConnected) {
        useUser.getState().fetchGitHubProfile();
      }
    } else {
      useUser.setState({ 
        isGitHubConnected: false,
        githubProfile: null,
        githubRepositories: [],
        githubError: null
      });
    }
  }
);