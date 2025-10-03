// API client for GXCOIN backend
const API_BASE = '/api';

export interface ApiUser {
  id: number;
  username: string;
  walletAddress?: string;
  githubUsername?: string;
  githubAvatarUrl?: string;
  githubProfileUrl?: string;
  githubConnectedAt?: string;
  createdAt?: string;
}

export interface ApiContribution {
  id: number;
  userId: number;
  amount: number;
  currentRankId: string;
  impactMetrics: {
    plasticRemoved: number;
    carbonOffset: number;
    renewableEnergy: number;
    treesPlanted: number;
    waterPurified: number;
  };
  createdAt: string;
}

export interface ApiNftBadge {
  id: number;
  userId: number;
  heroId: string;
  level: number;
  evolution: string;
  rarity: string;
  attributes: Record<string, number>;
  minted: boolean;
  createdAt: string;
}

export interface GitHubProfile {
  username: string;
  name: string;
  avatarUrl: string;
  profileUrl: string;
  bio: string;
  publicRepos: number;
  followers: number;
  following: number;
  createdAt: string;
}

export interface GitHubRepository {
  id: number;
  name: string;
  fullName: string;
  description: string;
  language: string;
  stargazersCount: number;
  forksCount: number;
  htmlUrl: string;
  private: boolean;
  updatedAt: string;
  createdAt: string;
}

export class GXCoinAPI {
  private static getAuthHeaders() {
    const token = localStorage.getItem('gxcoin_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Helper method to detect if running in Replit environment
  private static isReplitEnvironment(): boolean {
    return typeof window !== 'undefined' && 
           (window.location.hostname.includes('replit') || 
            window.location.hostname.includes('repl.co'));
  }

  // Authentication methods
  static async register(userData: { username: string; password: string; walletAddress?: string }): Promise<{ user: ApiUser; token: string }> {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }
    
    const data = await response.json();
    localStorage.setItem('gxcoin_token', data.token);
    return data;
  }

  static async login(credentials: { username: string; password: string }): Promise<{ user: ApiUser; token: string }> {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }
    
    const data = await response.json();
    localStorage.setItem('gxcoin_token', data.token);
    return data;
  }

