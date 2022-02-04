require("@nomiclabs/hardhat-waffle"); 
require("@nomiclabs/hardhat-etherscan");
const fs = require('fs');
// const privateKey = fs.readFileSync(".secret").toString().trim() || "01234567890123456789";
// const infuraId = fs.readFileSync(".infuraid").toString().trim() || "";

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {

    }, 

    ropsten: {
      url: 'https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
      accounts: ['582f850ba49b3ccca27004b03f2d3abf3bfd6b5b2720f54b6174c642ae33f9af']
   }, 
    
    mumbai: {
      // Infura
      // url: `https://polygon-mumbai.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161` , 
      url: "https://rpc-mumbai.maticvigil.com",
      accounts: ['582f850ba49b3ccca27004b03f2d3abf3bfd6b5b2720f54b6174c642ae33f9af']
    }, 
    /*
    matic: {
      // Infura
      // url: `https://polygon-mainnet.infura.io/v3/${infuraId}`,
      url: "https://rpc-mainnet.maticvigil.com",
      accounts: [privateKey]`
    }
    */
  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  } , 
   etherscan: {
      // Your API key for Etherscan
      // Obtain one at https://etherscan.io/
      apiKey: 'QHPUUV9989C494UVPN3K9Y78YEC9E37APN' //TTDTBAJ5GC55DRX9GRVQ2D56A5GCFBD5JR //QHPUUV9989C494UVPN3K9Y78YEC9E37APN
    } 
}; 

//7000 000000000 
//1000000 000000000 u

