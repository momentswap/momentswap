// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Upgrade.sol";
import "./interfaces/ISpaceMarket.sol";
import {IAccount} from "./interfaces/IAccount.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

contract SpaceMarket is ISpaceMarket, ReentrancyGuard, ERC1967Upgrade, Initializable {
    struct Item {
        address seller;
        uint256 price;
    }

    error NotListed(address accountContract, uint256 spaceId);
    error AlreadyListed(address accountContract, uint256 spaceId);
    error PriceNotMet(address accountContract, uint64 spaceId, uint256 price);
    error NoTransactionFee();
    error NoProceeds();
    error UnBeneficiary();
    error NotAppovedToMarket();
    error NotCreator();
    error FreeRateError(string message);
    error InvalidContractAddress();
    error PriceMustBeAboveZero();
    error UpdateExpireSecondsError();
    error RentSpaceError();
    error NotAdmin();

    address payable public beneficiary;
    uint16 public freeRate;
    uint256 public totalTransactionFee;

    /// @notice Mapping of account addresses to Mapping of spaceId to Item.
    mapping(address => mapping(uint64 => Item)) public spaceList;
    
    /// @notice Mapping of addresses to proceeds.
    mapping(address => uint256) public proceeds;

    /// onlyBeneficiary modifier
    modifier onlyBeneficiary() {
        if (msg.sender != beneficiary) {
            revert UnBeneficiary();
        }
        _;
    }

    /// @notice must be listed
    modifier isListed(address accountContract, uint64 spaceId) {
        Item memory _item = spaceList[accountContract][spaceId];
        if (_item.price == 0) {
          revert NotListed(accountContract, spaceId);
        }
        _;
    }

    /// @notice must be not Listed
    modifier notListed(
        address accountContract,
        uint64 spaceId
    ) {
        Item memory _item = spaceList[accountContract][spaceId];
        if (_item.price > 0) {
          revert AlreadyListed(accountContract, spaceId);
        }
        _;
    }

    /// @notice The caller must have admin
    modifier onlyAdmin() {
        if (msg.sender != _getAdmin()) {
            revert NotAdmin();
        }
        _;
    }

    /// @notice must be approved
    modifier isApproved(address accountContract, uint64 spaceId) {
        if (IAccount(accountContract).getApproved(spaceId) != address(this)) {
            revert NotAppovedToMarket();
        }
        _;
    }

    /// @notice must be creator
    modifier isCreator(address accountContract, uint64 spaceId) {
        if (!IAccount(accountContract).isSpaceCreator(spaceId)) {
            revert NotCreator();
        }
        _;
    }

    /// @notice Sets the beneficiary of the contract.
    /// @param newBeneficiary The address of the beneficiary.
    function setBeneficiary(address newBeneficiary) public override onlyAdmin() {
        beneficiary = payable(newBeneficiary);
    }

    /// @dev Gets the beneficiary of the contract.
    /// @return The address of the beneficiary.
    function getBeneficiary() public view override returns (address) {
        return beneficiary;
    }

    /// @dev Sets the fee rate for the contract.
    /// @param feeRate The new fee rate.
    function setFeeRate(uint16 feeRate) public override onlyAdmin() {
        if (feeRate > 10000) {
            revert FreeRateError("Fee rate can only be between 0 and 10000");
        }
        freeRate = feeRate;
    }

    /// @dev The initialization function can only be called once
    function initMarket(address newBeneficiary, uint16 feeRate) public onlyAdmin(){
        beneficiary = payable(newBeneficiary);
        if (feeRate > 10000) {
            revert FreeRateError("Fee rate can only be between 0 and 10000");
        }
        freeRate = feeRate;
    }

    /// @dev Gets the fee rate for the contract.
    /// @return The fee rate.
    function getFeeRate() public view override returns (uint16) {
        return freeRate;
    }

    /// @dev Lists a domain for sale.
    /// @param accountContract The address of the Account contract.
    /// @param spaceId The ID of the domain.
    /// @param expireSeconds The number of seconds until the sub space domain expires.
    /// @param price The price of the domain.
    function listSpace(
        address accountContract,
        uint64 spaceId,
        uint64 expireSeconds,
        uint256 price
    ) public override
        isApproved(accountContract, spaceId)
        isCreator(accountContract, spaceId)
        notListed(accountContract, spaceId)
    {
        if (accountContract == address(0)) {
            revert InvalidContractAddress();
        }

        if (price == 0) {
            revert PriceMustBeAboveZero();
        }

        spaceList[accountContract][spaceId] = Item(msg.sender, price);
        IAccount(accountContract).updateExpireSeconds(spaceId, expireSeconds);

        emit List(msg.sender, accountContract, spaceId, price);
    }

    /// @dev Rents a domain.
    /// @param accountContract The address of the Account contract.
    /// @param spaceId The ID of the domain.
    /// @param userId The ID of the user.
    /// Requirements:
    /// - Call the rent function of the Account contract
    function rentSpace(
        address accountContract,
        uint64 spaceId,
        uint64 userId
    ) public override payable isListed(accountContract, spaceId) nonReentrant() {
        if (accountContract == address(0)) {
            revert InvalidContractAddress();
        }

        Item memory _item = spaceList[accountContract][spaceId];

        if (msg.value < _item.price) {
            revert PriceNotMet(accountContract, spaceId, msg.value);
        }

        uint256 fee = (_item.price * freeRate) / 10000;
        uint256 payment = _item.price - fee;
        IAccount(accountContract).rentSpace(spaceId, userId);

        totalTransactionFee += fee;
        proceeds[_item.seller] = payment;

        delete(spaceList[accountContract][spaceId]);
        emit Rent(msg.sender, accountContract, spaceId, _item.price);
    }

    /// @dev Cancels the listing of a domain.
    /// @param accountContract The address of the Account contract.
    /// @param spaceId The ID of the domain.
    function cancelListSpace(
        address accountContract,
        uint64 spaceId
    ) public override
        isApproved(accountContract, spaceId)
        isListed(accountContract, spaceId)
        isCreator(accountContract, spaceId)
    {
        delete(spaceList[accountContract][spaceId]);

        emit Revoke(msg.sender, accountContract, spaceId);
    }

    /// @dev Update the price of a listed space.
    /// @param accountContract The address of the Account contract.
    /// @param spaceId The ID of the listed space.
    /// @param expireSeconds The number of seconds until the sub space domain expires.
    /// @param newPrice The new price in wei.
    function updateListedSpace(
        address accountContract,
        uint64 spaceId,
        uint64 expireSeconds,
        uint256 newPrice
    ) public override
        isListed(accountContract, spaceId)
        isCreator(accountContract, spaceId)
    {
        if (newPrice == 0) {
            revert PriceMustBeAboveZero();
        }

        spaceList[accountContract][spaceId].price = newPrice;
        IAccount(accountContract).updateExpireSeconds(spaceId, expireSeconds);
        // (bool success,) = accountContract.call(abi.encodeWithSignature("updateExpireSeconds(uint64,uint64)", spaceId, expireSeconds));
        // if (!success) revert UpdateExpireSecondsError();

        emit Update(msg.sender, accountContract, spaceId, newPrice);
    }

    /// @dev Allow the administrator to withdraw transaction fees.
    ///
    /// This function can only be called by the contract's administrator.
    function withdrawTransactionFee() public override nonReentrant onlyBeneficiary() {
        uint256 totalFee = totalTransactionFee;
        if (totalFee <= 0) {
            revert NoTransactionFee();
        }
        totalTransactionFee = 0;
        (bool success,) = beneficiary.call{value: totalFee}("");
        require(success, "Failed to send transaction fee to beneficiary");
    }

    /// @dev Allow the user to withdraw rental income for a space they own.
    ///
    /// Triggers a WithdrawRent event.
    function withdrawRentalIncome() public override nonReentrant {
        uint256 proceed = proceeds[msg.sender];
        if (proceed <= 0) {
            revert NoProceeds();
        }
        proceeds[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: proceed}("");
        require(success, "Failed to transfer payment to user");
        emit WithdrawRent(msg.sender, proceed);
    }

    /// @dev GetItemBySpaceID
    function GetItemBySpaceID(address nftAddr, uint64 spaceId) public view returns(Item memory){
        return spaceList[nftAddr][spaceId];
    }

    function getTotalTransactionFee() public view returns(uint256){
        return totalTransactionFee;
    }

    function getProceeds(address seller) public view returns(uint256){
        return proceeds[seller];
    }

}