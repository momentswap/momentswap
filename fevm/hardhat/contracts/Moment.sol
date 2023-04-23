// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import {IMoment, MomentData, CommentData} from "./interfaces/IMoment.sol";

/// @notice This contract implements the IMoment interface and provides functionality for managing moments.
contract Moment is IMoment, Ownable, ERC721URIStorage {

    /// @notice Error to be thrown when the caller is not authorized to perform an action.
    error Unauthorized();

    /// @notice Error to be thrown when accessing this comment.
    error MomentNotFound();

    /// @notice Total number of moments created.
    uint120 public totalMomentCount;

    /// @notice Total number of comments created.
    uint128 public totalCommentCount;

    /// @notice Mapping of moment IDs to MomentData struct.
    mapping(uint120 => MomentData) public moments;

    /// @notice Mapping of comment IDs to CommentData struct.
    mapping(uint128 => CommentData) public comments;

    /// @notice Mapping of moment IDs to addcount ID of users who liked a moment.
    mapping(uint120 => uint64[]) public likes;

    /// @notice Mapping of moment IDs to IDs of comments made on a moment.
    mapping(uint120 => uint128[]) public commentsOnMoment;

    /// @notice Address that can call functions with onlyCaller modifier.
    address public caller;

    /// @notice Modifier that only allows the `caller` address to call a function.
    modifier onlyCaller() {
        if (msg.sender != caller) revert Unauthorized();
        _;
    }

    /// @notice Constructor function that initializes the ERC721 token with the name "Moment NFTs" and the symbol "MMT".
    constructor() ERC721("Moment NFTs", "MMT") {}

    // TODO: Transfer All to Events
    /// @notice Returns an array of all moments that have been created.
    /// @return An array of MomentData structs representing all moments created in the contract.
    function getAllMoments() external view returns (MomentData[] memory) {
        MomentData[] memory allMoments = new  MomentData[](totalMomentCount);
        for (uint120 i = 0; i < totalMomentCount; i++) {
            allMoments[i] = moments[i + 1];
        }
        return allMoments;
    }

    // TODO: Transfer All to Events
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

    // TODO: Transfer All to Events
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

    // TODO: Transfer All to Events
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
    function createMoment(uint64 accountId, string calldata metadataURI) external onlyCaller returns (uint120) {
        uint120 momentId = ++totalMomentCount;
        moments[momentId] = MomentData({
            creatorId: accountId,
            timestamp: uint64(block.timestamp),
            deleted: false,
            metadataURI: metadataURI
        });

        _mint(tx.origin, momentId);
        _setTokenURI(momentId, metadataURI);
        return momentId;
    }

    /// @notice Removes a moment with the specified ID.
    /// @param momentId The ID of the moment to be removed.
    function removeMoment(uint120 momentId) external onlyCaller {
        moments[momentId].deleted = true;
        _burn(momentId);
    }

    // TODO: Transfer All to Events
    /// @notice Adds a like to the specified moment for the specified account.
    /// @param momentId The ID of the moment to add the like to.
    /// @param accountId The ID of the account adding the like.
    function addLike(uint120 momentId, uint64 accountId) external onlyCaller {
        likes[momentId].push(accountId);
    }

    // TODO: Transfer All to Events
    /// @notice Removes a like from the specified moment for the specified account.
    /// @param momentId The ID of the moment to remove the like from.
    /// @param accountId The ID of the account removing the like.
    function removeLike(uint120 momentId, uint64 accountId) external onlyCaller {
        uint64[] storage likedMomentIds = likes[momentId];
        for (uint256 i = 0; i < likedMomentIds.length; i++) {
            if (likedMomentIds[i] == accountId) {
                likedMomentIds[i] = likedMomentIds[likedMomentIds.length - 1];
                likedMomentIds.pop();
                break;
            }
        }
    }

    // TODO: Transfer All to Events
    /// @notice Creates a new comment for the specified moment and returns its ID.
    /// @param momentId The ID of the moment to add the comment to.
    /// @param accountId The ID of the account creating the comment.
    /// @param commentText The text of the comment.
    /// @return The ID of the newly created comment.
    function createComment(uint120 momentId, uint64 accountId, string calldata commentText) external onlyCaller returns (uint128) {
        if (moments[momentId].creatorId == 0 || moments[momentId].deleted == true) revert MomentNotFound();

        uint128 commentId = ++totalCommentCount;
        comments[commentId] = CommentData({
            creatorId: accountId,
            timestamp: uint64(block.timestamp),
            momentId: momentId,
            deleted: false,
            text: commentText
        });
        commentsOnMoment[momentId].push(commentId);
        return commentId;
    }

    // TODO: Transfer All to Events
    /// @notice Removes a comment with the specified ID.
    /// @param commentId The ID of the comment to be removed.
    function removeComment(uint128 commentId) external onlyCaller {
        uint128[] storage commentIds = commentsOnMoment[comments[commentId].momentId];
        for (uint256 i = 0; i < commentIds.length; i++) {
            if (commentIds[i] == commentId) {
                commentIds[i] = commentIds[commentIds.length - 1];
                commentIds.pop();
                comments[commentId].deleted = true;
                break;
            }
        }
    }

    /// @notice Allows the contract owner to set the caller address.
    /// @param _caller The new caller address to be set.
    /// @dev Only the contract owner can call this function.
    function setCaller(address _caller) external onlyOwner {
        caller = _caller;
    }
}