// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {IMoment, MomentData, CommentData} from "./interfaces/IMoment.sol";

contract Moment is IMoment {
    uint120 public totalMomentCount;
    uint128 public totalCommentCount;
    mapping(uint120 => MomentData) public moments;
    mapping(uint128 => CommentData) public comments;
    mapping(uint128 => address[]) public likes;
    mapping(uint120 => uint128[]) public commentsOnMoment;

    constructor() {}

    function getAllMomentIds() external view returns (uint120) {}
    function getMomentData(uint120[] calldata momentIds) external view returns (MomentData[] memory) {}
    function getLikes(uint120[] calldata momentIds) external view returns (address[][] memory) {}
    function getComments(uint120[] calldata momentIds) external view returns (CommentData[] memory) {}
    function createMoment(uint64 accountId, string calldata metadataURI) external returns (uint120) {}
    function removeMoment(uint120 momentId, uint64 accountId) external {}
    function addLike(uint120 momentId, uint64 accountId) external {}
    function removeLike(uint120 momentId, uint64 accountId) external {}
    function createComment(uint120 momentId, uint64 accountId, string calldata commentText) external returns (uint128) {}
    function removeComment(uint120 momentId, uint128 commentId) external {}
}