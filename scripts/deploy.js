const hre = require("hardhat");
const fs = require('fs');

async function main() {
  // const NFTMarket = await hre.ethers.getContractFactory("NFTMarket");
  // const nftMarket = await NFTMarket.deploy();
  // await nftMarket.deployed();
  // console.log("nftMarket deployed to:", nftMarket.address);

  const NFT = await hre.ethers.getContractFactory("NFT");
  const nft = await NFT.deploy('0xd220121F114109740e6CE88610E1ff0B322111cb');
  await nft.deployed();
  console.log("nft deployed to:", nft.address);


}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
