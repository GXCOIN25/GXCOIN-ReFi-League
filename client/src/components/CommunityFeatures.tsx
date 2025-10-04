import React, { useState, useEffect } from 'react';
import { Users, Trophy, Target, Clock, Star, Crown } from 'lucide-react';
import { useUser } from '../lib/stores/useUser';
import { GXCoinAPI } from '../lib/api';

interface TeamMission {
  id: string;
  title: string;
  description: string;
  goal: number;
  current: number;
  participants: number;
  timeLeft: string;
  reward: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Legendary';
}

interface LeaderboardEntry {
  rank: number;
  username: string;
  contribution: number;
  rank_title: string;
  avatar?: string;
}

export const CommunityFeatures: React.FC = () => {
  const { currentUser } = useUser();
  const [activeTab, setActiveTab] = useState<'missions' | 'leaderboard' | 'teams'>('missions');
  const [teamMissions, setTeamMissions] = useState<TeamMission[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const [missions, leaderboardData] = await Promise.all([
          GXCoinAPI.getTeamMissions(),
          GXCoinAPI.getLeaderboard(10)
        ]);
        
        setTeamMissions(missions);
        setLeaderboard(leaderboardData);
        
        const userPosition = leaderboardData.findIndex(entry => entry.username === currentUser.username);
        if (userPosition >= 0) {
          setUserRank(userPosition + 1);
        } else {
          const totalContribution = await GXCoinAPI.getTotalContribution();
          if (totalContribution > 0) {
            setUserRank(leaderboardData.length + 1);
          } else {
            setUserRank(0);
          }
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load community data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400 bg-green-500/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'Hard': return 'text-orange-400 bg-orange-500/20';
      case 'Legendary': return 'text-purple-400 bg-purple-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Trophy className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Trophy className="w-5 h-5 text-amber-600" />;
    return <Star className="w-4 h-4 text-gray-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-black/80 backdrop-blur-sm rounded-xl border border-purple-500/30 p-2">
        <div className="flex space-x-1">
          {[
            { id: 'missions', label: 'Team Missions', icon: Target },
            { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
            { id: 'teams', label: 'Teams', icon: Users }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all duration-200 ${
                activeTab === id
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Team Missions */}
      {activeTab === 'missions' && (
        <div className="space-y-4">
          <div className="bg-black/80 backdrop-blur-sm rounded-xl border border-green-500/30 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-lg">Active Team Missions</h3>
              <div className="flex items-center space-x-2">
                <div className="text-green-400 text-sm font-medium">Join the Fight!</div>
              </div>
            </div>

            {isLoading && (
              <div className="text-center py-8">
                <div className="text-gray-400">Loading team missions...</div>
              </div>
            )}

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-4">
                <p className="text-red-300">{error}</p>
              </div>
            )}

            {!isLoading && !error && teamMissions.length === 0 && (
              <div className="text-center py-8">
                <div className="text-gray-400">No active team missions at the moment</div>
              </div>
            )}

            <div className="space-y-4">
              {!isLoading && !error && teamMissions.map((mission) => (
                <div key={mission.id} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-white font-semibold">{mission.title}</h4>
                      <p className="text-gray-400 text-sm mt-1">{mission.description}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(mission.difficulty)}`}>
                      {mission.difficulty}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Progress</span>
                        <span className="text-white">{((mission.current / mission.goal) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((mission.current / mission.goal) * 100, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>{mission.current.toLocaleString()}</span>
                        <span>{mission.goal.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Mission Details */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1 text-blue-400">
                          <Users className="w-4 h-4" />
                          <span>{mission.participants}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-orange-400">
                          <Clock className="w-4 h-4" />
                          <span>{mission.timeLeft}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-semibold text-sm">{mission.reward}</p>
                        <button className="mt-1 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded transition-colors">
                          Join Mission
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      {activeTab === 'leaderboard' && (
        <div className="bg-black/80 backdrop-blur-sm rounded-xl border border-yellow-500/30 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-bold text-lg">Global Leaderboard</h3>
            <div className="text-yellow-400 text-sm">All Time</div>
          </div>

          {currentUser && userRank > 0 && (
            <div className="bg-purple-500/20 border border-purple-500/50 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-purple-400 font-bold">#{userRank}</span>
                  <span className="text-white font-medium">{currentUser.username}</span>
                </div>
                <span className="text-purple-300">Your Rank</span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {leaderboard.map((entry, index) => (
              <div key={entry.rank} className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                index < 3 ? 'bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border border-yellow-500/30' : 'bg-gray-900/50 hover:bg-gray-800/50'
              }`}>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getRankIcon(entry.rank)}
                    <span className="text-white font-bold text-lg w-8">#{entry.rank}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{entry.avatar}</span>
                    <div>
                      <p className="text-white font-medium">{entry.username}</p>
                      <p className="text-gray-400 text-sm">{entry.rank_title}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-bold">{entry.contribution.toLocaleString()}</p>
                  <p className="text-gray-400 text-sm">GXCOIN</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Teams */}
      {activeTab === 'teams' && (
        <div className="bg-black/80 backdrop-blur-sm rounded-xl border border-blue-500/30 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-bold text-lg">Team System</h3>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              Create Team
            </button>
          </div>

          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h4 className="text-white font-bold text-xl mb-2">Team System Coming Soon!</h4>
            <p className="text-gray-400 mb-6">Join forces with other Eco-Warriors to maximize your environmental impact</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <h5 className="text-white font-semibold mb-1">Team Competitions</h5>
                <p className="text-gray-400 text-sm">Compete with other teams for exclusive rewards</p>
              </div>
              
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                <Target className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <h5 className="text-white font-semibold mb-1">Shared Goals</h5>
                <p className="text-gray-400 text-sm">Work together on large-scale environmental projects</p>
              </div>
              
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                <Star className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <h5 className="text-white font-semibold mb-1">Team Perks</h5>
                <p className="text-gray-400 text-sm">Unlock exclusive benefits and multiplier bonuses</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};