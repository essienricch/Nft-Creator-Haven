import React, { useState, useEffect, useCallback } from 'react';
import { useContract } from '../hooks/useContract';

const NFTGallery = () => {
  const { contract, getAllNFTs, isLoading } = useContract();
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nftMetadata, setNftMetadata] = useState({});

  useEffect(() => {
    if (!isLoading) {
      fetchNFTs();
    }
  }, [contract, isLoading, fetchNFTs]);

  const fetchNFTs = useCallback(async () => {
    try {
      setLoading(true);
      const nftList = await getAllNFTs();
      setNfts(nftList);
      
      // Fetch metadata for each NFT
      await fetchAllMetadata(nftList);
    } catch (error) {
      console.error('Error fetching NFTs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllMetadata = async (nftList) => {
    const metadataPromises = nftList.map(async (nft) => {
      try {
        const response = await fetch(nft.tokenURI);
        const metadata = await response.json();
        return { tokenId: nft.tokenId, metadata };
      } catch (error) {
        console.error(`Error fetching metadata for token ${nft.tokenId}:`, error);
        return { 
          tokenId: nft.tokenId, 
          metadata: { 
            name: `NFT #${nft.tokenId}`, 
            description: 'Metadata unavailable',
            image: '/placeholder-nft.png'
          }
        };
      }
    });

    const metadataResults = await Promise.all(metadataPromises);
    const metadataMap = {};
    metadataResults.forEach(({ tokenId, metadata }) => {
      metadataMap[tokenId] = metadata;
    });
    setNftMetadata(metadataMap);
  };

  if (isLoading || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-gray-600">Loading NFTs...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">NFT Gallery</h2>
        <button
          onClick={fetchNFTs}
          className="btn-primary text-sm"
        >
          Refresh Gallery
        </button>
      </div>
      
      {nfts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🎨</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No NFTs Yet</h3>
          <p className="text-gray-500">Be the first to create and mint an NFT!</p>
        </div>
      ) : (
        <>
          <div className="text-sm text-gray-600 mb-4">
            Showing {nfts.length} NFT{nfts.length !== 1 ? 's' : ''}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {nfts.map((nft) => {
              const metadata = nftMetadata[nft.tokenId] || {};
              
              return (
                <div key={nft.tokenId} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-w-1 aspect-h-1">
                    <img
                      src={metadata.image || '/placeholder-nft.png'}
                      alt={metadata.name || `NFT #${nft.tokenId}`}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.src = '/placeholder-nft.png';
                      }}
                    />
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2 truncate">
                      {metadata.name || `NFT #${nft.tokenId}`}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {metadata.description || 'No description available'}
                    </p>
                    
                    <div className="space-y-1 text-xs text-gray-500">
                      <div className="flex justify-between">
                        <span>Token ID:</span>
                        <span className="font-mono">#{nft.tokenId}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span>Creator:</span>
                        <span className="font-mono" title={nft.creator}>
                          {nft.creator.slice(0, 6)}...{nft.creator.slice(-4)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span>Owner:</span>
                        <span className="font-mono" title={nft.owner}>
                          {nft.owner.slice(0, 6)}...{nft.owner.slice(-4)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <a
                        href={`https://sepolia-blockscout.lisk.com/address/${nft.creator}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-600 hover:text-indigo-800"
                      >
                        View Creator on Explorer →
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default NFTGallery;