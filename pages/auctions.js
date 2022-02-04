import Web3Modal from "web3modal"  
import { useEffect, useState } from 'react' 
import { ethers } from 'ethers' 
import axios from 'axios'

import {
    nftaddress, nftmarketaddress , auction 
  } from '../config'
  
  import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
  import Market from '../artifacts/contracts/Market.sol/NFTMarket.json' 
  import Auction from '../artifacts/contracts/AuctionNFT.sol/AuctionNFT.json'

  import { ApolloClient, InMemoryCache, gql } from '@apollo/client'; 

export default function Auctions() {   

    const [auctionNFTs, setAuctionNFTs] = useState([])
    const [loadingState, setLoadingState] = useState('not-loaded')

    useEffect(() => {
        loadAuctions()
      }, []) 


      async function loadAuctions() {     

        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)       
        const signer = provider.getSigner() 
        let contract = new ethers.Contract(auction, Auction.abi, signer) 
        const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)   

        const client = new ApolloClient({
            uri: 'https://api.thegraph.com/subgraphs/name/siddharth2207/auctiongraph',
            cache: new InMemoryCache()
            }); 

            let { data } = await client.query({
                query: gql`
                  query  {
                    auctions(where:{ settled: false })  {
                        id
                        _tokenAddress
                        _tokenId
                        settled
                    }
                  }
                `
              });  

              
              data = await Promise.all(data.auctions.map(async i => {  

                    let tokenUri = await tokenContract.tokenURI(i._tokenId)
                    let meta = await axios.get(tokenUri)
                    console.log(meta)
                    let result =  await contract.getAuction(i._tokenAddress , i._tokenId)  
                    let obj = { 
                        _tokenAddress : i._tokenAddress , 
                        _tokenId : i._tokenId,
                        nftSeller  : result[0],
                        highestBidder :  result[1],
                        minBid :   ethers.utils.formatEther(result[2]),
                        highestBid :   ethers.utils.formatEther(result[3]),
                        auctionEnd : result[4].toNumber() ,  
                        name : meta.data.name , 
                        description : meta.data.description , 
                        image : meta.data.image
                    }

                    return obj


              })) 

              setAuctionNFTs(data) 
              setLoadingState('loaded') 

        


      }  

      async function makeBid(nft){
          console.log("But NFt : " , nft );  

          const web3Modal = new Web3Modal()
          const connection = await web3Modal.connect()
          const provider = new ethers.providers.Web3Provider(connection)       
          const signer = provider.getSigner() 
          let contract = new ethers.Contract(auction, Auction.abi, signer)  

          let price =nft.highestBid >  nft.minBid  ?  nft.highestBid : nft.minBid  
          let aprice = ethers.utils.parseUnits('0.015' , 'ether')
          let tx = await contract.makeBid(nft._tokenAddress , nft._tokenId , { value: aprice } ) 
          await tx.wait()   
          loadAuctions()

      } 

      async function settleAuction(nft){
        console.log("But NFt : " , nft );  

        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)       
        const signer = provider.getSigner() 
        let contract = new ethers.Contract(auction, Auction.abi, signer) 
        
        if(nft.auctionEnd > Math.floor(new Date().getTime() / 1000) ) {
          alert('Auction Not ended') 
        }else{ 

          let tx = await contract.settleAuction(nft._tokenAddress , nft._tokenId ) 
          await tx.wait()   
          loadAuctions()

        }

       
    }


      if (loadingState === 'loaded' && !auctionNFTs.length )  return (<h1 className="py-10 px-20 text-3xl">No auctions yet</h1>)
      return(

        <div className="flex justify-center">
            <div className="px-4" style={{ maxWidth: '1600px' }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4"> 

                {
                    auctionNFTs.map((nft, i) => (
                    <div key={i} className="border shadow rounded-xl overflow-hidden">
                        <img src={nft.image} />
                        <div className="p-4">
                        <p style={{ height: '64px' }} className="text-2xl font-semibold">{nft.name}</p>
                        <div style={{ height: '70px', overflow: 'hidden' }}> 
                            <p className="text-gray-400">Minimum Bid : {nft.minBid}</p>
                            <p className="text-gray-400">Highest Bid : {nft.highestBid}</p>
                            <p className="text-gray-400">Auction End : {new Date(nft.auctionEnd*1000).toString()}</p>
                        </div>
                        </div>
                        <div className="p-4 bg-black">
                        <p className="text-2xl mb-4 font-bold text-white"> Last Bid : {nft.highestBid >  nft.minBid  ?  nft.highestBid : nft.minBid  } MATIC </p>
                        <button className="w-full bg-pink-500 text-white font-bold py-2 px-12 rounded" onClick={() => makeBid(nft)}>Make Bid</button> 
                        <button className="w-full mt-2 bg-pink-500 text-white font-bold py-2 px-12 rounded" onClick={() => settleAuction(nft)}> Settle Auction </button>
                        </div>
                    </div>
                    ))
                } 

                </div>
            </div>
        </div>
      )
  
}

 
