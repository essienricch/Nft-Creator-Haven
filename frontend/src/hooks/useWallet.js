import { useState, useEffect } from 'react';

export const useWallet = () => {
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    checkConnection();
    
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', () => window.location.reload());
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  const checkConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_accounts' 
        });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      }
    }
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
      setIsConnected(true);
    } else {
      setAccount(null);
      setIsConnected(false);
    }
  };

  const connect = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask!');
      return;
    }

    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      // Switch to Lisk Sepolia
      await switchToLiskSepolia();
      
      setAccount(accounts[0]);
      setIsConnected(true);
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const switchToLiskSepolia = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x106A' }], // Lisk Sepolia chainId
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        // Chain not added, add it
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x106A',
            chainName: 'Lisk Sepolia',
            nativeCurrency: {
              name: 'ETH',
              symbol: 'ETH',
              decimals: 18,
            },
            rpcUrls: ['https://rpc.sepolia-api.lisk.com'],
            blockExplorerUrls: ['https://sepolia-blockscout.lisk.com'],
          }],
        });
      }
    }
  };

  const disconnect = () => {
    setAccount(null);
    setIsConnected(false);
  };

  return {
    account,
    isConnected,
    connect,
    disconnect
  };
};