// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTCreatorPlatform is ERC721, ERC721URIStorage, ERC20, Ownable {
    using Counters for Counters.Counter;
    
    // NFT Counter
    Counters.Counter private _tokenIdCounter;
    
    // Constants
    uint256 public constant CREATOR_REWARD = 100 * 10**18; // 100 tokens per NFT mint
    uint256 public constant MAX_SUPPLY = 1000000 * 10**18; // 1M tokens max supply
    
    // Mappings
    mapping(uint256 => address) public creators; // tokenId => creator address
    mapping(address => uint256) public creatorNFTCount; // creator => number of NFTs created
    mapping(address => uint256) public totalRewardsEarned; // creator => total rewards earned
    
    // Events
    event NFTMinted(
        uint256 indexed tokenId,
        address indexed creator,
        address indexed owner,
        string tokenURI,
        uint256 rewardAmount
    );
    
    event CreatorRewarded(
        address indexed creator,
        uint256 amount,
        uint256 tokenId
    );

    constructor() 
        ERC721("ArtNFT", "ANFT") 
        ERC20("CreatorToken", "CRT") 
    {
        _tokenIdCounter.increment(); // Start from token ID 1
    }

    // =============================================================================
    // NFT (ERC721) Functions
    // =============================================================================
    
    /**
     * @dev Mint NFT with metadata URI
     * @param to Address to mint NFT to
     * @param uri Metadata URI for the NFT
     */
    function mintNFT(address to, string memory uri) public returns (uint256) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        // Mint NFT
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        
        // Set creator
        creators[tokenId] = msg.sender;
        creatorNFTCount[msg.sender]++;
        
        // Reward creator with tokens
        _rewardCreator(msg.sender, CREATOR_REWARD, tokenId);
        
        emit NFTMinted(tokenId, msg.sender, to, uri, CREATOR_REWARD);
        
        return tokenId;
    }
    
    /**
     * @dev Get total number of NFTs minted
     */
   function totalNFTSupply() public view returns (uint256) {
    return _tokenIdCounter.current() - 1;
}

    /**
     * @dev Get creator of a specific NFT
     */
    function getCreator(uint256 tokenId) public view returns (address) {
        require(_exists(tokenId), "NFT does not exist");
        return creators[tokenId];
    }
    
    /**
     * @dev Get all NFTs created by a specific address
     */
    function getNFTsByCreator(address creator) public view returns (uint256[] memory) {
        uint256 totalNFTs = totalSupply();
        uint256 creatorNFTs = creatorNFTCount[creator];
        
        uint256[] memory result = new uint256[](creatorNFTs);
        uint256 currentIndex = 0;
        
        for (uint256 i = 1; i <= totalNFTs; i++) {
            if (creators[i] == creator) {
                result[currentIndex] = i;
                currentIndex++;
            }
        }
        
        return result;
    }

    // =============================================================================
    // Token (ERC20) Functions
    // =============================================================================
    
    /**
     * @dev Internal function to reward creator
     */
    function _rewardCreator(address creator, uint256 amount, uint256 tokenId) internal {
        require(ERC20.totalSupply() + amount <= MAX_SUPPLY, "Would exceed max token supply");
        
        _mint(creator, amount);
        totalRewardsEarned[creator] += amount;
        
        emit CreatorRewarded(creator, amount, tokenId);
    }
    
    /**
     * @dev Public function to reward creator (only owner can call)
     */
    function rewardCreator(address to, uint256 amount) public onlyOwner {
        require(ERC20.totalSupply() + amount <= MAX_SUPPLY, "Would exceed max token supply");
        _mint(to, amount);
        totalRewardsEarned[to] += amount;
    }

    // =============================================================================
    // View Functions for Frontend
    // =============================================================================
    
    /**
     * @dev Get comprehensive NFT data for gallery
     */
    function getAllNFTsData() public view returns (
        uint256[] memory tokenIds,
        address[] memory owners,
        address[] memory nftCreators,
        string[] memory tokenURIs
    ) {
        uint256 totalNFTs = totalSupply();
        
        tokenIds = new uint256[](totalNFTs);
        owners = new address[](totalNFTs);
        nftCreators = new address[](totalNFTs);
        tokenURIs = new string[](totalNFTs);
        
        for (uint256 i = 0; i < totalNFTs; i++) {
            uint256 tokenId = i + 1;
            tokenIds[i] = tokenId;
            owners[i] = ownerOf(tokenId);
            nftCreators[i] = creators[tokenId];
            tokenURIs[i] = tokenURI(tokenId);
        }
        
        return (tokenIds, owners, nftCreators, tokenURIs);
    }
    
    /**
     * @dev Get creator statistics
     */
    function getCreatorStats(address creator) public view returns (
        uint256 nftCount,
        uint256 totalRewards,
        uint256 tokenBalance
    ) {
        return (
            creatorNFTCount[creator],
            totalRewardsEarned[creator],
            balanceOf(creator)
        );
    }

   
    
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}