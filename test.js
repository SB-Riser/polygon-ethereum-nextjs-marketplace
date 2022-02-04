const { ethers } = require('hardhat');

// const ERC721 = require('./artifacts/contracts/Market.sol/NFTMarket.json'); 
// const provider =  new ethers.providers.JsonRpcProvider('https://rpc-mumbai.maticvigil.com')

// async function listTokensOfOwner(tokenAddress, account) {
//   const token = await ethers.getContractAt(
//     ERC721.abi,
//     tokenAddress,
//     provider,
//   );

//   const sentLogs = await token.queryFilter(
//     token.filters.Transfer(account, null),
//   );
//   const receivedLogs = await token.queryFilter(
//     token.filters.Transfer(null, account),
//   );

//   const logs = sentLogs.concat(receivedLogs)
//     .sort(
//       (a, b) =>
//         a.blockNumber - b.blockNumber ||
//         a.transactionIndex - b.transactionIndex,
//     );

//   const owned = new Set();

//   for (const { args: { from, to, tokenId } } of logs) {
//     if (addressEqual(to, account)) {
//       owned.add(tokenId.toString());
//     } else if (addressEqual(from, account)) {
//       owned.delete(tokenId.toString());
//     }
//   }

//   return owned;
// };

// function addressEqual(a, b) {
//   return a.toLowerCase() === b.toLowerCase();
// }



async function test ( ) {
//  console.error(await getTokenName(token), 'tokens owned by', account);
  let aprice = ethers.utils.parseUnits('10000000000000000', 'ether')
  console.log( aprice);
} 

test()