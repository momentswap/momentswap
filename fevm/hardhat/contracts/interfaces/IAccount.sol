// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

struct AccountData {
    address owner;
    string avatarURI;
    uint64[] momentIds;
    uint64[2][] commentIds;
    uint64[] likedMomentIds;
    uint64[] mintedSpaceIds;
    uint64[] rentedSpaceIds;
}

interface IAccount {
    function getAccountIds(address[] calldata addresses) external view returns (uint64[] memory);
    function getAddress(uint64[] calldata accountIds) external view returns (address[] memory);
    function getAccountData(uint64[] calldata accountIds) external view returns (AccountData[] memory);
    function getAvatarURI(uint64[] calldata accountIds) external view returns (string[] memory);
    function getMomentIds(uint64 accountId) external view returns (uint64[] memory);
    function getCommentIds(uint64 accountId) external view returns (uint128[] memory);
    function getLikedMomentIds(uint64 accountId) external view returns (uint120[] memory);
    function getMintedSpaceIds(uint64 accountId) external view returns (uint64[] memory);
    function getRentedSpaceIds(uint64 accountId) external view returns (uint64[] memory);
    function createAccount(string calldata domainName, string calldata avatarURI) external returns (uint64);
    function cancellationAccount(uint64 accountId) external;
    function updateAvatarURI(string calldata avatarURI) external;
    function createMoment(string calldata metadataURI) external returns (uint120);
    function removeMoment(uint120 momentId) external;
    function likeMoment(uint120 momentId) external;
    function cancelLikeMoment(uint120 momentId) external;
    function createComment(uint120 momentId, string calldata commentText) external returns (uint128);
    function removeComment(uint128 commentId) external;
    function mintChaildSpaceDomain(uint64 parentSpaceId, string calldata domainName, uint64 expireSeconds) external returns (uint64);
    function returnSpace(uint64 spaceId) external;
    function updateRentedSpaceDomainName(uint64 spaceId, string calldata domainName) external;
}