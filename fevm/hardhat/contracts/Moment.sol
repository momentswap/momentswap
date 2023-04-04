// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {IMoment, MomentData, CommentData} from "./interfaces/IMoment.sol";

/// @notice This contract implements the IMoment interface and provides functionality for managing moments.
contract Moment is IMoment {

    /// @notice Total number of moments created.
    uint120 public totalMomentCount;

    /// @notice Total number of comment created.
    uint128 public totalCommentCount;

    /// @notice Mapping of moment IDs to MomentData struct.
    mapping(uint120 => MomentData) public moments;

    /// @notice Mapping of comment IDs to CommentData struct.
    mapping(uint128 => CommentData) public comments;

    /// @notice Mapping of moment IDs to addresses of users who liked a moment.
    mapping(uint120 => address[]) public likes;

    /// @notice Mapping of moment IDs to IDs of comments made on a moment.
    mapping(uint120 => uint128[]) public commentsOnMoment;

    constructor() {}

    /// @notice Returns an array of all moments that have been created.
    /// @return An array of MomentData structs representing all moments created in the contract.
    function getAllMoments() external view returns (MomentData[] memory) {
        MomentData[] memory allMoments = new  MomentData[](totalMomentCount);
        for (uint120 i = 0; i < totalMomentCount; i++) {
            allMoments[i] = moments[i];
        }
        return allMoments;
    }

    /// @notice Returns an array of MomentData for the specified moment IDs.
    /// @param momentIds The list of moment IDs for which to retrieve the MomentData.
    /// @return An array of MomentData corresponding to the given moment IDs.
    function getMomentData(uint120[] calldata momentIds) external view returns (MomentData[] memory) {
        MomentData[] memory momentData = new  MomentData[](momentIds.length);
        for (uint120 i = 0; i < momentIds.length; i++) {
            momentData[i] = moments[momentIds[i]];
        }
        return momentData;
    }

    /// @notice Returns an array of the number of likes for each moment in the input array.
    /// @param momentIds The list of moment IDs for which to retrieve the number of likes.
    /// @return An array of the number of likes corresponding to the given moment IDs.
    function getLikes(uint120[] calldata momentIds) external view returns (uint256[] memory) {
        uint256[] memory likeCounts = new uint256[](momentIds.length);
        for (uint120 i = 0; i < momentIds.length; i++) {
            likeCounts[i] = likes[momentIds[i]].length;
        }
        return likeCounts;
    }

    /// @notice Returns an array of CommentData for the specified moment IDs.
    /// @param momentIds The list of moment IDs for which to retrieve the CommentData.
    /// @return An array of CommentData corresponding to the given moment IDs.
    function getComments(uint120[] calldata momentIds) external view returns (CommentData[] memory) {
        CommentData[] memory commentData = new CommentData[](momentIds.length);
        for (uint120 i = 0; i < momentIds.length; i++) {
            commentData[i] = comments[momentIds[i]];
        }
        return commentData;
    }

    /// @notice Creates a new moment and returns its ID.
    /// @param accountId The ID of the account creating the moment.
    /// @param metadataURI The URI of the metadata associated with the moment.
    /// @return The ID of the newly created moment.
    function createMoment(uint64 accountId, string calldata metadataURI) external returns (uint120) {}

    /// @notice Removes a moment with the specified ID.
    /// @param momentId The ID of the moment to be removed.
    /// @param accountId The ID of the account removing the moment.
    function removeMoment(uint120 momentId, uint64 accountId) external {}

    /// @notice Adds a like to the specified moment for the specified account.
    /// @param momentId The ID of the moment to add the like to.
    /// @param accountId The ID of the account adding the like.
    function addLike(uint120 momentId, uint64 accountId) external {}

    /// @notice Removes a like from the specified moment for the specified account.
    /// @param momentId The ID of the moment to remove the like from.
    /// @param accountId The ID of the account removing the like.
    function removeLike(uint120 momentId, uint64 accountId) external {}

    /// @notice Creates a new comment for the specified moment and returns its ID.
    /// @param momentId The ID of the moment to add the comment to.
    /// @param accountId The ID of the account creating the comment.
    /// @param commentText The text of the comment.
    /// @return The ID of the newly created comment.
    function createComment(uint120 momentId, uint64 accountId, string calldata commentText) external returns (uint128) {}

    /// @notice Removes a comment with the specified ID for the specified moment.
    /// @param momentId The ID of the moment to remove the comment from.
    /// @param commentId The ID of the comment to be removed.
    function removeComment(uint120 momentId, uint128 commentId) external {}
}