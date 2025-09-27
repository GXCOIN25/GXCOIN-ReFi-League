// API client for GXCOIN backend
const API_BASE = '/api';

export interface ApiUser {
  id: number;
  username: string;
  walletAddress?: string;
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
}