  static async loginWithReplit(email?: string, token?: string): Promise<{ user: ApiUser; token: string }> {
    // Try the new secure endpoint first
    try {
      const response = await fetch(`${API_BASE}/auth/replit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token }),
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('gxcoin_token', data.token);
        return data;
      }
      
      // If secure endpoint fails, log the error but continue to fallback
      const error = await response.json();
      console.warn('Secure Replit auth failed, trying fallback:', error.error);
    } catch (error) {
      console.warn('Secure Replit auth endpoint error:', error);
    }
    
    // Fallback to legacy callback (for development environments)
    console.log('Using legacy Replit authentication callback');
    const response = await fetch(`${API_BASE}/auth/replit/callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Replit authentication failed');
    }
    
    const data = await response.json();
    localStorage.setItem('gxcoin_token', data.token);
    return data;
  }

  static async logout(): Promise<void> {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });
    localStorage.removeItem('gxcoin_token');
  }

  static async getCurrentUser(): Promise<ApiUser> {
    const response = await fetch(`${API_BASE}/users/me`, {
      headers: this.getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to get current user');
    return response.json();
  }

  // Contribution methods
  static async getUserContributions(): Promise<ApiContribution[]> {
    const response = await fetch(`${API_BASE}/contributions`, {
      headers: this.getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to get contributions');
    return response.json();
  }

  static async getTotalContribution(): Promise<number> {
    const response = await fetch(`${API_BASE}/contributions/total`, {
      headers: this.getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to get total contribution');
    const data = await response.json();
    return data.total;
  }

  static async addContribution(contributionData: {
    amount: number;
    currentRankId: string;
    impactMetrics: any;
  }): Promise<ApiContribution> {
    const response = await fetch(`${API_BASE}/contributions`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(contributionData),
    });
    if (!response.ok) throw new Error('Failed to add contribution');
    return response.json();
  }

  // NFT Badge methods
  static async getUserNFTBadges(): Promise<ApiNftBadge[]> {
    const response = await fetch(`${API_BASE}/nft-badges`, {
      headers: this.getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to get NFT badges');
    return response.json();
  }

  static async createNFTBadge(badgeData: {
    heroId: string;
    level: number;
    evolution: string;
    rarity: string;
    attributes: Record<string, number>;
    minted?: boolean;
  }): Promise<ApiNftBadge> {
    const response = await fetch(`${API_BASE}/nft-badges`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(badgeData),
    });
    if (!response.ok) throw new Error('Failed to create NFT badge');
    return response.json();
  }

  // Mission methods
  static async getUserMissions(): Promise<any[]> {
    const response = await fetch(`${API_BASE}/missions`, {
      headers: this.getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to get missions');
    return response.json();
  }

  static async updateMissionProgress(missionId: string, progress: number): Promise<void> {
    const response = await fetch(`${API_BASE}/missions/${missionId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ progress }),
    });
    if (!response.ok) throw new Error('Failed to update mission progress');
  }

  // Patent Registry API methods
  static async getAllPatents(): Promise<any[]> {
    const response = await fetch(`${API_BASE}/patents`, {
      headers: this.getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to get patents');
    return response.json();
  }

  static async getPatentById(patentId: number): Promise<any> {
    const response = await fetch(`${API_BASE}/patents/${patentId}`, {
      headers: this.getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to get patent');
    return response.json();
  }

  static async getUserPatentAccess(): Promise<any[]> {
    const response = await fetch(`${API_BASE}/patents/user-access`, {
      headers: this.getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to get patent access');
    return response.json();
  }

  static async unlockPatent(patentId: number): Promise<any> {
    const response = await fetch(`${API_BASE}/patents/${patentId}/unlock`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to unlock patent');
    return response.json();
  }

  static async usePatent(patentId: number, heroId: string, usageType: string, quantity = 1): Promise<any> {
    const response = await fetch(`${API_BASE}/patents/${patentId}/use`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ heroId, usageType, quantity })
    });
    if (!response.ok) throw new Error('Failed to use patent');
    return response.json();
  }

  // Environmental Battle API methods
  static async recordBattle(battleData: any): Promise<any> {
    const response = await fetch(`${API_BASE}/battles`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(battleData)
    });
    if (!response.ok) throw new Error('Failed to record battle');
    return response.json();
  }

  static async getBattleHistory(): Promise<any[]> {
    const response = await fetch(`${API_BASE}/battles/history`, {
      headers: this.getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to get battle history');
    return response.json();
  }

  // Economic Rewards API methods
  static async getEconomicRewards(): Promise<any[]> {
    const response = await fetch(`${API_BASE}/rewards`, {
      headers: this.getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to get economic rewards');
    return response.json();
  }

  static async addEconomicReward(rewardData: any): Promise<any> {
    const response = await fetch(`${API_BASE}/rewards`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(rewardData)
    });
    if (!response.ok) throw new Error('Failed to add economic reward');
    return response.json();
  }

  static async getUserEconomicStats(): Promise<any> {
    const response = await fetch(`${API_BASE}/stats/economic`, {
      headers: this.getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to get economic stats');
    return response.json();
  }

  // GitHub Integration API methods
  static async getGitHubProfile(): Promise<GitHubProfile> {
    const response = await fetch(`${API_BASE}/github/profile`, {
      headers: this.getAuthHeaders()
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get GitHub profile');
    }
    return response.json();
  }

  static async getGitHubRepositories(): Promise<GitHubRepository[]> {
    const response = await fetch(`${API_BASE}/github/repos`, {
      headers: this.getAuthHeaders()
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get GitHub repositories');
    }
    return response.json();
  }

  // OAuth-based GitHub connection methods
  static async startGitHubOAuth(): Promise<{ authUrl: string; state: string }> {
    const response = await fetch(`${API_BASE}/github/oauth/start`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to start GitHub OAuth flow');
    }
    return response.json();
  }

  static async completeGitHubOAuth(code: string, state: string): Promise<{ user: ApiUser; message: string }> {
    const response = await fetch(`${API_BASE}/github/oauth/callback`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ code, state })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to complete GitHub OAuth');
    }
    return response.json();
  }

  // Legacy connect method for development environments
  static async connectGitHub(): Promise<{ user: ApiUser; message: string }> {
    // Check if we should redirect to OAuth flow
    const response = await fetch(`${API_BASE}/github/connect`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      const error = await response.json();
      // If response indicates we should use OAuth, start the OAuth flow
      if (error.redirectTo === '/api/github/oauth/start') {
        throw new Error('OAUTH_REQUIRED'); // Special error to trigger OAuth flow
      }
      throw new Error(error.error || 'Failed to connect GitHub account');
    }
    return response.json();
  }

  // Helper method to handle GitHub OAuth popup/redirect flow
  static async initiateGitHubConnection(): Promise<{ user: ApiUser; message: string }> {
    try {
      // Try the legacy connection first (for development environments)
      return await this.connectGitHub();
    } catch (error) {
      if (error instanceof Error && error.message === 'OAUTH_REQUIRED') {
        // Start OAuth flow
        const { authUrl, state } = await this.startGitHubOAuth();
        
        // Store state for later verification
        sessionStorage.setItem('github_oauth_state', state);
        
        // Redirect to GitHub OAuth
        window.location.href = authUrl;
        
        // This will not return as we're redirecting
        throw new Error('REDIRECTING_TO_OAUTH');
      }
      throw error;
    }
  }

  // Method to handle OAuth callback from URL parameters
  static async handleGitHubOAuthCallback(): Promise<{ user: ApiUser; message: string }> {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const storedState = sessionStorage.getItem('github_oauth_state');

    if (!code || !state) {
      throw new Error('Missing OAuth callback parameters');
    }

    if (state !== storedState) {
      throw new Error('Invalid OAuth state parameter');
    }

    // Clean up stored state
    sessionStorage.removeItem('github_oauth_state');

    // Complete the OAuth flow
    const result = await this.completeGitHubOAuth(code, state);
    
    // Clean up URL parameters
    const cleanUrl = window.location.href.split('?')[0];
    window.history.replaceState({}, document.title, cleanUrl);
    
    return result;
  }
}