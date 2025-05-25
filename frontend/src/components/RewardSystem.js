import React, { useState, useEffect } from 'react';
import { useContract } from '../hooks/useContract';
import { useWallet } from '../hooks/useWallet';

const RewardSystem = () => {
  const { contract, getCreatorStats, getTokenBalance } = useContract();
  const { account } = useWallet();
  const [stats, setStats] = useState({
    nftCount: '0',
    totalRewards: '0',
    tokenBalance: '0'
  });
  const [loading, setLoading] = useState(true);
  const [mintHistory, setMintHistory] = useState([]);

  useEffect(() => {
    if (contract && account) {
      fetchStats();
      fetchMintHistory();
    }
  }, [contract, account]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const creatorStats = await getCreatorStats(account);
      setStats(creatorStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMintHistory = async () => {
    if (!contract) return;

    try {
      // Listen to NFTMinted events for this creator
      const filter = contract.filters.NFTMinted(null, account);
      const events = await contract.queryFilter(filter, 0, 'latest');
      
      const history = events.map(event => ({
        tokenId: event.args.tokenId.toString(),
        creator: event.args.creator,
        owner: event.args.owner,
        rewardAmount: event.args.rewardAmount.toString(),
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash
      }));

      setMintHistory(history.reverse()); // Most recent first
    } catch (error) {
      console.error('Error fetching mint history:', error);
    }
  };

  const formatTokenAmount = (amount) => {
    const num = parseFloat(amount);
    return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-gray-600">Loading rewards...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Creator Rewards</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-center">
            <div className="text-blue-600 text-3xl mr-4">🎨</div>
            <div>
              <p className="text-sm font-medium text-blue-600">NFTs Created</p>
              <p className="text-2xl font-bold text-blue-900">{stats.nftCount}</p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-center">
            <div className="text-green-600 text-3xl mr-4">🏆</div>
            <div>
              <p className="text-sm font-medium text-green-600">Total Rewards Earned</p>
              <p className="text-2xl font-bold text-green-900">
                {formatTokenAmount(stats.totalRewards)} <span className="text-sm">CRT</span>
              </p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <div className="flex items-center">
            <div className="text-purple-600 text-3xl mr-4">💰</div>
            <div>
              <p className="text-sm font-medium text-purple-600">Current Token Balance</p>
              <p className="text-2xl font-bold text-purple-900">
                {formatTokenAmount(stats.tokenBalance)} <span className="text-sm">CRT</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mint History */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Mint History</h3>
          <button
            onClick={() => {
              fetchStats();
              fetchMintHistory();
            }}
            className="text-sm btn-primary"
          >
            Refresh
          </button>
        </div>

        {mintHistory.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-3">📜</div>
            <p className="text-gray-500">No NFTs minted yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Your mint history will appear here once you create NFTs
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Token ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reward Earned
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mintHistory.map((mint, index) => (
                  <tr key={`${mint.tokenId}-${index}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{mint.tokenId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-mono">
                        {mint.owner.slice(0, 8)}...{mint.owner.slice(-6)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        +{formatTokenAmount(mint.rewardAmount)} CRT
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <a
                        href={`https://sepolia-blockscout.lisk.com/tx/${mint.transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-900 font-mono"
                      >
                        {mint.transactionHash.slice(0, 10)}...
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Token Info */}
      <div className="card bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">About Creator Tokens (CRT)</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>• Creator Tokens are earned automatically when you mint NFTs</p>
          <p>• Each NFT mint rewards you with 100 CRT tokens</p>
          <p>• Tokens follow the ERC20 standard and can be transferred</p>
          <p>• Use your tokens within the haven ecosystem</p>
        </div>
      </div>
    </div>
  );
};

export default RewardSystem;