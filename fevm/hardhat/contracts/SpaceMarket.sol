// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/ISpaceMarket.sol";
import "./interfaces/ISpaceFNS.sol";

contract SpaceMarket is ISpaceMarket, ReentrancyGuard {
    struct Item {
        address owner;
        uint64 price;
    }

    address payable public beneficiary;
    uint16 public freeRate;

    mapping(address => mapping(uint64 => Item)) public nftList;
    /// Record user earnings
    mapping(address => uint256) proceeds;
    /// Record fee income
    mapping(address => uint256) totalTransactionFee;

    error NotListed(address nftAddr, uint64 spaceId);
    error PriceNotMet(address nftAddr, uint64 spaceId, uint64 price);
    error NoTransactionFee();
    error NoProceeds();
    error UnBeneficiary();
    error NotAppovedToMarket();
    error NotHolder();
    error NotCreator();
    error FreeRateEroor(string message);
    error InvalidNftAddress();
    error PriceWrong();

    constructor() {
        beneficiary = payable(msg.sender);
        freeRate = 500;
    }
    
    /// onlyBeneficiary modifier
    modifier onlyBeneficiary() {
        if (msg.sender != beneficiary) {
            revert UnBeneficiary();
        }
        _;
    }

    /// @dev must be listed
    modifier isListed(address nftAddr, uint64 spaceId) {
        Item memory _item = nftList[nftAddr][spaceId];
        if (_item.price <= 0) {
          revert NotListed(nftAddr, spaceId);
        }
        _;
    }

    /// @dev must be approved
    modifier isApproved(address nftAddr, uint64 spaceId, address owner) {
        if (ISpaceFNS(nftAddr).getApproved(spaceId) != owner) {
            revert NotAppovedToMarket();
        }
        _;
    }

    /// @dev must be holder
    modifier isHolder(address nftAddr, uint64 spaceId, uint64 userId) {
        if (ISpaceFNS(nftAddr).getSpaceDomainUserId(spaceId) != userId) {
            revert NotHolder();
        }
        _;
    }

    /// @dev must be creator
    modifier isCreator(address nftAddr, uint64 spaceId, uint64 userId) {
        if (ISpaceFNS(nftAddr).getSpaceDomainCreatorId(spaceId) != userId) {
            revert NotCreator();
        }
        _;
    }

    /// @notice Sets the beneficiary of the contract.
    /// @param newBeneficiary The address of the beneficiary.
    function setBeneficiary(address newBeneficiary) public override onlyBeneficiary() {
        beneficiary = payable(newBeneficiary);
    }
    
    /// @dev Gets the beneficiary of the contract.
    /// @return The address of the beneficiary.
    function getBeneficiary() public view override returns (address) {
        return beneficiary;
    }
    
    /// @dev Sets the fee rate for the contract.
    /// @param feeRate The new fee rate.
    function setFeeRate(uint16 feeRate) public override onlyBeneficiary() {
        if (feeRate < 0 || feeRate > 10000) {
            revert FreeRateEroor("Fee rate can only be between 0 and 10000");
        }
        freeRate = feeRate;
    }
    
    /// @dev Gets the fee rate for the contract.
    /// @return The fee rate.
    function getFeeRate() public view override returns (uint16) {
        return freeRate;
    }
    
    /// @dev Lists a domain for sale.
    /// @param nftAddr The address of the domain contract.
    /// @param spaceId The ID of the domain.
    /// @param price The price of the domain.
    /// @param userId The ID of the user.
    function listSpace(
        address nftAddr,
        uint64 spaceId,
        uint64 price,
        uint64 userId) public override 
        isApproved(nftAddr, spaceId, address(this)) 
        isCreator(nftAddr, spaceId, userId) {
        if (nftAddr == address(0)) {
            revert InvalidNftAddress(); 
        }

        if (price <= 0) {
            revert PriceWrong();
        }
        
        nftList[nftAddr][spaceId] = Item(msg.sender, price);
        emit List(msg.sender, nftAddr, spaceId, price);
    }
    
    /// @dev Rents a domain.
    /// @param nftAddr The address of the domain contract.
    /// @param spaceId The ID of the domain.
    /// @param userId The ID of the user.
    /// Requirements: 
    /// - Call the rent function of the spacedomain contract
    function rentSpace(address nftAddr, uint64 spaceId, uint64 userId) public override payable isListed(nftAddr, spaceId) nonReentrant() {
        if (nftAddr == address(0)) {
            revert InvalidNftAddress(); 
        }
        Item memory _item =  nftList[nftAddr][spaceId];
        uint256 amount = msg.value;
        uint64 price = _item.price;
        
        if (amount < price) {
            revert PriceNotMet(nftAddr, spaceId, uint64(msg.value));
        }
        
        uint64 fee = (price * freeRate) / 10000;
        uint64 payment = price - fee;

        ISpaceFNS(nftAddr).rentSpace(spaceId, userId, msg.sender);

        totalTransactionFee[beneficiary] += fee;   
        proceeds[_item.owner] = payment;

        delete(nftList[nftAddr][spaceId]);
        emit Rent(msg.sender, nftAddr, spaceId, price);
    }
    
    /// @dev Cancels the listing of a domain.
    /// @param nftAddr The address of the domain contract.
    /// @param spaceId The ID of the domain.
    /// @param userId The ID of the user.
    function cancelListSpace(address nftAddr, uint64 spaceId, uint64 userId) public override 
        isListed(nftAddr, spaceId) isCreator(nftAddr, spaceId, userId) {
        
        ISpaceFNS(nftAddr).approve(msg.sender, spaceId); // return authorization to user
        delete(nftList[nftAddr][spaceId]);

        emit Revoke(msg.sender, nftAddr, spaceId);
    }

    /// @dev Update the price of a listed space.
    /// @param nftAddr The address of the NFT for the listed space.
    /// @param spaceId The ID of the listed space.
    /// @param newPrice The new price in wei.
    /// @param userId The ID of the user.
    function updateListedSpace(address nftAddr, uint64 spaceId, uint64 newPrice, uint64 userId) public override 
        isListed(nftAddr, spaceId) isCreator(nftAddr, spaceId, userId) {
        if (newPrice <= 0) {
            revert PriceWrong();
        }

        nftList[nftAddr][spaceId].price = newPrice;
        emit Update(msg.sender, nftAddr, spaceId, newPrice);
    }

    /// @dev Allow the administrator to withdraw transaction fees.
    ///
    /// This function can only be called by the contract's administrator.
    function withdrawTransactionFee() public override onlyBeneficiary(){
        uint256 totalFee = totalTransactionFee[msg.sender];
        if (totalFee <= 0) {
            revert NoTransactionFee();
        }
        totalTransactionFee[beneficiary] = 0;
        (bool success,) = beneficiary.call{value: totalFee}("");
        require(success, "Failed to send transaction fee to beneficiary");
    }

    /// @dev Allow the user to withdraw rental income for a space they own.
    ///
    /// Triggers a WithdrawRent event.
    function withdrawRentalIncome() public override{
        uint256 proceed = proceeds[msg.sender];
        if (proceed <= 0) {
            revert NoProceeds();
        }
        proceeds[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: proceed}("");
        require(success, "Failed to transfer payment to user");
        emit WithdrawRent(msg.sender, uint64(proceed));
    }

    /// @dev GetItemBySpaceID
    function GetItemBySpaceID(address nftAddr, uint64 spaceId) public view returns(Item memory){
        return(nftList[nftAddr][spaceId]);
    }

    function getTotalTransactionFee() public view returns(uint256){
        return(totalTransactionFee[beneficiary]);
    }

    function getProceeds(address owner) public view returns(uint256){
        return(proceeds[owner]);
    }

}