// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

/// @title SpaceMarket Interface
/// @notice This interface defines the functions and events that the SpaceMarket contract should implement.
interface ISpaceMarket {
    /// @notice This event is emitted when a domain is listed for sale.
    /// @param seller The address of the seller.
    /// @param nftAddr The address of the domain contract.
    /// @param spaceId The ID of the domain.
    /// @param price The price of the domain.
    event List(
        address indexed seller,
        address indexed nftAddr,
        uint64 indexed spaceId,
        uint64 price
    );

    /// @notice This event is emitted when a domain is rented.
    /// @param buyer The address of the buyer.
    /// @param nftAddr The address of the domain contract.
    /// @param spaceId The ID of the domain.
    /// @param price The price of the domain.
    event Rent(
        address indexed buyer,
        address indexed nftAddr,
        uint64 indexed spaceId,
        uint64 price
    );

    /// @notice This event is emitted when a domain listing is cancelled.
    /// @param seller The address of the seller.
    /// @param nftAddr The address of the domain contract.
    /// @param spaceId The ID of the domain
    event Revoke(
        address indexed seller,
        address indexed nftAddr,
        uint64 indexed spaceId
    );

    /// @notice This event is emitted when the price of a domain listing is updated.
    /// @param seller The address of the seller.
    /// @param nftAddr The address of the domain contract.
    /// @param spaceId The ID of the domain.
    /// @param newPrice The new price of the domain.
    event Update(
        address indexed seller,
        address indexed nftAddr,
        uint64 indexed spaceId,
        uint64 newPrice
    );

    /// @notice This event is emitted when a user withdraws their rental income.
    /// @param to The address where the rental income is sent.
    /// @param amount The amount of rental income being withdrawn.
    event WithdrawRent(
        address to,
        uint64 amount
    );

    /// @notice Sets the beneficiary of the contract.
    /// @param beneficiary The address of the beneficiary.
    function setBeneficiary(address beneficiary) external;
    
    /// @dev Gets the beneficiary of the contract.
    /// @return The address of the beneficiary.
    function getBeneficiary() external view returns (address);

    /// @dev Sets the fee rate for the contract.
    /// @param feeRate The new fee rate.
    function setFeeRate(uint16 feeRate) external;
    
    /// @dev Gets the fee rate for the contract.
    /// @return The fee rate.
    function getFeeRate() external view returns (uint16);

    /// @dev Lists a domain for sale.
    /// @param nftAddr The address of the domain contract.
    /// @param spaceId The ID of the domain.
    /// @param price The price of the domain.
    /// @param userId The ID of the user.
    function listSpace(address nftAddr, uint64 spaceId, uint64 price, uint64 userId) external ;

    /// @dev Rents a domain.
    /// @param nftAddr The address of the domain contract.
    /// @param spaceId The ID of the domain.
    /// @param userId The ID of the user.
    function rentSpace(address nftAddr, uint64 spaceId, uint64 userId) payable external ;

    /// @dev Cancels the listing of a domain.
    /// @param nftAddr The address of the domain contract.
    /// @param spaceId The ID of the domain.
    /// @param userId The ID of the user.
    function cancelListSpace(address nftAddr, uint64 spaceId, uint64 userId) external ;

    /// @dev Update the price of a listed space.
    /// @param nftAddr The address of the NFT for the listed space.
    /// @param spaceId The ID of the listed space.
    /// @param newPrice The new price in wei.
    /// @param userId The ID of the user.
    function updateListedSpace(address nftAddr, uint64 spaceId, uint64 newPrice, uint64 userId) external ;

    /// @dev Allow the administrator to withdraw transaction fees.
    ///
    /// This function can only be called by the contract's administrator.
    function withdrawTransactionFee() external;

    /// @dev Allow the user to withdraw rental income for a space they own.
    ///
    /// Triggers a WithdrawRent event.
    function withdrawRentalIncome() external;
}