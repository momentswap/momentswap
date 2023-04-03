// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

struct MomentData {
    uint64 creatorId;
    uint64 timestamp;
    bool deleted;
    string metadataURI;
}

struct CommentData {
    uint64 creatorId;
    uint64 timestamp;
    uint120 momentId;
    bool deleted;
    string text;
}

interface IMoment {
    function getAllMomentIds() external view returns (uint120);
    function getMomentData(uint120[] calldata momentIds) external view returns (MomentData[] memory);
    function getLikes(uint120[] calldata momentIds) external view returns (address[][] memory);
    function getComments(uint120[] calldata momentIds) external view returns (CommentData[] memory);
    function createMoment(uint64 accountId, string calldata metadataURI) external returns (uint120);
    function removeMoment(uint120 momentId, uint64 accountId) external;
    function addLike(uint120 momentId, uint64 accountId) external;
    function removeLike(uint120 momentId, uint64 accountId) external;
    function createComment(uint120 momentId, uint64 accountId, string calldata commentText) external returns (uint128);
    function removeComment(uint120 momentId, uint128 commentId) external;
}