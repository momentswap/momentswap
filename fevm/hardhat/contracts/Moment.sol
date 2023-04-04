// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {IMoment, MomentData, CommentData} from "./interfaces/IMoment.sol";

contract Moment is IMoment {
    uint120 public totalMomentCount;
    uint128 public totalCommentCount;
    mapping(uint120 => MomentData) public moments;
    mapping(uint128 => CommentData) public comments;
    mapping(uint120 => address[]) public likes;
    mapping(uint120 => uint128[]) public commentsOnMoment;

    constructor() {}

    function getAllMoments() external view returns (MomentData[] memory) {
        MomentData[] memory allMoments = new  MomentData[](totalMomentCount);
        for (uint120 i = 0; i < totalMomentCount; i++) {
            allMoments[i] = moments[i];
        }
        return allMoments;
    }

    function getMomentData(uint120[] calldata momentIds) external view returns (MomentData[] memory) {
        MomentData[] memory momentData = new  MomentData[](momentIds.length);
        for (uint120 i = 0; i < momentIds.length; i++) {
            momentData[i] = moments[momentIds[i]];
        }
        return momentData;
    }

    function getLikes(uint120[] calldata momentIds) external view returns (uint256[] memory) {
        uint256[] memory likeCounts = new uint256[](momentIds.length);
        for (uint120 i = 0; i < momentIds.length; i++) {
            likeCounts[i] = likes[momentIds[i]].length;
        }
        return likeCounts;
    }

    function getComments(uint120[] calldata momentIds) external view returns (CommentData[] memory) {
        CommentData[] memory commentData = new CommentData[](momentIds.length);
        for (uint120 i = 0; i < momentIds.length; i++) {
            commentData[i] = comments[momentIds[i]];
        }
        return commentData;
    }

    function createMoment(uint64 accountId, string calldata metadataURI) external returns (uint120) {}
    function removeMoment(uint120 momentId, uint64 accountId) external {}
    function addLike(uint120 momentId, uint64 accountId) external {}
    function removeLike(uint120 momentId, uint64 accountId) external {}
    function createComment(uint120 momentId, uint64 accountId, string calldata commentText) external returns (uint128) {}
    function removeComment(uint120 momentId, uint128 commentId) external {}
}