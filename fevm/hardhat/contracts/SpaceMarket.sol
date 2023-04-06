// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./interfaces/ISpaceMarket.sol";
import "./interfaces/ISpaceFNS.sol";

contract SpaceMarket is ISpaceMarket {
    struct Item {
        address owner;
        uint64 price;
    }

    address public beneficiary;
    uint16 public freeRate;

    mapping(address => mapping(uint64 => Item)) public nftList;
    
    constructor(uint16 freeRate_) {
        beneficiary = msg.sender;
        freeRate = freeRate_;
    }
    
    /// onlyBeneficiary modifier
    modifier onlyBeneficiary() {
        require(msg.sender == beneficiary, "Timelock: Caller not beneficiary");
        _;
    }

    function setBeneficiary(address newBeneficiary) public override onlyBeneficiary() {
        beneficiary = newBeneficiary;
    }
    
    function getBeneficiary() public pure override returns (address) {
        return beneficiary;
    }
    
    function setFeeRate(uint16 feeRate) public override onlyBeneficiary() {
        freeRate = feeRate;
    }
    
    function getFeeRate() public pure override returns (uint16) {
        return freeRate;
    }
    
    function listSpace(address nftAddr, uint64 spaceId, uint64 price) public override {
        ISpaceFNS spaceDomain = ISpaceFNS(nftAddr); // Create an ISpaceFNS object
        require(spaceDomain.getApproved(spaceId) == address(this), "Please authorize the space domain to the market");
        require(nftAddr != address(0), "Invalid NFT address");
        require(price > 0, "Price must be greater than 0");
        
        nftList[nftAddr][spaceId] = Item(msg.sender, price);
        
        emit List(msg.sender, nftAddr, spaceId, price);
    }
    
    function rentSpace(address nftAddr, uint64 spaceId, uint64 userId) public override {
        Item memory _item =  nftList[nftAddr][spaceId];
        require(nftAddr != address(0), "Invalid NFT address");
        require(msg.value > _item.price, "Increase price");
        ISpaceFNS spaceDomain = ISpaceFNS(nftAddr); // Create an ISpaceFNS object
        spaceDomain.rentSpace(spaceId, userId, msg.sender);

        uint64 price = _item.price;
        
        uint64 fee = (price * freeRate) / 10000;
        uint64 payment = price - fee;
        
        (bool success,) = beneficiary.call{value: fee}("");
        require(success, "Failed to send transaction fee to beneficiary");
        
        (bool transferSuccess,) = payable(_item.owner).call{value: payment}("");
        require(transferSuccess, "Failed to transfer payment to seller");
        
        emit Rent(msg.sender, nftAddr, spaceId, price);
    }
    
    function cancelListSpace(address nftAddr, uint64 spaceId) public override {
        require(nftAddr != address(0), "Invalid NFT address");

        emit Revoke(msg.sender, nftAddr, spaceId);
    }

    function updateListedSpace(address nftAddr, uint64 spaceId, uint64 newPrice) public override {
        require(newPrice > 0, "Price must be greater than zero");

        nftList[nftAddr][spaceId].price = newPrice;
        emit Update(msg.sender, nftAddr, spaceId, newPrice);
    }

}