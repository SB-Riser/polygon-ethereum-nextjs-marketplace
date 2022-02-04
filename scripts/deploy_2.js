const hre = require("hardhat");
const fs = require('fs');

async function main() { 


  // const factory = await hre.ethers.getContractFactory("MockNFT");
  // const MockNFT = await factory.deploy();
  // await MockNFT.deployed();
  // console.log("nftMarket deployed to:", MockNFT.address);

  const factory2 = await hre.ethers.getContractFactory("AuctionNFT");
  const AuctionNFT = await factory2.deploy();
  await AuctionNFT.deployed();
  console.log("nft deployed to:", AuctionNFT.address); 

  // const factory3 = await hre.ethers.getContractFactory("MockNFT");
  // const MockNFT2 = await factory3.deploy();
  // await MockNFT2.deployed();
  // console.log("nftMarket deployed to:", MockNFT2.address);

  

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  }); 


/*
mocknft : 0xD0f8725362D9B429Da6D4e5C0d2056812d04529e
auction  to: 0x4eD5fF4BB69bC33d491A55BCfaAf7C42993E450d
mock: 0x92Cf6a68A3Fdc75E55001FeFa0006CBAa397eC4a 


nftMarket deployed to: 0x5C67a81c0290cadC1FbcE1Dcf834Ede51d2dA12B
nft deployed to: 0x4Ee680B8610d051b3C469aA68B4cDB8701B3eA68  


nftMarket deployed to: 0xD2166851dB262e9c66C443564350bFD247F983AD
nft deployed to: 0x853F52A7dcba2c67137047957c127F55B711F207


*/ 

/*
nftMarket deployed to: 0xCe86e7677949aE9786Fa5E6960B34038BaEE9869
nft deployed to: 0x27EEA72674040f48007914FB8f673B9Dc45E59bb
nftMarket deployed to: 0x037D64BBc3772650b29d56B6fE40e68e06B3d15E
*/