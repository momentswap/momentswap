// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

/// @title ISpaceFNS
/// @dev Interface for the SpaceFNS contract.
interface ISpaceFNS {   
    /// @dev Emitted when a new Space Domain is minted.
    /// @param account The account that minted the domain.
    /// @param primarySpaceId The ID of the parent space.
    /// @param domainName The name of the domain.
    /// @param expireSeconds The number of seconds until the domain expires.
    event MintSpaceDomain(
        address indexed account,  
        uint64 indexed primarySpaceId,
        string indexed domainName,
        uint64 expireSeconds
    );

    /// @dev Emitted when the expiration time of a space is updated.
    /// @param account The account that updated the expiration time.
    /// @param spaceId The ID of the space.
    /// @param expireSeconds The new expiration time of the space.
    event UpdataExpriceTime(
        address indexed account,
        uint64 indexed spaceId,
        uint64 expireSeconds
    );

    /// @dev Emitted when `account` authorizes `spaceId` to `operator`
    /// @param account The owner of the space.
    /// @param operator The address that is approved.
    /// @param spaceId The ID of the space.
    event Approved(
        address indexed account,
        address indexed operator,
        uint64 indexed spaceId
    );

    /// @dev Emitted when the name of a domain is updated.
    /// @param spaceId The ID of the space.
    /// @param newName The new name of the domain.
    event UpdataDomainName(
        uint64 indexed spaceId,
        string newName
    );


    /// @notice Checks if a space is expired.
    /// @param spaceId The ID of the space.
    /// @return A boolean indicating whether the space is expired.
    function isExpired(uint64 spaceId) external view returns (bool);

    /// @notice Checks if an array of spaces is expired.
    /// @param spaceIds An array of space IDs.
    /// @return An array of booleans indicating whether each space is expired.
    function isExpireds(uint64[] calldata spaceIds) external view returns (bool[] memory);

    /// @notice Gets the address approved to act on behalf of a space.
    /// @param spaceId The ID of the space.
    /// @return The address approved to act on behalf of the space.
    function getApproved(uint64 spaceId) external view returns (address);

    /// @notice Get the userid of spacedomain
    /// @param spaceId The ID of the space.
    /// @return A userid
    function getSpaceDomainUserId(uint64 spaceId) external view returns (uint64);

    /// @notice Get the creator ID of spacedomain
    /// @param spaceId The ID of the space.
    /// @return A creator ID.
    function getSpaceDomainCreatorId(uint64 spaceId) external view returns (uint64);

    /// @notice Mints a new Space Domain.
    /// @param creatorId The ID of the creator.
    /// @param primarySpaceId The ID of the parent space.
    /// @param domainName The name of the domain.
    /// @param expireSeconds The number of seconds until the domain expires.
    /// @return The ID of the new Space Domain.
    /// Requirements: 
    /// - DomainName cannot be less than 3 and greater than 10 characters 
    /// - Domain name cannot already exist
    function mintSpaceDomain(uint64 creatorId, uint64 primarySpaceId, string calldata domainName, uint64 expireSeconds) external returns (uint64);

    /// @notice Updates the name of a child domain.
    /// @param spaceId The ID of the space.
    /// @param oldDomainName The current name of the domain.
    /// @param newDomainName The new name of the domain.
    /// Requirements: 
    /// - The caller is the authorized address
    /// - Not parent domain
    /// - DomainName cannot be less than 3 and greater than 10 characters
    /// - Domain name cannot already exist
    /// - Delete the original domain name mapping
    function updateSubDomainName(uint64 spaceId, string calldata oldDomainName, string calldata newDomainName, uint64 userId) external ;

    /// @notice Update the expiration time of a space with the given space ID
    /// @param spaceId The ID of the space to update
    /// @param newExpireSeconds The new expiration time, in seconds, for the space
    /// Requirements:
    /// - The caller must be authorized to update the space
    function updateExpireSeconds(uint64 spaceId, uint64 newExpireSeconds, uint64 userId) external ;


    /// @notice Authorized to the operator
    /// @param operator The address of the operator to approve
    /// @param spaceId The ID of the space to approve the operator for
    /// Requirements:
    /// - The caller must be authorized to approve an operator for the space
    function approve(address operator, uint64 spaceId) external ;

    /// @notice Rent a space with the given space ID to the user with the given user ID and address
    /// @param spaceId The ID of the space to rent
    /// @param userId The ID of the user renting the space
    /// @param userAddr The address of the user renting the space
    /// Requirements:
    /// - The caller is the authorized address
    /// - Change the `userid` of `SpaceDomain` to the renter,
    /// - Change the authorized address of `SpaceDomain` to the address of the renter
    function rentSpace(uint64 spaceId, uint64 userId, address userAddr) external ;

    /// @notice Return a space with the given space ID to the creator
    /// @param userId The ID of the creator of the space
    /// @param spaceId The ID of the space to return
    /// Requirements:
    /// - Domain name has expired
    /// - The caller is the creator of the domain name
    /// - After returning, the authorization address is changed to the creator
    /// - UserId changed to creator
    function returnSpace(uint64 userId, uint64 spaceId) external ;

}


