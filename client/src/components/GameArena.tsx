import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Sword, Crown, Star, Trophy, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useGameArena } from '@/lib/stores/useGameArena';
import { GameHero } from '@/types/heroes';

interface HeroCardProps {
  hero: GameHero;
  onSelect?: () => void;
  showStats?: boolean;
}

function HeroCard({ hero, onSelect, showStats = true }: HeroCardProps) {
  const { selectHero, selectedHero } = useGameArena();
  const isSelected = selectedHero?.id === hero.id;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="cursor-pointer"
      onClick={onSelect || (() => selectHero(hero.id))}
    >
      <Card className={`overflow-hidden transition-all duration-300 ${
        isSelected 
          ? 'ring-2 ring-yellow-500 shadow-lg shadow-yellow-500/20' 
          : 'hover:shadow-lg'
      } ${!hero.owned ? 'opacity-75' : ''}`}>
        <div className={`h-2 bg-gradient-to-r ${hero.gradient}`} />
        
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{hero.avatar}</span>
              <div>
                <CardTitle className="text-lg font-bold text-white">{hero.name}</CardTitle>
                <p className="text-sm text-gray-400">{hero.title}</p>
              </div>
            </div>
            <div className="text-right">
              <Badge variant={hero.rarity === 'Legendary' ? 'destructive' : hero.rarity === 'Epic' ? 'secondary' : 'outline'}>
                {hero.rarity}
              </Badge>
              <p className="text-xs text-gray-400 mt-1">{hero.element}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <p className="text-sm text-gray-300 line-clamp-2">{hero.description}</p>
          
          {hero.owned && showStats && (
            <>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-gray-400">Power</p>
                  <div className="flex items-center gap-1">
                    <Progress value={hero.stats.power} className="h-1" />
                    <span className="text-white font-medium">{hero.stats.power}</span>
                  </div>
                </div>
                <div>
                  <p className="text-gray-400">Health</p>
                  <div className="flex items-center gap-1">
                    <Progress value={hero.stats.health} className="h-1" />
                    <span className="text-white font-medium">{hero.stats.health}</span>
                  </div>
                </div>
                <div>
                  <p className="text-gray-400">Speed</p>
                  <div className="flex items-center gap-1">
                    <Progress value={hero.stats.speed} className="h-1" />
                    <span className="text-white font-medium">{hero.stats.speed}</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Level {hero.level}</span>
                  <span>{hero.experience}/{hero.maxExperience} XP</span>
                </div>
                <Progress value={(hero.experience / hero.maxExperience) * 100} className="h-1" />
              </div>

              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-400">Abilities</p>
                <div className="grid grid-cols-1 gap-1">
                  {hero.abilities.slice(0, 2).map((ability, index) => (
                    <div key={index} className="flex justify-between text-xs">
                      <span className="text-gray-300">{ability.name}</span>
                      <span className="text-gray-500">CD: {ability.cooldown}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {!hero.owned && (
            <div className="text-center py-2">
              <p className="text-sm text-gray-400 mb-2">Not Owned</p>
              <Button 
                size="sm" 
                variant="outline"
                className="bg-gray-800 hover:bg-gray-700"
              >
                Unlock Hero
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
        <h2 className="text-2xl font-bold text-white">Hero Collection</h2>
        <div className="flex gap-2">
          <Button
            variant={filterType === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('all')}
          >
            All ({gameHeroes.length})
          </Button>
          <Button
            variant={filterType === 'owned' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('owned')}
          >
            Owned ({getOwnedHeroes().length})
          </Button>
          <Button
            variant={filterType === 'available' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('available')}
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
    startBattle, 
    executeTurn, 
    endBattle,
    playerStats 
  } = useGameArena();

  if (battlePhase === 'idle') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Battle Arena</h2>
          <p className="text-gray-400">Select a hero and challenge opponents to earn Arena Coins!</p>
        </div>

        {selectedHero ? (
          <div className="max-w-md mx-auto">
            <HeroCard hero={selectedHero} showStats={true} />
            <div className="mt-4 text-center">
              <Button 
                onClick={() => startBattle(selectedHero.id)}
                className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500"
                disabled={!selectedHero.owned}
              >
                <Sword className="w-4 h-4 mr-2" />
                Start Quick Battle (10 AC)
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-400">
            <Shield className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Select a hero from your collection to begin battling</p>
          </div>
        )}
      </div>
    );
  }

  if (battlePhase === 'battling' && currentBattle) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Battle in Progress</h2>
          <p className="text-gray-400">Turn {currentBattle.turn} - {currentBattle.playerTurn ? 'Your Turn' : 'Opponent Turn'}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Player Hero */}
          <div className="space-y-4">
            <h3 className="font-bold text-white text-center">Your Hero</h3>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{currentBattle.playerHero!.avatar}</span>
                <div>
                  <p className="font-bold text-white">{currentBattle.playerHero!.name}</p>
                  <p className="text-sm text-gray-400">Level {currentBattle.playerHero!.level}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Health</span>
                  <span className="text-white">{currentBattle.playerHealth}/{currentBattle.playerHero!.stats.health}</span>
                </div>
                <Progress value={(currentBattle.playerHealth / currentBattle.playerHero!.stats.health) * 100} className="h-2" />
              </div>
            </div>

            {currentBattle.playerTurn && (
              <div className="space-y-2">
                <h4 className="font-medium text-white">Choose Ability:</h4>
                {currentBattle.playerHero!.abilities.map((ability, index) => (
                  <Button
                    key={index}
                    onClick={() => executeTurn(index)}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <span className="font-medium">{ability.name}</span>
                    <span className="ml-auto text-xs">
                      {ability.damage ? `${ability.damage} DMG` : ability.effect}
                    </span>
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Opponent Hero */}
          <div className="space-y-4">
            <h3 className="font-bold text-white text-center">Opponent</h3>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{currentBattle.opponentHero!.avatar}</span>
                <div>
                  <p className="font-bold text-white">{currentBattle.opponentHero!.name}</p>
                  <p className="text-sm text-gray-400">Level {currentBattle.opponentHero!.level}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Health</span>
                  <span className="text-white">{currentBattle.opponentHealth}/{currentBattle.opponentHero!.stats.health}</span>
                </div>
                <Progress value={(currentBattle.opponentHealth / currentBattle.opponentHero!.stats.health) * 100} className="h-2" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (battlePhase === 'results' && currentBattle) {
    const isVictory = currentBattle.playerHealth > 0;
    
    return (
      <div className="space-y-6 text-center">
        <div className={`text-4xl font-bold ${isVictory ? 'text-green-500' : 'text-red-500'}`}>
          {isVictory ? '🎉 VICTORY!' : '💔 DEFEAT'}
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="font-bold text-white mb-4">Battle Results</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Experience Gained:</span>
              <span className="text-white">+{isVictory ? 100 : 25} XP</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Arena Coins:</span>
              <span className="text-yellow-500">+{isVictory ? 50 : 10} AC</span>
            </div>
          </div>
        </div>

        <Button 
          onClick={endBattle}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
        >
          Continue
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
      <Card className="bg-gray-800/50">
        <CardContent className="p-4 text-center">
          <Trophy className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
          <p className="text-2xl font-bold text-white">{playerStats.wins}</p>
          <p className="text-xs text-gray-400">Wins</p>
        </CardContent>
      </Card>
      
      <Card className="bg-gray-800/50">
        <CardContent className="p-4 text-center">
          <Shield className="w-6 h-6 mx-auto mb-2 text-gray-400" />
          <p className="text-2xl font-bold text-white">{playerStats.losses}</p>
          <p className="text-xs text-gray-400">Losses</p>
        </CardContent>
      </Card>
      
      <Card className="bg-gray-800/50">
        <CardContent className="p-4 text-center">
          <Coins className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
          <p className="text-2xl font-bold text-white">{playerStats.arenaCoins}</p>
          <p className="text-xs text-gray-400">Arena Coins</p>
        </CardContent>
      </Card>
      
      <Card className="bg-gray-800/50">
        <CardContent className="p-4 text-center">
          <Star className="w-6 h-6 mx-auto mb-2 text-purple-500" />
          <p className="text-2xl font-bold text-white">{playerStats.rank}</p>
          <p className="text-xs text-gray-400">Rank</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function GameArena() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Game Arena</h1>
        <p className="text-gray-400">Battle with your heroes and climb the ranks!</p>
      </div>

      <PlayerStats />

      <Tabs defaultValue="collection" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-800/50">
          <TabsTrigger value="collection" className="flex items-center gap-2">
            <Crown className="w-4 h-4" />
            Collection
          </TabsTrigger>
          <TabsTrigger value="battle" className="flex items-center gap-2">
            <Sword className="w-4 h-4" />
            Battle
          </TabsTrigger>
        </TabsList>

        <TabsContent value="collection" className="mt-6">
          <HeroCollection />
        </TabsContent>

        <TabsContent value="battle" className="mt-6">
          <BattleInterface />
        </TabsContent>
      </Tabs>
    </div>
  );
}