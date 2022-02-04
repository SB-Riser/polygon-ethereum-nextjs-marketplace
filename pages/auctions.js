import Web3Modal from "web3modal"  
import { useEffect, useState } from 'react' 
import { ethers } from 'ethers' 
import axios from 'axios'
import Swal from "sweetalert2"

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
         

          Swal.fire({
            imageUrl: `${nft.image}`,
            title: `${nft.name}`,
            imageWidth: 200,
            imageHeight: 200,
            input: "text",
            showCancelButton: true
                        }).then(async (result) => {
                          if (result.value) {
                            console.log(result.value);
                            const web3Modal = new Web3Modal()
                            const connection = await web3Modal.connect()
                            const provider = new ethers.providers.Web3Provider(connection)       
                            const signer = provider.getSigner()
                            let contract = new ethers.Contract(auction, Auction.abi, signer)  
                            let comparePrice = nft.highestBid >  nft.minBid  ?  nft.highestBid : nft.minBid
                            if (result.value > comparePrice) {
                              let tx = await contract.makeBid(nft._tokenAddress , nft._tokenId , { value: ethers.utils.parseUnits(result.value.toString() , 'ether') } ) 
                              await tx.wait()   
                              loadAuctions()
                              Swal.close()
                            }
                  
                          }
                        })


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
                        <div className="p-2">
                        <div className="flex justify-center">
                          <p style={{ height: '64px' }} className="text-2xl p-2 font-semibold">{nft.name}</p>
                        </div>
                        <div style={{ height: '70px' }}> 
                            <p className="text-gray-500 text-md">Minimum Bid : {nft.minBid}</p>
                            <p className="text-gray-500 text-md">Highest Bid : {nft.highestBid}</p>
                            <p className="text-gray-500 text-md mb-4">Auction End : {new Date(nft.auctionEnd*1000).toString()}</p>
                        </div>
                        </div>
                        <div className="p-4 mt-4 bg-gray-400">
                        <p className="text-2xl mb-4 font-bold text-white"> Last Bid : {nft.highestBid >  nft.minBid  ?  nft.highestBid : nft.minBid  } MATIC </p>
                        <button className="w-full bg-green-500 text-white font-bold py-2 px-12 rounded" onClick={() => makeBid(nft)}>Make Bid</button> 
                        <button className="w-full mt-2 bg-green-500 text-white font-bold py-2 px-12 rounded" onClick={() => settleAuction(nft)}> Settle Auction </button>
                        </div>
                    </div>
                    ))
                } 

                </div>
            </div>
        </div>
      )
  
}
