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
    function getAllAccountIds() external view returns (uint256[] memory);
    function getAccount(address accountId) external view returns (AccountData memory);
    function getAvatarURI(uint256 accountId) external view returns (string memory);
    function getMomentIds(uint256 accountId) external view returns (uint256[] memory);
    function getCommentedMomentIds(uint256 accountId) external view returns (uint256[] memory);
    function getLikedMomentIds(uint256 accountId) external view returns (uint256[] memory);
    function getMintedSpaceIds(uint256 accountId) external view returns (uint256[] memory);
    function getRentedSpaceIds(uint256 accountId) external view returns (uint256[] memory);
    function createAccount() external returns (uint256);
    function cancellationAccount(uint256) external;
    function updateAvatarURI() external;
    function addLike() external;
    function removeLike() external;
    function addCommentedMomentId() external;
    function removeCommentedMomentId() external;
    function addMintedSpaceId() external;
    function addRentedSpaceId() external;
    function removeRentedSpaceId() external;
}