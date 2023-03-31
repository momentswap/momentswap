// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

struct MomentData {
    uint256 id;
    uint256 timestamp;
    address owner;
    string metadataURI;
}

struct CommentData {
    uint256 id;
    uint256 timestamp;
    uint256 momentId;
    address owner;
    string text;
}

interface IMoment {
    function getMoments(uint256[] calldata momentIds) external view returns (MomentData[] memory);
    function getLikes(uint256[] calldata momentIds) external view returns (uint256[] memory);
    function getComments(uint256[] calldata momentIds) external view returns (CommentData[] memory);
    function createMoment(string calldata metadataURI) external returns (uint256);
    function addLike(uint256 momentId) external;
    function delLike(uint256 momentId) external;
    function addComment(uint256 momentId, string calldata text, string calldata mediaURI) external returns (uint256);
    function delComment(uint256 momentId, uint256 commentId) external;
}