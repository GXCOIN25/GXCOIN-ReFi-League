import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, Zap, Droplet, Leaf, Cpu, DollarSign } from 'lucide-react';

interface TokenData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  icon: React.ReactNode;
  color: string;
}

interface TokenBalance {
  symbol: string;
  balance: number;
  value: number;
}

export const TokenIntegration: React.FC = () => {
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    // Simulate real token data
    const initializeTokens = () => {
      setTokens([
        {
          symbol: 'AQUA',
          name: 'Aqua Ocean Token',
          price: 0.45,
          change24h: 5.67,
          marketCap: 12500000,
          volume24h: 890000,
          icon: <Droplet className="w-5 h-5" />,
          color: 'text-blue-400'
        },
        {
          symbol: 'HEMP',
          name: 'Hemp Earth Token',
          price: 0.32,
          change24h: -2.14,
          marketCap: 8900000,
          volume24h: 560000,
          icon: <Leaf className="w-5 h-5" />,
          color: 'text-green-400'
        },
        {
          symbol: 'VOLTRA',
          name: 'Voltra Energy Token',
          price: 0.67,
          change24h: 8.91,
          marketCap: 18750000,
          volume24h: 1200000,
          icon: <Zap className="w-5 h-5" />,
          color: 'text-yellow-400'
        },
        {
          symbol: 'GRAPHENE',
          name: 'Graphene Tech Token',
          price: 1.23,
          change24h: 12.45,
          marketCap: 25600000,
          volume24h: 1800000,
          icon: <Cpu className="w-5 h-5" />,
          color: 'text-purple-400'
        },
        {
          symbol: 'TRADER',
          name: 'Trader Market Token',
          price: 2.14,
          change24h: -4.67,
          marketCap: 34200000,
          volume24h: 2100000,
          icon: <DollarSign className="w-5 h-5" />,
          color: 'text-orange-400'
        }
      ]);

      setBalances([
        { symbol: 'AQUA', balance: 150.25, value: 67.61 },
        { symbol: 'HEMP', balance: 89.50, value: 28.64 },
        { symbol: 'VOLTRA', balance: 45.75, value: 30.65 },
        { symbol: 'GRAPHENE', balance: 23.10, value: 28.41 },
        { symbol: 'TRADER', balance: 12.80, value: 27.39 }
      ]);

      setIsLoading(false);
      setLastUpdate(new Date());
    };

    // Initialize with delay
    setTimeout(initializeTokens, 1000);

    // Update prices every 10 seconds
    const interval = setInterval(() => {
      setTokens(prev => prev.map(token => ({
        ...token,
        price: token.price * (1 + (Math.random() - 0.5) * 0.02), // ±1% random change
        change24h: token.change24h + (Math.random() - 0.5) * 0.5
      })));
      setLastUpdate(new Date());
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => `$${price.toFixed(4)}`;
  const formatMarketCap = (cap: number) => `$${(cap / 1000000).toFixed(1)}M`;
  const formatVolume = (vol: number) => `$${(vol / 1000).toFixed(0)}K`;
  const formatChange = (change: number) => `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;

  const totalPortfolioValue = balances.reduce((sum, balance) => sum + balance.value, 0);

  const refreshPrices = () => {
    setIsLoading(true);
    setTimeout(() => {
      setTokens(prev => prev.map(token => ({
        ...token,
        price: token.price * (1 + (Math.random() - 0.5) * 0.05), // ±2.5% change
        change24h: (Math.random() - 0.5) * 20 // Random change between -10% and +10%
      })));
      setIsLoading(false);
      setLastUpdate(new Date());
    }, 1500);
  };

  if (isLoading) {
    return (
      <div className="bg-black/80 backdrop-blur-sm rounded-xl border border-green-500/30 p-6">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-green-300">Loading token data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <div className="bg-black/80 backdrop-blur-sm rounded-xl border border-purple-500/30 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold text-lg">Token Portfolio</h3>
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 px-3 py-1 rounded-lg text-xs font-medium">
              📊 DEMO DATA
            </div>
            <button
              onClick={refreshPrices}
              className="p-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 text-purple-300 rounded-lg transition-all duration-200"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/20">
            <p className="text-2xl font-bold text-white">${totalPortfolioValue.toFixed(2)}</p>
            <p className="text-purple-300 text-sm">Total Portfolio Value</p>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
            <p className="text-2xl font-bold text-white">{balances.length}</p>
            <p className="text-green-300 text-sm">Active Tokens</p>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/20">
            <p className="text-2xl font-bold text-white">+12.4%</p>
            <p className="text-blue-300 text-sm">24h Portfolio Change</p>
          </div>
        </div>

        {/* Token List */}
        <div className="space-y-3">
          {tokens.map((token) => {
            const balance = balances.find(b => b.symbol === token.symbol);
            const isPositive = token.change24h >= 0;

            return (
              <div key={token.symbol} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg bg-gray-800 ${token.color}`}>
                      {token.icon}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-white font-semibold">{token.symbol}</h4>
                        <span className="text-gray-400 text-sm">{token.name}</span>
                      </div>
                      {balance && (
                        <p className="text-gray-400 text-sm">{balance.balance.toFixed(2)} tokens</p>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-bold">{formatPrice(token.price)}</span>
                      <div className={`flex items-center space-x-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        <span className="text-sm font-medium">{formatChange(token.change24h)}</span>
                      </div>
                    </div>
                    {balance && (
                      <p className="text-gray-400 text-sm">${balance.value.toFixed(2)} value</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-700">
                  <div>
                    <p className="text-gray-400 text-xs">Market Cap</p>
                    <p className="text-white text-sm font-medium">{formatMarketCap(token.marketCap)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">24h Volume</p>
                    <p className="text-white text-sm font-medium">{formatVolume(token.volume24h)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-gray-500 text-xs mt-4 text-center">
          Last updated: {lastUpdate.toLocaleTimeString()} (Demo data - not real market prices)
        </p>
      </div>

      {/* Trading Interface Preview */}
      <div className="bg-black/80 backdrop-blur-sm rounded-xl border border-blue-500/30 p-6">
        <h3 className="text-white font-bold text-lg mb-4">Token Trading</h3>
        
        <div className="text-center py-8">
          <DollarSign className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h4 className="text-white font-bold text-xl mb-2">Trading Coming Soon!</h4>
          <p className="text-gray-400 mb-6">Exchange tokens, provide liquidity, and earn rewards</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
              <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <h5 className="text-white font-semibold mb-1">Token Swaps</h5>
              <p className="text-gray-400 text-sm">Trade between different eco-tokens</p>
            </div>
            
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
              <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <h5 className="text-white font-semibold mb-1">Yield Farming</h5>
              <p className="text-gray-400 text-sm">Earn rewards by providing liquidity</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};