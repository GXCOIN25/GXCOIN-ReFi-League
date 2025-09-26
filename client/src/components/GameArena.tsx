import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Sword, Crown, Star, Trophy, Coins, Factory, Zap, Leaf, Recycle, DollarSign, Globe, TrendingUp, Award, Unlock, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useGameArena } from '@/lib/stores/useGameArena';
import { GameHero, EnvironmentalThreat } from '@/types/heroes';
import { environmentalThreats, calculateThreatRewards } from '@/data/environmentalThreats';
import { PatentRegistry } from '@/components/PatentRegistry';
import { EconomicsDashboard } from '@/components/EconomicsDashboard';

interface HeroCardProps {
  hero: GameHero;
  onSelect?: () => void;
  showStats?: boolean;
}

function HeroCard({ hero, onSelect, showStats = true }: HeroCardProps) {
  const { selectHero, selectedHero, unlockPatent, isLoading } = useGameArena();
  const isSelected = selectedHero?.id === hero.id;
  
  const handleUnlockPatent = async (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('🚀 Attempting to unlock patent for hero:', hero.name);
    
    // For demo purposes, associate hero with patent ID based on hero ID
    const patentId = parseInt(hero.id.replace('hero-', '')) || 1;
    
    try {
      const success = await unlockPatent(patentId);
      if (success) {
        console.log('✅ Patent unlocked successfully! Hero should now be available.');
      } else {
        console.warn('❌ Failed to unlock patent - may already be unlocked');
      }
    } catch (error) {
      console.error('❌ Error unlocking patent:', error);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="cursor-pointer"
      onClick={onSelect || (() => selectHero(hero.id))}
    >
      <Card className={`overflow-hidden transition-all duration-300 ${
        isSelected 
          ? 'ring-2 ring-green-500 shadow-lg shadow-green-500/20' 
          : 'hover:shadow-lg'
      } ${!hero.owned ? 'opacity-75' : ''} bg-gray-900/80 backdrop-blur-sm`}>
        <div className={`h-3 bg-gradient-to-r ${hero.gradient}`} />
        
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-3xl">{hero.avatar}</span>
              <div>
                <CardTitle className="text-lg font-bold text-green-300">{hero.name}</CardTitle>
                <p className="text-sm text-cyan-400 font-medium">{hero.title}</p>
              </div>
            </div>
            <div className="text-right">
              <Badge variant={hero.rarity === 'Legendary' ? 'destructive' : hero.rarity === 'Epic' ? 'secondary' : 'outline'}>
                🌟 {hero.rarity}
              </Badge>
              <p className="text-xs text-emerald-400 mt-1 font-medium">⚡ {hero.element}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <p className="text-sm text-gray-300 line-clamp-3 leading-relaxed">{hero.description}</p>
          
          {hero.owned && showStats && (
            <>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-gray-400 flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Impact
                  </p>
                  <div className="flex items-center gap-1">
                    <Progress value={hero.stats.power} className="h-2" />
                    <span className="text-green-400 font-bold">{hero.stats.power}</span>
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 flex items-center gap-1">
                    <Leaf className="w-3 h-3" />
                    Regeneration
                  </p>
                  <div className="flex items-center gap-1">
                    <Progress value={hero.stats.health} className="h-2" />
                    <span className="text-green-400 font-bold">{hero.stats.health}</span>
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Efficiency
                  </p>
                  <div className="flex items-center gap-1">
                    <Progress value={hero.stats.speed} className="h-2" />
                    <span className="text-green-400 font-bold">{hero.stats.speed}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-2">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span className="flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    Level {hero.level}
                  </span>
                  <span>{hero.experience}/{hero.maxExperience} XP</span>
                </div>
                <Progress value={(hero.experience / hero.maxExperience) * 100} className="h-1" />
              </div>

              <div className="space-y-1">
                <p className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                  <Unlock className="w-3 h-3" />
                  Patent Powers
                </p>
                <div className="grid grid-cols-1 gap-1">
                  {hero.abilities.slice(0, 2).map((ability, index) => (
                    <div key={index} className="flex justify-between text-xs bg-gray-800/30 rounded p-1">
                      <span className="text-cyan-300 font-medium">{ability.name}</span>
                      <span className="text-yellow-400 font-bold">💰 ${ability.effect === 'carbon_credits' ? '175+' : ability.effect === 'plastic_conversion' ? '1.25' : '50+'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {!hero.owned && (
            <div className="text-center py-2 bg-gray-800/50 rounded-lg">
              <p className="text-sm text-yellow-400 mb-2 font-medium">🔒 Patent Access Required</p>
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleUnlockPatent}
                disabled={isLoading}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white border-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Unlock className="w-3 h-3 mr-1" />
                {isLoading ? 'Unlocking...' : 'Unlock Patents'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function HeroCollection() {
  const { gameHeroes, getOwnedHeroes, getAvailableHeroes } = useGameArena();
  const [filterType, setFilterType] = useState<'all' | 'owned' | 'available'>('all');

  const filteredHeroes = filterType === 'owned' 
    ? getOwnedHeroes()
    : filterType === 'available'
    ? getAvailableHeroes()
    : gameHeroes;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-green-300 flex items-center gap-2">
            <Globe className="w-8 h-8" />
            Patent-Powered Eco-Warriors
          </h2>
          <p className="text-cyan-400 mt-1">🌍 Revolutionary heroes with real-world patent technologies</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterType === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('all')}
            className="bg-gradient-to-r from-emerald-600 to-green-600"
          >
            All Patents ({gameHeroes.length})
          </Button>
          <Button
            variant={filterType === 'owned' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('owned')}
            className="bg-gradient-to-r from-blue-600 to-cyan-600"
          >
            Unlocked ({getOwnedHeroes().length})
          </Button>
          <Button
            variant={filterType === 'available' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('available')}
            className="bg-gradient-to-r from-yellow-600 to-orange-600"
          >
            Available ({getAvailableHeroes().length})
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredHeroes.map(hero => (
          <HeroCard key={hero.id} hero={hero} />
        ))}
      </div>
    </div>
  );
}

function BattleInterface() {
  const { 
    selectedHero, 
    battlePhase, 
    currentBattle, 
    startEnvironmentalBattle, 
    selectThreatForBattle,
    executeTurn, 
    endBattle,
    playerStats,
    realTimeEconomics,
    getSessionEconomicSummary 
  } = useGameArena();

  // Environmental enemy types
  const environmentalEnemies = [
    { name: "Big Tech AI Factory", icon: "🏭", threat: "Data center carbon emissions destroying climate", difficulty: "EPIC" },
    { name: "Toxic Mining Operation", icon: "⛏️", threat: "Heavy metal pollution poisoning ecosystems", difficulty: "LEGENDARY" },
    { name: "Fast Fashion Empire", icon: "👗", threat: "Textile waste choking waterways", difficulty: "RARE" },
    { name: "Fossil Fuel Monopoly", icon: "🛢️", threat: "Carbon emissions accelerating climate crisis", difficulty: "EPIC" }
  ];

  if (battlePhase === 'idle') {
    return (
      <div className="space-y-6">
        <div className="text-center bg-gradient-to-r from-red-900/20 to-orange-900/20 rounded-lg p-6 border border-red-500/30">
          <h2 className="text-3xl font-bold text-red-400 mb-2 flex items-center justify-center gap-2">
            <Factory className="w-8 h-8" />
            Environmental Crisis Arena
          </h2>
          <p className="text-orange-300 text-lg">💥 Deploy patent-powered eco-warriors against environmental destruction!</p>
          <p className="text-yellow-400 mt-2">🏆 Victory generates REAL economic value through patent licensing</p>
        </div>

        {/* Environmental Threats Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {environmentalThreats.slice(0, 4).map((threat) => (
            <Card key={threat.id} className="bg-red-900/20 border-red-500/30 hover:bg-red-900/30 transition-colors cursor-pointer" onClick={() => selectThreatForBattle(threat.id)}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{threat.icon}</span>
                  <div>
                    <h3 className="font-bold text-red-400">{threat.name}</h3>
                    <Badge variant="destructive">Level {threat.threatLevel}</Badge>
                  </div>
                </div>
                <p className="text-gray-300 text-sm mb-2">{threat.description}</p>
                <div className="bg-green-900/20 rounded p-2 mt-2">
                  <p className="text-green-400 text-xs font-medium">💰 Potential Rewards: ${calculateThreatRewards(threat).toFixed(2)}</p>
                  <div className="grid grid-cols-2 gap-1 text-xs text-gray-300 mt-1">
                    {threat.economicRewards.carbonCredits && (
                      <span>🌿 {threat.economicRewards.carbonCredits}t CO₂</span>
                    )}
                    {threat.economicRewards.plasticConversion && (
                      <span>♻️ {threat.economicRewards.plasticConversion} bottles</span>
                    )}
                    {threat.economicRewards.energyGeneration && (
                      <span>⚡ {threat.economicRewards.energyGeneration} kWh</span>
                    )}
                    {threat.economicRewards.patentLicensing && (
                      <span>📋 ${threat.economicRewards.patentLicensing} patents</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {selectedHero ? (
          <div className="max-w-md mx-auto">
            <HeroCard hero={selectedHero} showStats={true} />
            <div className="mt-4 text-center space-y-3">
              <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-lg p-4 border border-green-500/30">
                <h3 className="text-green-400 font-bold mb-2">🎯 Mission Rewards</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-yellow-400">💰 $175+ Carbon Credits</div>
                  <div className="text-cyan-400">🌊 $1.25 per Bottle Converted</div>
                  <div className="text-emerald-400">⚡ $100+ Clean Energy</div>
                  <div className="text-orange-400">🔓 Patent Access Unlocked</div>
                </div>
              </div>
              <Button 
                onClick={() => startEnvironmentalBattle(selectedHero.id)}
                className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold px-8 py-3 text-lg"
                disabled={!selectedHero.owned}
              >
                <Sword className="w-5 h-5 mr-2" />
                ENGAGE ENVIRONMENTAL THREAT! 
              </Button>
              <p className="text-xs text-gray-400">Cost: 25 Patent Tokens</p>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-400">
            <Bot className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Select an eco-warrior to begin the environmental restoration mission</p>
            <p className="text-sm text-cyan-400 mt-2">🌍 Every battle generates real-world economic impact</p>
          </div>
        )}
      </div>
    );
  }

  if (battlePhase === 'battling' && currentBattle) {
    const currentThreat = currentBattle.environmentalThreat;
    if (!currentThreat) return null;
    
    return (
      <div className="space-y-6">
        <div className="text-center bg-gradient-to-r from-red-900/30 to-orange-900/30 rounded-lg p-4 border border-red-500/50">
          <h2 className="text-2xl font-bold text-red-400 mb-2">🚨 ENVIRONMENTAL CRISIS ACTIVE</h2>
          <p className="text-orange-300">Mission Turn {currentBattle.turn} - {currentBattle.playerTurn ? 'Deploy Patent Power!' : 'Environmental Threat Response'}</p>
          <div className="flex justify-center items-center gap-2 mt-2">
            <span className="text-green-400 font-bold">💰 {getSessionEconomicSummary()}</span>
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Player Hero */}
          <div className="space-y-4">
            <h3 className="font-bold text-green-400 text-center flex items-center justify-center gap-2">
              <Crown className="w-5 h-5" />
              Your Eco-Warrior
            </h3>
            <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-lg p-4 border border-green-500/30">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{currentBattle.playerHero!.avatar}</span>
                <div>
                  <p className="font-bold text-green-300">{currentBattle.playerHero!.name}</p>
                  <p className="text-sm text-cyan-400">Level {currentBattle.playerHero!.level} • {currentBattle.playerHero!.element} Patents</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400 flex items-center gap-1">
                    <Leaf className="w-3 h-3" />
                    Regeneration Power
                  </span>
                  <span className="text-green-400 font-bold">{currentBattle.playerHealth}/{currentBattle.playerHero!.stats.health}</span>
                </div>
                <Progress value={(currentBattle.playerHealth / currentBattle.playerHero!.stats.health) * 100} className="h-3" />
              </div>
            </div>

            {currentBattle.playerTurn && (
              <div className="space-y-2">
                <h4 className="font-medium text-cyan-400 flex items-center gap-2">
                  <Unlock className="w-4 h-4" />
                  Deploy Patent Power:
                </h4>
                {currentBattle.playerHero!.abilities.map((ability, index) => (
                  <Button
                    key={index}
                    onClick={() => executeTurn(index)}
                    className="w-full justify-between bg-gradient-to-r from-green-800 to-emerald-800 hover:from-green-700 hover:to-emerald-700 border border-green-500/50"
                    variant="outline"
                  >
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      <span className="font-medium">{ability.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {ability.damage && <span className="text-red-400">{ability.damage} Impact</span>}
                      <span className="text-yellow-400 font-bold">
                        💰 ${ability.effect === 'carbon_credits' ? '175+' : ability.effect === 'plastic_conversion' ? '1.25' : '50+'}
                      </span>
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Environmental Threat */}
          <div className="space-y-4">
            <h3 className="font-bold text-red-400 text-center flex items-center justify-center gap-2">
              <Factory className="w-5 h-5" />
              Environmental Threat
            </h3>
            <div className="bg-gradient-to-br from-red-900/30 to-orange-900/30 rounded-lg p-4 border border-red-500/30">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{currentThreat.icon}</span>
                <div>
                  <p className="font-bold text-red-400">{currentThreat.name}</p>
                  <p className="text-sm text-orange-400">Environmental Destroyer • Level {currentThreat.threatLevel}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400 flex items-center gap-1">
                    <Factory className="w-3 h-3" />
                    Destructive Power
                  </span>
                  <span className="text-red-400 font-bold">{currentBattle.threatHealth}/{currentThreat.threatLevel * 15}</span>
                </div>
                <Progress value={(currentBattle.threatHealth / (currentThreat.threatLevel * 15)) * 100} className="h-3" />
              </div>
              <div className="mt-3 text-xs text-orange-300 bg-red-900/20 rounded p-2">
                <strong>Threat:</strong> {currentThreat.description}
              </div>
              <div className="mt-2 text-xs text-green-300 bg-green-900/20 rounded p-2">
                <strong>Economic Impact:</strong> ${calculateThreatRewards(currentThreat).toFixed(2)} potential value
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (battlePhase === 'results' && currentBattle) {
    const isVictory = currentBattle.playerHealth > 0;
    const currentEnemy = environmentalEnemies[Math.floor(Math.random() * environmentalEnemies.length)];
    
    return (
      <div className="space-y-6 text-center">
        <div className={`text-5xl font-bold ${isVictory ? 'text-green-500' : 'text-red-500'}`}>
          {isVictory ? '🌍 PLANET SAVED!' : '💔 ENVIRONMENTAL DEFEAT'}
        </div>
        
        {isVictory && (
          <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-lg p-6 max-w-2xl mx-auto border border-green-500/50">
            <h3 className="font-bold text-green-400 mb-4 text-xl flex items-center justify-center gap-2">
              <Trophy className="w-6 h-6" />
              REVOLUTIONARY ENVIRONMENTAL IMPACT
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between bg-green-900/20 rounded p-2">
                  <span className="text-gray-300">🌿 Carbon Credits Generated:</span>
                  <span className="text-green-400 font-bold">+$175+ USD</span>
                </div>
                <div className="flex justify-between bg-blue-900/20 rounded p-2">
                  <span className="text-gray-300">🌊 Ocean Plastic Converted:</span>
                  <span className="text-cyan-400 font-bold">+$1.25 per bottle</span>
                </div>
                <div className="flex justify-between bg-yellow-900/20 rounded p-2">
                  <span className="text-gray-300">⚡ Clean Energy Generated:</span>
                  <span className="text-yellow-400 font-bold">+$100+ USD</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between bg-purple-900/20 rounded p-2">
                  <span className="text-gray-300">🔓 Patent Access Unlocked:</span>
                  <span className="text-purple-400 font-bold">3 Technologies</span>
                </div>
                <div className="flex justify-between bg-orange-900/20 rounded p-2">
                  <span className="text-gray-300">🌍 Environmental XP:</span>
                  <span className="text-orange-400 font-bold">+{isVictory ? 250 : 50} XP</span>
                </div>
                <div className="flex justify-between bg-emerald-900/20 rounded p-2">
                  <span className="text-gray-300">💎 Patent Tokens:</span>
                  <span className="text-emerald-400 font-bold">+{isVictory ? 100 : 25} PT</span>
                </div>
              </div>
            </div>
            <div className="mt-4 text-center bg-gradient-to-r from-green-800/30 to-emerald-800/30 rounded-lg p-3">
              <p className="text-green-300 font-bold text-lg">🏆 {currentBattle.environmentalThreat?.name} NEUTRALIZED!</p>
              <p className="text-cyan-400 text-sm mt-1">Environmental restoration protocols activated globally</p>
            </div>
          </div>
        )}

        {!isVictory && (
          <div className="bg-gradient-to-r from-red-900/30 to-orange-900/30 rounded-lg p-6 max-w-md mx-auto border border-red-500/50">
            <h3 className="font-bold text-red-400 mb-4">Environmental Crisis Continues</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Partial Impact Generated:</span>
                <span className="text-yellow-400">+$25 USD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Research XP Gained:</span>
                <span className="text-cyan-400">+50 XP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Patent Knowledge:</span>
                <span className="text-purple-400">+10 PT</span>
              </div>
            </div>
          </div>
        )}

        <Button 
          onClick={endBattle}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold px-8 py-3"
        >
          <Globe className="w-5 h-5 mr-2" />
          Continue Environmental Mission
        </Button>
      </div>
    );
  }

  return null;
}

function PlayerStats() {
  const { playerStats } = useGameArena();
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-500/30">
        <CardContent className="p-4 text-center">
          <Trophy className="w-6 h-6 mx-auto mb-2 text-green-400" />
          <p className="text-2xl font-bold text-green-300">{playerStats.wins}</p>
          <p className="text-xs text-green-400">🌍 Planet Saves</p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-red-900/30 to-orange-900/30 border-red-500/30">
        <CardContent className="p-4 text-center">
          <Factory className="w-6 h-6 mx-auto mb-2 text-red-400" />
          <p className="text-2xl font-bold text-red-300">{playerStats.losses}</p>
          <p className="text-xs text-red-400">🏭 Threats Active</p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border-yellow-500/30">
        <CardContent className="p-4 text-center">
          <DollarSign className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
          <p className="text-2xl font-bold text-yellow-300">${playerStats.arenaCoins * 5}+</p>
          <p className="text-xs text-yellow-400">💰 Economic Impact</p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border-purple-500/30">
        <CardContent className="p-4 text-center">
          <Unlock className="w-6 h-6 mx-auto mb-2 text-purple-400" />
          <p className="text-2xl font-bold text-purple-300">{playerStats.rank * 3}</p>
          <p className="text-xs text-purple-400">🔓 Patents Unlocked</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function GameArena() {
  return (
    <div className="space-y-6 bg-gradient-to-br from-gray-900 via-green-900/10 to-emerald-900/10 min-h-screen">
      <div className="text-center bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-lg p-8 border border-green-500/30">
        <h1 className="text-4xl font-bold text-green-300 mb-3 flex items-center justify-center gap-3">
          <Globe className="w-10 h-10" />
          EPIC ECO-GAMING REVOLUTION
        </h1>
        <p className="text-xl text-cyan-400 mb-2">🌍 The World's First Patent-Powered Environmental Gaming Platform</p>
        <p className="text-green-400">⚡ Deploy eco-warriors with REAL patents to generate ACTUAL economic value while saving the planet!</p>
        <div className="flex justify-center items-center gap-6 mt-4 text-sm">
          <span className="text-yellow-400 font-bold">💰 $175+ Carbon Credits</span>
          <span className="text-cyan-400 font-bold">🌊 $1.25 per Bottle</span>
          <span className="text-emerald-400 font-bold">⚡ $100+ Clean Energy</span>
          <span className="text-purple-400 font-bold">🔓 Real Patents</span>
        </div>
      </div>

      <PlayerStats />

      <Tabs defaultValue="collection" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800/50">
          <TabsTrigger value="collection" className="flex items-center gap-2 text-green-400">
            <Unlock className="w-4 h-4" />
            Patent Collection
          </TabsTrigger>
          <TabsTrigger value="battle" className="flex items-center gap-2 text-red-400">
            <Factory className="w-4 h-4" />
            Environmental Crisis
          </TabsTrigger>
          <TabsTrigger value="patents" className="flex items-center gap-2 text-purple-400">
            <Unlock className="w-4 h-4" />
            Patent Registry
          </TabsTrigger>
          <TabsTrigger value="economics" className="flex items-center gap-2 text-green-400">
            <DollarSign className="w-4 h-4" />
            Economic Impact
          </TabsTrigger>
        </TabsList>

        <TabsContent value="collection" className="mt-6">
          <HeroCollection />
        </TabsContent>

        <TabsContent value="battle" className="mt-6">
          <BattleInterface />
        </TabsContent>
        
        <TabsContent value="patents" className="mt-6">
          <PatentRegistry />
        </TabsContent>
        
        <TabsContent value="economics" className="mt-6">
          <EconomicsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}