// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

/// @title ISpaceFNS
/// @dev Interface for the SpaceFNS contract.
interface ISpaceFNS {
    /// @notice Checks if a space is expired.
    /// @param spaceId The ID of the space.
    /// @return A boolean indicating whether the space is expired.
    function isExpired(uint64 spaceId) external view returns (bool);

    /// @notice Checks if an array of spaces is expired.
    /// @param spaceIdArray An array of space IDs.
    /// @return An array of booleans indicating whether each space is expired.
   function batchIsExpired(uint64[] calldata spaceIdArray) external view returns (bool[] memory);

    /// @notice Get the userid of spacedomain
    /// @param spaceId The ID of the space.
    /// @return A userid
    function getSpaceDomainUserId(uint64 spaceId) external view returns (uint64);

    /// @notice Get the creator ID of spacedomain
    /// @param spaceId The ID of the space.
    /// @return A creator ID.
    function getSpaceDomainCreatorId(uint64 spaceId) external view returns (uint64);

    /// @notice Creates a new Space Domain.
    /// @param creatorId The ID of the creator.
    /// @param primarySpaceId The ID of the parent space.
    /// @param domainName The name of the domain.
    /// @param expireSeconds The number of seconds until the domain expires.
    /// @return The ID of the new Space Domain.
    /// Requirements:
    /// - DomainName cannot be less than 3 and greater than 10 characters
    /// - Domain name cannot already exist
    function createSpaceDomain(uint64 creatorId, uint64 primarySpaceId, string calldata domainName, uint64 expireSeconds) external returns (uint64);

    /// @notice Updates the name of a child domain.
    /// @param spaceId The ID of the space.
    /// Requirements:
    /// - The caller is the authorized address
    /// - Not parent domain
    /// - DomainName cannot be less than 3 and greater than 10 characters
    /// - Domain name cannot already exist
    /// - Delete the original domain name mapping
    function updateSubDomainName(uint64 spaceId, string calldata newDomainName) external ;

    /// @notice Update the expiration time of a space with the given space ID
    /// @param spaceId The ID of the space to update
    /// @param expireSeconds The new expiration time, in seconds, for the space
    /// Requirements:
    /// - The caller must be authorized to update the space
    function updateExpireSeconds(uint64 spaceId, uint64 expireSeconds) external ;

    /// @notice Rent a space with the given space ID to the user with the given user ID
    /// @param spaceId The ID of the space to rent
    /// @param userId The ID of the user renting the space
    /// Requirements:
    /// - The caller is the authorized address
    /// - Change the `userid` of `SpaceDomain` to the renter,
    /// - Change the authorized address of `SpaceDomain` to the address of the renter
    function rentSpace(uint64 spaceId, uint64 userId) external ;

    /// @notice Return a space to the creator
    /// @param spaceId The ID of the space to return
    /// Requirements:
    /// - Domain name has expired
    /// - After returning, the authorization address is changed to the creator
    function returnSpace(uint64 spaceId) external ;

}


