import React, { useState } from 'react';
import { Send, Plus, History, Settings, Shield, Zap, Coins, ArrowLeftRight } from 'lucide-react';
import { useWallet } from '../lib/stores/useWallet';
import { TransactionHistory } from './TransactionHistory';
import { TokenSymbol, getTokenInfo } from '../contracts/ERC20';

export const WalletFeatures: React.FC = () => {
  const { 
    isConnected, 
    address, 
    balance, 
    tokenBalances,
    tokenManager,
    sendTransaction, 
    sendTokenTransaction,
    transactions,
    isTestnet
  } = useWallet();
  const [showSend, setShowSend] = useState(false);
  const [showTokenSend, setShowTokenSend] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [sendTo, setSendTo] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState<TokenSymbol>('GXCOIN');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');

  const handleSend = async () => {
    if (!sendTo || !sendAmount) {
      setSendError('Please fill in all fields');
      return;
    }

    if (!isTestnet()) {
      setSendError('Please switch to a testnet to send demo transactions');
      return;
    }

    setSending(true);
    setSendError('');

    try {
      const txHash = await sendTransaction(sendTo, sendAmount);
      console.log('ETH transaction sent:', txHash);
      setSendTo('');
      setSendAmount('');
      setShowSend(false);
    } catch (error) {
      setSendError(error instanceof Error ? error.message : 'Transaction failed');
    } finally {
      setSending(false);
    }
  };

  const handleTokenSend = async () => {
    if (!sendTo || !sendAmount) {
      setSendError('Please fill in all fields');
      return;
    }

    if (!isTestnet()) {
      setSendError('Please switch to a testnet to send demo transactions');
      return;
    }

    setSending(true);
    setSendError('');

    try {
      const txHash = await sendTokenTransaction(selectedToken, sendTo, sendAmount);
      console.log('Token transaction sent:', txHash);
      setSendTo('');
      setSendAmount('');
      setShowTokenSend(false);
    } catch (error) {
      setSendError(error instanceof Error ? error.message : 'Token transaction failed');
    } finally {
      setSending(false);
    }
  };
  
  const availableTokens: TokenSymbol[] = ['GXCOIN', 'WTR', 'HEMP', 'GPWR', 'BATT', 'GCCT'];
  
  const getTokenBalance = (token: TokenSymbol): string => {
    return tokenBalances[token] || '0.0000';
  };

  if (!isConnected) {
    return (
      <div className="bg-black/80 backdrop-blur-sm rounded-xl border border-gray-500/30 p-6 text-center">
        <div className="text-gray-400 mb-4">
          <Shield className="w-12 h-12 mx-auto mb-2" />
          <p>Connect your wallet to access advanced features</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Quick Actions */}
      <div className="bg-black/80 backdrop-blur-sm rounded-xl border border-purple-500/30 p-4">
        <h3 className="text-white font-bold mb-4 flex items-center">
          <Zap className="w-5 h-5 mr-2 text-purple-400" />
          Quick Actions
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setShowSend(!showSend)}
            className="flex items-center justify-center space-x-2 p-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/50 text-blue-300 rounded-lg transition-all duration-200"
          >
            <Send className="w-4 h-4" />
            <span>Send ETH</span>
          </button>
          
          <button
            onClick={() => setShowTokenSend(!showTokenSend)}
            className="flex items-center justify-center space-x-2 p-3 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 text-purple-300 rounded-lg transition-all duration-200"
          >
            <Coins className="w-4 h-4" />
            <span>Send Tokens</span>
          </button>
          
          <button
            className="flex items-center justify-center space-x-2 p-3 bg-green-600/20 hover:bg-green-600/30 border border-green-500/50 text-green-300 rounded-lg transition-all duration-200"
            disabled
          >
            <Plus className="w-4 h-4" />
            <span>Buy ETH</span>
          </button>
          
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center justify-center space-x-2 p-3 bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/50 text-orange-300 rounded-lg transition-all duration-200"
          >
            <History className="w-4 h-4" />
            <span>History</span>
            {transactions.filter(tx => tx.status === 'pending').length > 0 && (
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            )}
          </button>
          
          <button
            className="flex items-center justify-center space-x-2 p-3 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 text-purple-300 rounded-lg transition-all duration-200"
            disabled
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>
      </div>
      
      {/* Token Balances */}
      {tokenManager && (
        <div className="bg-black/80 backdrop-blur-sm rounded-xl border border-green-500/30 p-4">
          <h3 className="text-white font-bold mb-3 flex items-center">
            <Coins className="w-5 h-5 mr-2 text-green-400" />
            Token Balances
          </h3>
          
          <div className="grid grid-cols-2 gap-2">
            {availableTokens.map(token => {
              const tokenInfo = getTokenInfo(token);
              const balance = getTokenBalance(token);
              const hasBalance = parseFloat(balance) > 0;
              
              return (
                <div 
                  key={token}
                  className={`p-3 rounded-lg border ${
                    hasBalance 
                      ? 'bg-green-500/10 border-green-500/30' 
                      : 'bg-gray-500/10 border-gray-500/30'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-lg">{tokenInfo.icon}</span>
                    <span className={`font-bold text-sm ${
                      hasBalance ? 'text-green-300' : 'text-gray-400'
                    }`}>
                      {token}
                    </span>
                  </div>
                  <p className={`text-xs font-mono ${
                    hasBalance ? 'text-white' : 'text-gray-500'
                  }`}>
                    {parseFloat(balance).toFixed(4)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Transaction History */}
      {showHistory && (
        <TransactionHistory onClose={() => setShowHistory(false)} />
      )}

      {/* Send ETH Form */}
      {showSend && (
        <div className="bg-black/80 backdrop-blur-sm rounded-xl border border-blue-500/30 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold">Send ETH</h3>
            <button
              onClick={() => setShowSend(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4">
            <div className={`${isTestnet() ? 'bg-green-500/10 border-green-500/50' : 'bg-red-500/10 border-red-500/50'} rounded-lg p-3`}>
              <p className={`text-sm ${isTestnet() ? 'text-green-300' : 'text-red-300'}`}>
                {isTestnet() 
                  ? '✓ TESTNET: Ready to send demo transactions'
                  : '⚠️ Please switch to testnet for demo transactions'
                }
              </p>
            </div>
            
            <div>
              <label className="block text-gray-400 text-sm mb-2">To Address</label>
              <input
                type="text"
                value={sendTo}
                onChange={(e) => setSendTo(e.target.value)}
                placeholder="0x..."
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            
            <div>
              <label className="block text-gray-400 text-sm mb-2">Amount (ETH)</label>
              <input
                type="number"
                value={sendAmount}
                onChange={(e) => setSendAmount(e.target.value)}
                placeholder="0.001"
                step="0.001"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              />
              <p className="text-gray-500 text-xs mt-1">
                Available: {balance} ETH
              </p>
            </div>
            
            {sendError && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-3 rounded-lg text-sm">
                {sendError}
              </div>
            )}
            
            <button
              onClick={handleSend}
              disabled={sending || !sendTo || !sendAmount || !isTestnet()}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 font-medium"
            >
              {sending ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Sending...</span>
                </div>
              ) : (
                'Send ETH Transaction'
              )}
            </button>
          </div>
        </div>
      )}
      
      {/* Send Token Form */}
      {showTokenSend && (
        <div className="bg-black/80 backdrop-blur-sm rounded-xl border border-purple-500/30 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold">Send Tokens</h3>
            <button
              onClick={() => setShowTokenSend(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4">
            <div className={`${isTestnet() ? 'bg-green-500/10 border-green-500/50' : 'bg-red-500/10 border-red-500/50'} rounded-lg p-3`}>
              <p className={`text-sm ${isTestnet() ? 'text-green-300' : 'text-red-300'}`}>
                {isTestnet() 
                  ? '✓ TESTNET: Ready to send demo tokens'
                  : '⚠️ Please switch to testnet for demo transactions'
                }
              </p>
            </div>
            
            <div>
              <label className="block text-gray-400 text-sm mb-2">Token</label>
              <select
                value={selectedToken}
                onChange={(e) => setSelectedToken(e.target.value as TokenSymbol)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              >
                {availableTokens.map(token => {
                  const tokenInfo = getTokenInfo(token);
                  const balance = getTokenBalance(token);
                  return (
                    <option key={token} value={token}>
                      {tokenInfo.icon} {token} (Balance: {parseFloat(balance).toFixed(4)})
                    </option>
                  );
                })}
              </select>
            </div>
            
            <div>
              <label className="block text-gray-400 text-sm mb-2">To Address</label>
              <input
                type="text"
                value={sendTo}
                onChange={(e) => setSendTo(e.target.value)}
                placeholder="0x..."
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            
            <div>
              <label className="block text-gray-400 text-sm mb-2">Amount</label>
              <input
                type="number"
                value={sendAmount}
                onChange={(e) => setSendAmount(e.target.value)}
                placeholder="0.0"
                step="0.0001"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              />
              <p className="text-gray-500 text-xs mt-1">
                Available: {getTokenBalance(selectedToken)} {selectedToken}
              </p>
            </div>
            
            {sendError && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-3 rounded-lg text-sm">
                {sendError}
              </div>
            )}
            
            <button
              onClick={handleTokenSend}
              disabled={sending || !sendTo || !sendAmount || !isTestnet()}
              className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 font-medium"
            >
              {sending ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Sending...</span>
                </div>
              ) : (
                `Send ${selectedToken} Tokens`
              )}
            </button>
          </div>
        </div>
      )}

      {/* Network Info */}
      <div className="bg-black/80 backdrop-blur-sm rounded-xl border border-green-500/30 p-4">
        <h3 className="text-white font-bold mb-3">Network Information</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Network:</span>
            <span className={`${isTestnet() ? 'text-green-400' : 'text-red-400'}`}>
              {isTestnet() ? 'Testnet' : 'Mainnet'} {isTestnet() ? '✓' : '⚠️'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Status:</span>
            <span className="text-green-400">Connected</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Address:</span>
            <span className="text-white font-mono text-xs">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Transactions:</span>
            <span className="text-purple-400">
              {transactions.length} total
              {transactions.filter(tx => tx.status === 'pending').length > 0 && (
                <span className="text-yellow-400 ml-1">
                  ({transactions.filter(tx => tx.status === 'pending').length} pending)
                </span>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};