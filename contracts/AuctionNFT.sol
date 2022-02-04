// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

import "hardhat/console.sol";

contract AuctionNFT is Ownable, IERC721Receiver {
    using SafeMath for uint256;
    bool public pause;

    uint256 public defaultAuctionBidPeriod;
    uint256 public minimumBidPercentage;
    uint256 public ownersCut;

    mapping(address => uint256) public failedTransfers; 

    address[] public addressLUT ; 
    address[] public tokens ;

    struct Auction {
        IERC721 NFTContract;
        uint256 auctionEnd;
        uint256 minBid;
        uint256 highestBid;
        address highestBidder;
        address nftSeller;
    }

    mapping(address => mapping(uint256 => Auction)) auctions;

    constructor() {
        defaultAuctionBidPeriod = 20;
        minimumBidPercentage = 5;
        ownersCut = 10;
    }

    modifier isPaused() {
        require(!pause, "NFTAuction::isPaused: Auction is paused");
        _;
    }

    modifier isValidBid(address _tokenAddress, uint256 _tokenId) {
        require(
            msg.value >= auctions[_tokenAddress][_tokenId].minBid,
            "NFTAuction::isValidBid: Bid is less than minimum bid"
        );
        uint256 bid = auctions[_tokenAddress][_tokenId].highestBid;
        if (bid != 0) {
            require(
                msg.value > bid.add(bid.mul(minimumBidPercentage).div(100)),
                "NFTAuction::isValidBid: Bid is less than current bid"
            );
        }
        _;
    }

    modifier isAuctionOver(address _tokenAddress, uint256 _tokenId) {
        require(
            block.timestamp >= auctions[_tokenAddress][_tokenId].auctionEnd,
            "NFTAuction::isAuctionOver: Auction is still on"
        );
        _;
    }

    function isAuctionCreated(address _tokenAddress, uint256 _tokenId)
        public
        view
        returns (bool)
    {
        return
            !(auctions[_tokenAddress][_tokenId].minBid == 0 &&
                auctions[_tokenAddress][_tokenId].nftSeller == address(0));
    }

    function getAuction(address _tokenAddress, uint256 _tokenId)
        external
        view
        returns (
            address,
            address,
            uint256,
            uint256,
            uint256
        )
    {
        Auction memory auction = auctions[_tokenAddress][_tokenId];
        return (
            auction.nftSeller,
            auction.highestBidder,
            auction.minBid,
            auction.highestBid,
            auction.auctionEnd
        );
    }

    function _getBidPeriod(address _tokenAddress, uint256 _tokenId)
        internal
        view
        returns (uint256)
    {
        if (auctions[_tokenAddress][_tokenId].auctionEnd == 0) {
            return defaultAuctionBidPeriod;
        } else {
            return auctions[_tokenAddress][_tokenId].auctionEnd;
        }
    }

    function _updateAuctionEnd(address _tokenAddress, uint256 _tokenId)
        internal
    {
        //the auction end is always set to now + the period
        auctions[_tokenAddress][_tokenId].auctionEnd = _getBidPeriod(
            _tokenAddress,
            _tokenId
        );
    }

    // EVENTS

    event AuctionStateChanged(bool _state);
    event AuctionCreated(address  _tokenAddress, uint256 _tokenId); 
    event AuctionSettled(address _tokenAddress, uint256 _tokenId);

    function setAuctionState(bool _state) external onlyOwner {
        pause = _state;
        emit AuctionStateChanged(_state);
    }

    function _refundPreviousBider(address _tokenAddress, uint256 _tokenId)
        internal
    {
        address payable bidder = payable(
            auctions[_tokenAddress][_tokenId].highestBidder
        );
        uint256 amount = auctions[_tokenAddress][_tokenId].highestBid;

        (bool success, ) = bidder.call{value: amount}("");
        if (!success) {
            failedTransfers[_msgSender()] = failedTransfers[_msgSender()].add(
                amount
            );
        }
    }

    function _transferNFTAndPaySeller(address _tokenAddress, uint256 _tokenId)
        internal
    {
        auctions[_tokenAddress][_tokenId].NFTContract.transferFrom(
            address(this),
            auctions[_tokenAddress][_tokenId].highestBidder,
            _tokenId
        );

        uint256 amount = auctions[_tokenAddress][_tokenId].highestBid;
        payable(auctions[_tokenAddress][_tokenId].nftSeller).transfer(
            amount.mul(100 - ownersCut).div(100)
        );

        payable(owner()).transfer(amount.mul(ownersCut).div(100));
    }

    function _resetAuction(address _tokenAddress, uint256 _tokenId) internal {
        delete auctions[_tokenAddress][_tokenId]; 
        emit AuctionSettled(_tokenAddress , _tokenId ) ; 
    }

    function settleAuction(address _tokenAddress, uint256 _tokenId)
        external
        isAuctionOver(_tokenAddress, _tokenId)
    {
        _transferNFTAndPaySeller(_tokenAddress, _tokenId);

        _resetAuction(_tokenAddress, _tokenId);
    }

    function _createAuction(
        address _NFTContract,
        uint256 _tokenId,
        uint256 _minBid,
        uint256 _auctionEnd
    ) internal isPaused {
        require(
            _NFTContract != address(0),
            "NFTAuction::_createAuction: Invalid Token Address"
        );
        require(
            _minBid > 0,
            "NFTAuction::_createAuction: Minimum Bid cannot be zero"
        );

        IERC721 NFTContract = IERC721(_NFTContract);
        // transfer the nft from seller to auction contract.
        // It requires approval of NFT.
        NFTContract.safeTransferFrom(_msgSender(), address(this), _tokenId);

        auctions[_NFTContract][_tokenId].NFTContract = NFTContract;
        auctions[_NFTContract][_tokenId].nftSeller = _msgSender();
        auctions[_NFTContract][_tokenId].minBid = _minBid;
        auctions[_NFTContract][_tokenId].auctionEnd = _auctionEnd;

        _updateAuctionEnd(_NFTContract, _tokenId);
    }

    function createAuction(
        address _NFTContract,
        uint256 _tokenId,
        uint256 _minBid,
        uint256 _auctionEnd
    ) external {
        _createAuction(_NFTContract, _tokenId, _minBid, _auctionEnd);
        emit AuctionCreated(_NFTContract, _tokenId);
    }

    function makeBid(address _NFTContract, uint256 _tokenId)
        external
        payable
        isValidBid(_NFTContract, _tokenId)
    {
        require(
            isAuctionCreated(_NFTContract, _tokenId),
            "NFTAuction::makeBid: Auction is not Created"
        );
        require(
            _msgSender() != auctions[_NFTContract][_tokenId].nftSeller,
            "NFTAuction::makeBid: Owner cannot bid on own NFT"
        );
        if (auctions[_NFTContract][_tokenId].highestBidder != address(0)) {
            _refundPreviousBider(_NFTContract, _tokenId);
        }
        auctions[_NFTContract][_tokenId].highestBid = msg.value;
        auctions[_NFTContract][_tokenId].highestBidder = _msgSender();
    }

    function onERC721Received(
        address,
        address,
        uint256,
        bytes memory
    ) public virtual override returns (bytes4) {
        return this.onERC721Received.selector;
    }
} 


//52.533197846
//0.820095573 

//its beacuse this user has a balance of 0.820095573 doxy while he is trying to stake 52.533197846 doxy