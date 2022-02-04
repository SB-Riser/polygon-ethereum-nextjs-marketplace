import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/router'
import Web3Modal from "web3modal"
import Swal from "sweetalert2"

import {
    nftaddress, nftmarketaddress , auction 
  } from '../config'
  
  import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
  import Market from '../artifacts/contracts/Market.sol/NFTMarket.json' 
  import Auction from '../artifacts/contracts/AuctionNFT.sol/AuctionNFT.json'

export default function MyAssets() {
  const [nfts, setNfts] = useState([])
  const [ownedNfts, setOwnedNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  const router = useRouter()


  useEffect(() => {
    // loadNFTs()
    loadNFTs2()

  }, [])

  async function loadNFTs2() {

   try { 

    const web3Modal = new Web3Modal({
      network: "mainnet",
      cacheProvider: true,
    })
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)

    let data = await tokenContract.walletOfOwner(provider.provider.selectedAddress)

    data = data.map(e => { return e.toNumber() })

    const items = await Promise.all(data.map(async i => {
      const tokenUri = await tokenContract.tokenURI(i)
      const meta = await axios.get(tokenUri)
      //    let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        tokenContract: { address: nftaddress },
        tokenId: i,
        image: meta.data.image,
        name: meta.data.name
      }
      return item
    }))

    setOwnedNfts(items)
     
   } catch (error) {
      console.log(error)
   }
    


  }



  async function loadNFTs() {
    const web3Modal = new Web3Modal({
      network: "mainnet",
      cacheProvider: true,
    })
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()



    const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
    const data = await marketContract.fetchMyNFTs()

    const items = await Promise.all(data.map(async i => {
      const tokenUri = await tokenContract.tokenURI(i.tokenId)
      const meta = await axios.get(tokenUri)
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
      }

      return item
    }))
    setNfts(items)
    setLoadingState('loaded')
  }

  async function listForSale(nft) {
    try {
      console.log('listForSale : ', nft)

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
                      
                            /* then list the item for sale on the marketplace */
                            let contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
                            let listingPrice = await contract.getListingPrice()
                            listingPrice = listingPrice.toString()
                      
                            console.log(nft.tokenContract.address.toString())
                            console.log(nft.tokenId)
                            let aprice = ethers.utils.parseUnits(result.value.toString(), 'ether')
                            console.log(aprice);
                      
                            //tokenid to be corrected 
                            let transaction = await contract.createMarketItem(nft.tokenContract.address.toString(), nft.tokenId, aprice, { value: listingPrice })
                            await transaction.wait()
                            router.push('/')
                          }
                        })
    } catch (error) {
      console.log(error);
    }

  }

  async function listForAuction(nft) {
    console.log('listForAuction : ', nft)

    const { value: formValues } = await Swal.fire({
      imageUrl: `${nft.image}`,
            title: `${nft.name}`,
            imageWidth: 200,
            imageHeight: 200,
    title: "Auction NFT",
    showCancelButton: true,
    html:
      '<input id="swal-input1" class="swal2-input">' +
      '<input id="swal-input2" type="datetime-local" class="swal2-input">',
    focusConfirm: false,

    preConfirm: () => {
      return [
        document.getElementById('swal-input1').value,
        document.getElementById('swal-input2').value
      ]



    }
  })

  if (formValues) {
    let auctionPrice = formValues[0].toString();
    let auctionTimeEnd = Math.floor(new Date(formValues[1]).getTime() /1000);
    console.log(auctionPrice, auctionTimeEnd);

    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
  
  
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, signer)
    let tx = await tokenContract.setApprovalForAll(auction, true)
    await tx.wait()
  
    let contract = new ethers.Contract(auction, Auction.abi, signer)
    let auctionEnd = Math.floor(new Date().getTime() / 1000) + 86400
    let aprice = ethers.utils.parseUnits(auctionPrice.toString(), 'ether')
    console.log(aprice);
  
    let transaction = await contract.createAuction(nft.tokenContract.address.toString(), nft.tokenId, aprice, auctionTimeEnd)
    await transaction.wait()
  
    console.log(" pushed to auction ")
    router.push('/auctions');

  }



  }


  if (loadingState === 'loaded' && !ownedNfts.length) return (<h1 className="py-10 px-20 text-3xl">No assets owned</h1>)
  return (
    <>
      {/* <div className="flex justify-center">
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {
            nfts.map((nft, i) => (
              <div key={i} className="border shadow rounded-xl overflow-hidden">
                <img src={nft.image} className="rounded" />
                <div className="p-4 bg-black">
                  <p className="text-2xl font-bold text-white">Price - {nft.price} Eth</p>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>   */}


      <div className="flex justify-center">
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            {
              ownedNfts.map((nft, i) => (
                <div key={i} className="border shadow rounded-xl overflow-hidden">
                  <img src={nft.image} className="rounded-t" />
                  <div className="p-4 bg-green-500">
                    <p className="text-2xl font-bold text-white">Price - {nft.price} MATIC</p>
                    <div className='flex justify-around mt-5 mb-5'>
                      <p className="mt-1 text-white"></p>
                      <p className="mt-1 text-white"></p>
                      <p className="mt-1 text-white"></p>
                    </div>
                  </div>

                  <div className='flex flex-row justify-around items-center' >
                    <div>
                      <button onClick={() => listForAuction(nft)} className="font-bold mt-2 mb-2 bg-green-500 text-white rounded-md p-2 px-4 hover:bg-gray-200 hover:text-gray-500">
                        Auction
                      </button>
                    </div>

                    <div>
                      <span className='text-center mr-4 ml-4 font-bold text-gray-500' >Or</span>
                    </div>

                    <div>
                      <button onClick={() => listForSale(nft)} className="font-bold mt-2 mb-2 bg-green-500 text-white rounded-md p-2 px-4 hover:bg-gray-200 hover:text-gray-500">
                        List
                      </button>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>


    </>



  )
}

