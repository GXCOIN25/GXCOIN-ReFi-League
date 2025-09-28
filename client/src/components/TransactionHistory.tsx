import React, { useEffect, useState } from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  ExternalLink, 
  Repeat, 
  Send, 
  Coins,
  Star,
  ArrowUpRight,
  AlertCircle
} from 'lucide-react';
import { useWallet } from '../lib/stores/useWallet';

interface TransactionHistoryProps {
  onClose?: () => void;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ onClose }) => {
  const { transactions, getTransactionStatus, isTestnet, chainId } = useWallet();
  const [refreshing, setRefreshing] = useState<string[]>([]);
  
  // Auto-refresh pending transactions
  useEffect(() => {
    const pendingTxs = transactions.filter(tx => tx.status === 'pending');
    
    if (pendingTxs.length > 0) {
      const refreshInterval = setInterval(async () => {
        for (const tx of pendingTxs) {
          if (!refreshing.includes(tx.hash)) {
            try {
              setRefreshing(prev => [...prev, tx.hash]);
              await getTransactionStatus(tx.hash);
            } catch (error) {
              console.warn('Failed to refresh transaction:', error);
            } finally {
              setRefreshing(prev => prev.filter(h => h !== tx.hash));
            }
          }
        }
      }, 15000); // Refresh every 15 seconds
      
      return () => clearInterval(refreshInterval);
    }
  }, [transactions, getTransactionStatus, refreshing]);
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400 animate-pulse" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'eth':
        return <Send className="w-4 h-4 text-blue-400" />;
      case 'token':
        return <Coins className="w-4 h-4 text-purple-400" />;
      case 'nft':
        return <Star className="w-4 h-4 text-yellow-400" />;
      default:
        return <ArrowUpRight className="w-4 h-4 text-gray-400" />;
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'confirmed':
        return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'failed':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };
  
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };
  
  const getExplorerUrl = (hash: string) => {
    const baseUrl = isTestnet() ? 'sepolia.etherscan.io' : 'etherscan.io';
    return `https://${baseUrl}/tx/${hash}`;
  };
  
  const handleRefresh = async (hash: string) => {
    if (refreshing.includes(hash)) return;
    
    try {
      setRefreshing(prev => [...prev, hash]);
      await getTransactionStatus(hash);
    } catch (error) {
      console.warn('Failed to refresh transaction:', error);
    } finally {
      setRefreshing(prev => prev.filter(h => h !== hash));
    }
  };
  
  const groupedTransactions = transactions.reduce((groups, tx) => {
    const date = new Date(tx.timestamp).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(tx);
    return groups;
  }, {} as Record<string, typeof transactions>);
  
  if (transactions.length === 0) {
    return (
      <div className="bg-black/80 backdrop-blur-sm rounded-xl border border-gray-500/30 p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-white font-bold mb-2">No Transactions Yet</h3>
          <p className="text-gray-400 text-sm">Your transaction history will appear here</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-black/80 backdrop-blur-sm rounded-xl border border-purple-500/30 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold flex items-center">
          <Clock className="w-5 h-5 mr-2 text-purple-400" />
          Transaction History
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        )}
      </div>
      
      <div className="max-h-96 overflow-y-auto space-y-4">
        {Object.entries(groupedTransactions)
          .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
          .map(([date, txs]) => (
            <div key={date}>
              <div className="text-xs text-gray-500 font-medium mb-2 sticky top-0 bg-black/50 py-1">
                {date === new Date().toDateString() ? 'Today' : 
                 date === new Date(Date.now() - 86400000).toDateString() ? 'Yesterday' : 
                 new Date(date).toLocaleDateString()}
              </div>
              
              <div className="space-y-2">
                {txs.map((tx) => (
                  <div
                    key={tx.hash}
                    className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(tx.type)}
                          {getStatusIcon(tx.status)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">
                            {tx.description}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(tx.status)}`}>
                              {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatTime(tx.timestamp)}
                            </span>
                          </div>
                          
                          {tx.blockNumber && (
                            <div className="flex items-center space-x-1 mt-1">
                              <span className="text-xs text-gray-500">Block:</span>
                              <span className="text-xs text-gray-400 font-mono">
                                {tx.blockNumber}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-2">
                        {tx.status === 'pending' && (
                          <button
                            onClick={() => handleRefresh(tx.hash)}
                            disabled={refreshing.includes(tx.hash)}
                            className="p-1 text-gray-400 hover:text-white disabled:opacity-50"
                            title="Refresh status"
                          >
                            <Repeat className={`w-3 h-3 ${refreshing.includes(tx.hash) ? 'animate-spin' : ''}`} />
                          </button>
                        )}
                        
                        <button
                          onClick={() => window.open(getExplorerUrl(tx.hash), '_blank')}
                          className="p-1 text-gray-400 hover:text-white"
                          title="View on explorer"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-2 pt-2 border-t border-gray-700">
                      <p className="text-xs text-gray-500 font-mono break-all">
                        {tx.hash}
                      </p>
                    </div>
                    
                    {tx.gasUsed && (
                      <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                        <span>Gas Used:</span>
                        <span className="font-mono">{tx.gasUsed}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        }
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-700">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Network:</span>
          <span className="text-purple-400">
            {chainId === 11155111 ? 'Sepolia' : 
             chainId === 5 ? 'Goerli' : 
             chainId === 80001 ? 'Mumbai' : 
             chainId === 97 ? 'BSC Testnet' : 
             `Chain ${chainId}`}
          </span>
        </div>
      </div>
    </div>
  );
};