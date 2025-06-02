import React, { useState, useEffect, useCallback } from 'react';
import { useContract } from '../hooks/useContract';

const WalletConnection = ({ account, isConnected, onConnect, onDisconnect }) => {
  const { getTokenBalance } = useContract();
  const [tokenBalance, setTokenBalance] = useState('0');
  const [ethBalance, setEthBalance] = useState('0');

  const fetchBalances = useCallback(async () => {
    try {
      // Get CRT token balance
      const crtBalance = await getTokenBalance(account);
      setTokenBalance(crtBalance);

      // Get ETH balance
      if (window.ethereum) {
        const balance = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [account, 'latest']
        });
        const ethBal = parseInt(balance, 16) / Math.pow(10, 18);
        setEthBalance(ethBal.toFixed(4));
      }
    } catch (error) {
      console.error('Error fetching balances:', error);
    }
  }, [account])
  useEffect(() => {
    if (isConnected && account) {
      fetchBalances();
    }
  }, [isConnected, account, fetchBalances]);

  

  if (!isConnected) {
    return (
      <button
        onClick={onConnect}
        className="btn-primary flex items-center space-x-2"
      >
        <span>🔗</span>
        <span>Connect Wallet</span>
      </button>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      {/* Balance Display */}
      <div className="hidden md:flex items-center space-x-3 text-sm">
        <div className="bg-white rounded-lg px-3 py-2 shadow-sm border">
          <span className="text-gray-600">CRT:</span>
          <span className="font-semibold ml-1">{parseFloat(tokenBalance).toLocaleString()}</span>
        </div>
        <div className="bg-white rounded-lg px-3 py-2 shadow-sm border">
          <span className="text-gray-600">ETH:</span>
          <span className="font-semibold ml-1">{ethBalance}</span>
        </div>
      </div>

      {/* Account Display */}
      <div className="flex items-center space-x-2 bg-white rounded-lg px-3 py-2 shadow-sm border">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="font-mono text-sm">
          {account.slice(0, 6)}...{account.slice(-4)}
        </span>
      </div>

      {/* Disconnect Button */}
      <button
        onClick={onDisconnect}
        className="text-gray-500 hover:text-gray-700 p-2"
        title="Disconnect Wallet"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>
    </div>
  );
};

export default WalletConnection;