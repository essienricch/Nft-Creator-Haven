// Contract address - update after deployment
export const PLATFORM_CONTRACT_ADDRESS = process.env.REACT_APP_PLATFORM_CONTRACT_ADDRESS || '';

// Network configuration
export const LISK_SEPOLIA_CONFIG = {
  chainId: '0x106A',
  chainName: 'Lisk Sepolia',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://rpc.sepolia-api.lisk.com'],
  blockExplorerUrls: ['https://sepolia-blockscout.lisk.com'],
};

// Contract ABI - copy this from artifacts after compilation
export const PLATFORM_ABI = [
  // NFT Functions
  "function mintNFT(address to, string memory uri) public returns (uint256)",
  "function totalNFTSupply() public view returns (uint256)",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "function tokenURI(uint256 tokenId) public view returns (string memory)",
  "function getCreator(uint256 tokenId) public view returns (address)",
  "function getAllNFTsData() public view returns (uint256[] memory, address[] memory, address[] memory, string[] memory)",
  "function getNFTsByCreator(address creator) public view returns (uint256[] memory)",
  
  // Token Functions
  "function balanceOf(address account) public view returns (uint256)",
  "function transfer(address to, uint256 amount) public returns (bool)",
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) public returns (bool)",
  "function allowance(address owner, address spender) public view returns (uint256)",
  "function name() public view returns (string memory)",
  "function symbol() public view returns (string memory)",
  "function decimals() public view returns (uint8)",
  "function totalNFTSupply() public view returns (uint256)",
  
  // Platform-specific functions
  "function getCreatorStats(address creator) public view returns (uint256, uint256, uint256)",
  "function creatorNFTCount(address) public view returns (uint256)",
  "function totalRewardsEarned(address) public view returns (uint256)",
  "function CREATOR_REWARD() public view returns (uint256)",
  
  // Events
  "event NFTMinted(uint256 indexed tokenId, address indexed creator, address indexed owner, string tokenURI, uint256 rewardAmount)",
  "event CreatorRewarded(address indexed creator, uint256 amount, uint256 tokenId)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
];