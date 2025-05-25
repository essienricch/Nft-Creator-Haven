const path = require('path');

require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

module.exports = {
  solidity: "0.8.19",
  networks: {
    liskSepolia: {
      url: "https://rpc.sepolia-api.lisk.com",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 4202,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./frontend/src/artifacts",
  },
   resolve: {
    alias: {
      "@openzeppelin": path.resolve(__dirname, "./node_modules/@openzeppelin")
    }
  }
};