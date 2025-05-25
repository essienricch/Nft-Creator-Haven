const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying NFT Creator Platform...");

  // Get the ContractFactory and Signers
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy the contract
  const NFTCreatorPlatform = await ethers.getContractFactory("NFTCreatorPlatform");
  const platform = await NFTCreatorPlatform.deploy();

  await platform.deployed();

  console.log("NFTCreatorPlatform deployed to:", platform.address);
  console.log("Contract includes both ERC721 (ArtNFT) and ERC20 (CreatorToken)");
  
  // Save deployment info
  const deploymentInfo = {
    contractAddress: platform.address,
    deployer: deployer.address,
    network: "liskSepolia",
    timestamp: new Date().toISOString(),
  };
  
  console.log("Deployment Info:", deploymentInfo);
  
  // Optional: Verify contract on explorer
  console.log("\nTo verify on block explorer, run:");
  console.log(`npx hardhat verify --network liskSepolia ${platform.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });