// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

/// @notice Data stored for each user account.
struct AccountData {
    address owner;              // The address that owns this account.
    string avatarURI;           // The URI of the avatar image associated with this account.
    uint120[] momentIds;        // An array of IDs representing the moments created by this account.
    uint128[] commentIds;       // An array of IDs representing the comments made by this account.
    uint120[] likedMomentIds;   // An array of IDs representing the moments that this account has liked.
    uint64[] createdSpaceIds;   // An array of IDs representing the spaces that this account has created.
    uint64[] rentedSpaceIds;    // An array of IDs representing the spaces that this account is currently renting.
}

/// @title Account Contract Interface
/// @notice This interface defines the methods that can be called on the account contract.
interface IAccount {

    /// @dev Emitted when `owner` authorizes `spaceId` to `operator`
    /// @param owner The owner of the space.
    /// @param operator The address that is operator.
    /// @param spaceId The ID of the space.
    event Approval(
        address indexed owner,
        address indexed operator,
        uint256 indexed spaceId
    );

    /// @dev Emitted when a new account is created.
    /// @param accountId The ID of the new account.
    /// @param wallet The wallet address associated with the account.
    /// @param primaryDomainName The primary domain name of the account.
    /// @param avatarURI The URI of the account's avatar.
    event CreateAccount(
        uint64 indexed accountId,
        address indexed wallet,
        string primaryDomainName,
        string avatarURI
    );

    /// @dev Emitted when an account is cancelled.
    /// @param accountId The ID of the cancelled account.
    event CancelAccount(uint64 indexed accountId);

    /// @dev Emitted when the avatar URI of an account is updated.
    /// @param accountId The ID of the account.
    /// @param avatarURI The new URI of the account's avatar.
    event UpdateAvatarURI(uint64 indexed accountId, string avatarURI);

    /// @dev Emitted when a new moment is created.
    /// @param accountId The ID of the account that created the moment.
    /// @param momentId The ID of the new moment.
    /// @param metadataURI The URI of the metadata associated with the moment.
    event CreateMoment(
        uint64 indexed accountId,
        uint120 indexed momentId,
        string metadataURI
    );

    /// @dev Emitted when a moment is removed.
    /// @param accountId The ID of the account that removed the moment.
    /// @param momentId The ID of the removed moment.
    event RemoveMoment(uint64 indexed accountId, uint120 indexed momentId);

    /// @dev Emitted when a moment is liked.
    /// @param accountId The ID of the account that liked the moment.
    /// @param momentId The ID of the liked moment.
    event LikeMoment(uint64 indexed accountId, uint120 indexed momentId);

    /// @dev Emitted when a like on a moment is cancelled.
    /// @param accountId The ID of the account that cancelled the like.
    /// @param momentId The ID of the moment that had its like cancelled.
    event CancelLikeMoment(uint64 indexed accountId, uint120 indexed momentId);

    /// @dev Emitted when a new comment is created.
    /// @param accountId The ID of the account that created the comment.
    /// @param commentId The ID of the new comment.
    /// @param commentText The text of the new comment.
    event CreateComment(
        uint64 indexed accountId,
        uint128 indexed commentId,
        string commentText
    );

    /// @dev Emitted when a comment is removed.
    /// @param accountId The ID of the account that removed the comment.
    /// @param commentId The ID of the removed comment.
    event RemoveComment(uint64 indexed accountId, uint128 indexed commentId);

    /// @dev Emitted when a new sub-space domain is created.
    /// @param primarySpaceId The ID of the parent space.
    /// @param subSpaceId The ID of the new sub-space.
    /// @param subDomainName The name of the sub-domain.
    /// @param expireSeconds The number of seconds until the sub-domain expires.
    event CreateSubSpaceDomain(
        uint64 indexed primarySpaceId,
        uint64 indexed subSpaceId,
        string subDomainName,
        uint64 expireSeconds
    );

    /// @dev Emitted when a space is rented.
    /// @param userId The ID of the user that rented the space.
    /// @param spaceId The ID of the rented space.
    event RentSpace(uint64 indexed userId, uint120 indexed spaceId);

    /// @dev Emitted when a space is returned.
    /// @param userId The ID of the user that returned the space.
    /// @param spaceId The ID of the returned space.
    event ReturnSpace(uint64 indexed userId, uint120 indexed spaceId);

    /// @dev Emitted when the expire seconds of the space is updated.
    /// @param spaceId The ID of the space.
    /// @param expireSeconds The new expire seconds of the rent space.
    event UpdateExpireSeconds(uint64 indexed spaceId, uint64 expireSeconds);

    /// @dev Emitted when the domain name of a rented space is updated.
    /// @param spaceId The ID of the rented space.
    /// @param domainName The new domain name of the rented space.
    event UpdateRentedSpaceDomainName(uint64 indexed spaceId,string domainName);

    /// @dev Emitted when the sub-space domain limit is updated.
    /// @param limit The new limit of sub-space domains.
    event SetSubSpaceDomainLimit(uint64 limit);

    /// @dev Emitted when the mint fee is updated.
    /// @param mintFee The new mint fee amount.
    event SetMintFee(uint256 mintFee);

