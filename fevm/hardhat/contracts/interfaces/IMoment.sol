// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

/// @notice Data stored for each moment.
struct MomentData {
    uint64 creatorId;   // The ID of the account that created this moment.
    uint64 timestamp;   // The timestamp at which this moment was created.
    bool deleted;       // Whether or not this moment has been deleted.
    string metadataURI; // The URI of the metadata associated with this moment.
}

/// @notice Data stored for each comment.
struct CommentData {
    uint64 creatorId;   // The ID of the account that created this comment.
    uint64 timestamp;   // The timestamp at which this comment was created.
    uint120 momentId;   // The ID of the moment that this comment is associated with.
    bool deleted;       // Whether or not this comment has been deleted.
    string text;        // The text of the comment.
}

/// @title Moment Contract Interface
/// @notice This interface defines the methods that can be called on the moment contract.
interface IMoment {
    /// @notice Returns an array of all moments that have been created.
    /// @return An array of MomentData structs representing all moments created in the contract.
    function getAllMoments() external view returns (MomentData[] memory);

    /// @notice Returns an array of MomentData for the specified moment IDs.
    /// @param momentIds The list of moment IDs for which to retrieve the MomentData.
    /// @return An array of MomentData corresponding to the given moment IDs.
    function getMomentData(uint120[] calldata momentIds) external view returns (MomentData[] memory);

    /// @notice Returns an array of the number of likes for each moment in the input array.
    /// @param momentIds The list of moment IDs for which to retrieve the number of likes.
    /// @return An array of the number of likes corresponding to the given moment IDs.
    function getLikes(uint120[] calldata momentIds) external view returns (uint256[] memory);

    /// @notice Returns an array of CommentData for the specified moment IDs.
    /// @param momentIds The list of moment IDs for which to retrieve the CommentData.
    /// @return An array of CommentData corresponding to the given moment IDs.
    function getComments(uint120[] calldata momentIds) external view returns (CommentData[] memory);

    /// @notice Creates a new moment and returns its ID.
    /// @param accountId The ID of the account creating the moment.
    /// @param metadataURI The URI of the metadata associated with the moment.
    /// @return The ID of the newly created moment.
    function createMoment(uint64 accountId, string calldata metadataURI) external returns (uint120);

    /// @notice Removes a moment with the specified ID.
    /// @param momentId The ID of the moment to be removed.
    function removeMoment(uint120 momentId) external;

    /// @notice Adds a like to the specified moment for the specified account.
    /// @param momentId The ID of the moment to add the like to.
    /// @param accountId The ID of the account adding the like.
    function addLike(uint120 momentId, uint64 accountId) external;

    /// @notice Removes a like from the specified moment for the specified account.
    /// @param momentId The ID of the moment to remove the like from.
    /// @param accountId The ID of the account removing the like.
    function removeLike(uint120 momentId, uint64 accountId) external;

    /// @notice Creates a new comment for the specified moment and returns its ID.
    /// @param momentId The ID of the moment to add the comment to.
    /// @param accountId The ID of the account creating the comment.
    /// @param commentText The text of the comment.
    /// @return The ID of the newly created comment.
    function createComment(uint120 momentId, uint64 accountId, string calldata commentText) external returns (uint128);

    /// @notice Removes a comment with the specified ID.
    /// @param commentId The ID of the comment to be removed.
    function removeComment(uint128 commentId) external;
}
