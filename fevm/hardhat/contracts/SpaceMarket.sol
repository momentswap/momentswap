// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/ISpaceMarket.sol";
import "./interfaces/IAccount.sol";

contract SpaceMarket is ISpaceMarket, ReentrancyGuard {
    error NotListed(address accountContract, uint256 spaceId);
    error AlreadyListed(address accountContract, uint256 spaceId);
    error PriceNotMet(address accountContract, uint64 spaceId, uint256 price);
    error NoTransactionFee();
    error NoProceeds();
    error NotBeneficiary();
    error NotAppovedToMarket();
    error NotCreator();
    error FeeRateError(string message);
    error InvalidContractAddress();
    error PriceMustBeAboveZero();

    address payable public beneficiary;
    uint16 public feeRate;
    uint256 totalTransactionFee;

    mapping(address => mapping(uint64 => uint256)) public itemPrices;
    /// Record user earnings
    mapping(address => uint256) proceeds;
    /// Record fee income

    constructor() {
        beneficiary = payable(msg.sender);
        feeRate = 500;
    }

    /// onlyBeneficiary modifier
    modifier onlyBeneficiary() {
        if (msg.sender != beneficiary) {
            revert NotBeneficiary();
        }
        _;
    }

    /// @dev must be listed
    modifier isListed(address accountContract, uint64 spaceId) {
        if (itemPrices[accountContract][spaceId] == 0) {
          revert NotListed(accountContract, spaceId);
        }
        _;
    }

    /// @dev must be not Listed
    modifier notListed(
        address accountContract,
        uint64 spaceId
    ) {
        if (itemPrices[accountContract][spaceId] > 0) {
          revert AlreadyListed(accountContract, spaceId);
        }
        _;
    }

    /// @dev must be approved
    modifier isApproved(address accountContract, uint64 spaceId) {
        if (IAccount(accountContract).getApproved(spaceId) != address(this)) {
            revert NotAppovedToMarket();
        }
        _;
    }

    /// @dev must be creator
    modifier isCreator(address accountContract, uint64 spaceId) {
        (bool ok,) = IAccount(accountContract).checkSpaceCreator(spaceId);
        if (!ok) {
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
    /// @param _feeRate The new fee rate.
    function setFeeRate(uint16 _feeRate) public override onlyBeneficiary() {
        if (_feeRate > 10000) {
            revert FeeRateError("Fee rate can only be between 0 and 10000");
        }
        feeRate = _feeRate;
    }

    /// @dev Gets the fee rate for the contract.
    /// @return The fee rate.
    function getFeeRate() public view override returns (uint16) {
        return feeRate;
    }

    function getItemPrice(address accountContract, uint64 spaceId) public view override returns (uint256) {
        return itemPrices[accountContract][spaceId];
    }

    function batchGetItemPrice(address accountContract, uint64[] memory spaceIdArray) public view override returns (uint256[] memory) {
        uint256[] memory priceArray = new uint256[](spaceIdArray.length);
        for (uint256 i = 0; i < spaceIdArray.length; i++) {
            priceArray[i] = getItemPrice(accountContract, spaceIdArray[i]);
        }

        return priceArray;
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

        itemPrices[accountContract][spaceId] = price;
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
    ) public override payable isListed(accountContract, spaceId) {
        if (accountContract == address(0)) {
            revert InvalidContractAddress();
        }

        uint256 itemPrice = itemPrices[accountContract][spaceId];

        if (msg.value < itemPrice) {
            revert PriceNotMet(accountContract, spaceId, msg.value);
        }

        uint256 fee = (itemPrice * feeRate) / 10000;
        uint256 payment = itemPrice - fee;

        IAccount(accountContract).rentSpace(userId, spaceId);

        (, address creator) = IAccount(accountContract).checkSpaceCreator(spaceId);
        totalTransactionFee += fee;
        proceeds[creator] = payment;

        delete(itemPrices[accountContract][spaceId]);
        emit Rent(msg.sender, accountContract, spaceId, itemPrice);
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
        delete(itemPrices[accountContract][spaceId]);

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

        itemPrices[accountContract][spaceId] = newPrice;
        IAccount(accountContract).updateExpireSeconds(spaceId, expireSeconds);

        emit Update(msg.sender, accountContract, spaceId, expireSeconds, newPrice);
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

    function getTotalTransactionFee() public view returns(uint256){
        return totalTransactionFee;
    }

    function getProceeds(address seller) public view returns(uint256){
        return proceeds[seller];
    }

}