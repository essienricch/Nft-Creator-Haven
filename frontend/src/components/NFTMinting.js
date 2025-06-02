import React, { useState } from 'react';
import { useContract } from '../hooks/useContract';
import { useWallet } from '../hooks/useWallet';
import { uploadToIPFS, uploadMetadataToIPFS } from '../utils/ipfs';

const NFTMinting = () => {
  const { contract, mintNFT, getCreatorReward } = useContract();
  const { account } = useWallet();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: null
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [mintResult, setMintResult] = useState(null);
  const [creatorReward, setCreatorReward] = useState('0');

  React.useEffect(() => {
      const loadCreatorReward = async () => {
    try {
      const reward = await getCreatorReward();
      setCreatorReward(reward);
    } catch (error) {
      console.error('Error loading creator reward:', error);
    }
  };
    loadCreatorReward();
  }, [contract]);



  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.image) {
      alert('Please fill all fields and select an image');
      return;
    }

    if (!contract || !account) {
      alert('Please connect your wallet');
      return;
    }

    try {
      setIsUploading(true);
      
      // Upload image to IPFS
      console.log('Uploading image to IPFS...');
      const imageUrl = await uploadToIPFS(formData.image);
      
      // Create metadata
      const metadata = {
        name: formData.name,
        description: formData.description,
        image: imageUrl,
        attributes: [
          {
            trait_type: "Creator",
            value: account
          },
          {
            trait_type: "Created At",
            value: new Date().toISOString()
          }
        ]
      };
      
      // Upload metadata to IPFS
      console.log('Uploading metadata to IPFS...');
      const metadataUrl = await uploadMetadataToIPFS(metadata);
      
      setIsUploading(false);
      setIsMinting(true);
      
      // Mint NFT
      console.log('Minting NFT...');
      const result = await mintNFT(account, metadataUrl);
      
      setMintResult(result);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        image: null
      });
      
      // Reset file input
      const fileInput = document.getElementById('image-upload');
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      console.error('Error minting NFT:', error);
      alert(`Error minting NFT: ${error.message}`);
    } finally {
      setIsUploading(false);
      setIsMinting(false);
    }
  };

  const resetMintResult = () => {
    setMintResult(null);
  };

  if (mintResult) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="text-green-600 text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">NFT Minted Successfully!</h2>
          <div className="space-y-2 text-sm text-green-700">
            <p><strong>Token ID:</strong> #{mintResult.tokenId}</p>
            <p><strong>Creator Reward:</strong> {creatorReward} CRT tokens</p>
            <p className="break-all">
              <strong>Transaction:</strong> 
              <a 
                href={`https://sepolia-blockscout.lisk.com/tx/${mintResult.transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline ml-1"
              >
                {mintResult.transactionHash.slice(0, 10)}...
              </a>
            </p>
          </div>
          <button
            onClick={resetMintResult}
            className="mt-4 btn-primary"
          >
            Mint Another NFT
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New NFT</h2>
        
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Creator Reward:</strong> You'll earn {creatorReward} CRT tokens for each NFT you mint!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              NFT Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="input-field"
              placeholder="Enter NFT name"
              disabled={isUploading || isMinting}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="input-field"
              placeholder="Describe your NFT"
              disabled={isUploading || isMinting}
            />
          </div>

          <div>
            <label htmlFor="image-upload" className="block text-sm font-medium text-gray-700 mb-1">
              Image
            </label>
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              onChange={handleImageChange}
              className="input-field"
              disabled={isUploading || isMinting}
            />
            {formData.image && (
              <p className="text-sm text-gray-600 mt-1">
                Selected: {formData.image.name}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isUploading || isMinting || !contract}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading && 'Uploading to IPFS...'}
            {isMinting && 'Minting NFT...'}
            {!isUploading && !isMinting && 'Mint NFT'}
          </button>
        </form>

        {(isUploading || isMinting) && (
          <div className="mt-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="text-sm text-gray-600 mt-2">
              {isUploading ? 'Uploading files to IPFS...' : 'Confirming transaction...'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NFTMinting;