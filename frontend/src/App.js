import React, { useState} from 'react';
import Layout from './components/Layout';
import WalletConnection from './components/WalletConnection';
import NFTMinting from './components/NFTMinting';
import NFTGallery from './components/NFTGallery';
import RewardSystem from './components/RewardSystem';
import { useWallet } from './hooks/useWallet';
import './styles/globals.css';

function App() {
  const { account, isConnected, connect, disconnect } = useWallet();
  const [activeTab, setActiveTab] = useState('gallery');

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            NFT Creator Haven
          </h1>
          <WalletConnection 
            account={account}
            isConnected={isConnected}
            onConnect={connect}
            onDisconnect={disconnect}
          />
        </div>

        {!isConnected ? (
          <div className="text-center py-12">
            <h2 className="text-xl text-gray-600 mb-4">
              Connect your wallet to start creating and collecting NFTs
            </h2>
          </div>
        ) : (
          <>
            {/* Navigation Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                {['gallery', 'mint', 'rewards'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                      activeTab === tab
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab === 'mint' ? 'Create NFT' : tab}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="pb-12">
              {activeTab === 'gallery' && <NFTGallery />}
              {activeTab === 'mint' && <NFTMinting />}
              {activeTab === 'rewards' && <RewardSystem />}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

export default App;