    /// @dev Emitted when the beneficiary of the contract is updated.
    /// @param beneficiary The new beneficiary address.
    event SetBeneficiary(address beneficiary);

    /// @notice Checks if the caller is the creator of the specified space.
    /// @param spaceId The ID of the space to check.
    /// @return A boolean value indicating whether the caller is the space creator or not.
    /// @return The address of the space creator.
    function checkSpaceCreator(uint64 spaceId) external view returns (bool, address);

    /// @notice Gets the address approved to act on behalf of a space.
    /// @param spaceId The ID of the space.
    /// @return The address approved to act on behalf of the space.
    function getApproved(uint64 spaceId) external view returns (address);

    /// @notice Returns the account IDs of the given addresses.
    /// @dev If an address does not have an account, it is omitted from the result.
    /// @param addressArray The list of addresses for which to retrieve the account IDs.
    /// @return An array of account IDs corresponding to the given addresses.
    function batchGetAccountId(address[] calldata addressArray) external view returns (uint64[] memory);

    /// @notice Returns the account data for the given account IDs.
    /// @dev If an account ID does not exist, it is omitted from the result.
    /// @param accountIdArray The list of account IDs for which to retrieve the account data.
    /// @return An array of account data corresponding to the given account IDs.
    function batchGetAccountData(uint64[] calldata accountIdArray) external view returns (AccountData[] memory);

    /// @notice Authorized to the operator
    /// @param operator The address of the operator to approve
    /// @param spaceId The ID of the space to approve the operator for
    function approve(address operator, uint64 spaceId) external ;

    /// @notice Creates a new account with the given domain name and avatar URI.
    /// @param domainName The domain name to associate with the account.
    /// @param avatarURI The URI of the avatar to associate with the account.
    /// @return The ID of the newly created account.
    function createAccount(string calldata domainName, string calldata avatarURI) external returns (uint64);

    /// @notice Cancels the account associated.
    function cancelAccount() external;

    /// @notice Updates the avatar URI associated with the calling account.
    /// @param avatarURI The new avatar URI to associate with the calling account.
    function updateAvatarURI(string calldata avatarURI) external;

    /// @notice Creates a new moment with the given metadata URI.
    /// @param metadataURI The URI of the metadata to associate with the moment.
    /// @return The ID of the newly created moment.
    function createMoment(string calldata metadataURI) external payable returns (uint120);

    /// @notice Removes the moment associated with the given moment ID.
    /// @dev The calling account must be the owner of the moment in order to remove it.
    /// @param momentId The ID of the moment to remove.
    function removeMoment(uint120 momentId) external;

    /// @notice Adds a like to the moment associated with the given moment ID from the calling account.
    /// @dev The calling account must not have already liked the moment.
    /// @param momentId The ID of the moment to like.
    function likeMoment(uint120 momentId) external;

    /// @notice Cancels the like from the calling account to the moment associated with the given moment ID.
    /// @dev The calling account must have already liked the moment.
    /// @param momentId The ID of the moment to cancel the like for.
    function cancelLikeMoment(uint120 momentId) external;

    /// @notice Creates a new comment on the moment associated with the given moment ID with the given comment text.
    /// @param momentId The ID of the moment to create the comment on.
    /// @param commentText The text of the comment to create.
    /// @return The ID of the newly created comment.
    function createComment(uint120 momentId, string calldata commentText) external returns (uint128);

    /// @notice Removes the comment associated with the given comment ID.
    /// @dev The calling account must be the owner of the comment in order to remove it.
    /// @param commentId The ID of the comment to remove.
    function removeComment(uint128 commentId) external;

    /// @notice Created a new sub space domain with the given domain name and expire time.
    /// @dev The calling account must own the primary space in order to create a sub space domain.
    /// @param primarySpaceId The ID of the primary space to create the sub space domain for.
    /// @param domainName The domain name to associate with the sub space domain.
    /// @param expireSeconds The number of seconds until the sub space domain expires.
    /// @return The ID of the newly created sub space domain.
    function createSubSpaceDomain(uint64 primarySpaceId, string calldata domainName, uint64 expireSeconds) external returns (uint64);

    /// @notice Rents the space with the given space ID.
    /// @param userId The ID of the user to rent the domain name.
    /// @param spaceId The ID of the space to return.
    function rentSpace(uint64 userId, uint64 spaceId) external;

    /// @notice Function for returning a rented space domain.
    /// @param userId The id of the account that rented the space domain.
    /// @param spaceId The ID of the space domain to return.
    function returnSpace(uint64 userId, uint64 spaceId) external;

    /// @notice Updates the domain name for the rented space with the given space ID.
    /// @param spaceId The ID of the rented space for which to update the domain name.
    /// @param domainName The new domain name to set.
    function updateRentedSpaceDomainName(uint64 spaceId, string calldata domainName) external;

    /// @notice Update the expiration time of a space with the given space ID
    /// @param spaceId The ID of the space to update
    /// @param expireSeconds The new expiration time, in seconds, for the space
    function updateExpireSeconds(uint64 spaceId, uint64 expireSeconds) external;
}