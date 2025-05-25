import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { PLATFORM_CONTRACT_ADDRESS, PLATFORM_ABI } from '../utils/constants';

export const useContract = () => {
  const [contract, setContract] = useState(null);
  const [signer, setSigner] = useState(null);
  const [provider, setProvider] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeContract();
  }, []);

  const initializeContract = async () => {
    if (!window.ethereum || !PLATFORM_CONTRACT_ADDRESS) {
      setIsLoading(false);
      return;
    }

    try {
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      const signerInstance = web3Provider.getSigner();
      
      setProvider(web3Provider);
      setSigner(signerInstance);

      const contractInstance = new ethers.Contract(
        PLATFORM_CONTRACT_ADDRESS,
        PLATFORM_ABI,
        signerInstance
      );

      setContract(contractInstance);
    } catch (error) {
      console.error('Error initializing contract:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Contract interaction functions
  const mintNFT = async (to, tokenURI) => {
    if (!contract) throw new Error('Contract not initialized');
    
    try {
      const tx = await contract.mintNFT(to, tokenURI);
      const receipt = await tx.wait();
      
      // Get the minted token ID from events
      const mintEvent = receipt.events?.find(e => e.event === 'NFTMinted');
      const tokenId = mintEvent?.args?.tokenId;
      
      return { tokenId: tokenId?.toString(), transactionHash: receipt.transactionHash };
    } catch (error) {
      console.error('Error minting NFT:', error);
      throw error;
    }
  };

  const getAllNFTs = async () => {
    if (!contract) return [];
    
    try {
      const [tokenIds, owners, creators, tokenURIs] = await contract.getAllNFTsData();
      
      const nfts = [];
      for (let i = 0; i < tokenIds.length; i++) {
        nfts.push({
          tokenId: tokenIds[i].toString(),
          owner: owners[i],
          creator: creators[i],
          tokenURI: tokenURIs[i]
        });
      }
      
      return nfts;
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      return [];
    }
  };

  const getTokenBalance = async (address) => {
    if (!contract) return '0';
    
    try {
      const balance = await contract.balanceOf(address);
      return ethers.utils.formatEther(balance);
    } catch (error) {
      console.error('Error fetching token balance:', error);
      return '0';
    }
  };

  const getCreatorStats = async (address) => {
    if (!contract) return { nftCount: 0, totalRewards: '0', tokenBalance: '0' };
    
    try {
      const [nftCount, totalRewards, tokenBalance] = await contract.getCreatorStats(address);
      
      return {
        nftCount: nftCount.toString(),
        totalRewards: ethers.utils.formatEther(totalRewards),
        tokenBalance: ethers.utils.formatEther(tokenBalance)
      };
    } catch (error) {
      console.error('Error fetching creator stats:', error);
      return { nftCount: 0, totalRewards: '0', tokenBalance: '0' };
    }
  };

  const getCreatorReward = async () => {
    if (!contract) return '0';
    
    try {
      const reward = await contract.CREATOR_REWARD();
      return ethers.utils.formatEther(reward);
    } catch (error) {
      console.error('Error fetching creator reward:', error);
      return '0';
    }
  };

  return {
    contract,
    signer,
    provider,
    isLoading,
    // Contract functions
    mintNFT,
    getAllNFTs,
    getTokenBalance,
    getCreatorStats,
    getCreatorReward
  };
};