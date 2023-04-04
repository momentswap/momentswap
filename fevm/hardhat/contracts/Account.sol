// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {IAccount, AccountData} from "./interfaces/IAccount.sol";
import {IMoment} from "./interfaces/IMoment.sol";

contract Account is IAccount {
    uint64 public totalAccountCount;
    mapping(address => uint64) public accountIds;
    mapping(uint64 => AccountData) public accounts;

    error AccountAlreadyExists();

    constructor() {}

    function getAccountIds(address[] calldata addresses) external view returns (uint64[] memory) {
        uint64[] memory _accountIds = new uint64[](addresses.length);
        for (uint256 i = 0; i < addresses.length; i++) {
            _accountIds[i] = accountIds[addresses[i]];
        }
        return _accountIds;
    }

    function getAddresses(uint64[] calldata _accountIds) external view returns (address[] memory) {
        address[] memory addresses = new address[](_accountIds.length);
        for (uint256 i = 0; i < _accountIds.length; i++) {
            addresses[i] = accounts[_accountIds[i]].owner;
        }
        return addresses;
    }

    function getAccountData(uint64[] calldata _accountIds) external view returns (AccountData[] memory) {
        AccountData[] memory accountData = new AccountData[](_accountIds.length);
        for (uint256 i = 0; i < _accountIds.length; i++) {
            accountData[i] = accounts[_accountIds[i]];
        }
        return accountData;
    }

    function getAvatarURIs(uint64[] calldata _accountIds) external view returns (string[] memory) {
        string[] memory avatarURIs = new string[](_accountIds.length);
        for (uint256 i = 0; i < _accountIds.length; i++) {
            avatarURIs[i] = accounts[_accountIds[i]].avatarURI;
        }
        return avatarURIs;
    }

    function getMomentIds(uint64 accountId) external view returns (uint120[] memory) {
        return accounts[accountId].momentIds;
    }

    function getCommentIds(uint64 accountId) external view returns (uint128[] memory) {
        return accounts[accountId].commentIds;
    }

    function getLikedMomentIds(uint64 accountId) external view returns (uint120[] memory) {
         return accounts[accountId].likedMomentIds;
    }

    function getMintedSpaceIds(uint64 accountId) external view returns (uint64[] memory) {
         return accounts[accountId].mintedSpaceIds;
    }

    function getRentedSpaceIds(uint64 accountId) external view returns (uint64[] memory) {
        return accounts[accountId].rentedSpaceIds;
    }

    function createAccount(string calldata domainName, string calldata avatarURI) external returns (uint64) {}
    function cancellationAccount(uint64 accountId) external {}
    function updateAvatarURI(string calldata avatarURI) external {}
    function createMoment(string calldata metadataURI) external returns (uint120) {}
    function removeMoment(uint120 momentId) external {}
    function likeMoment(uint120 momentId) external {}
    function cancelLikeMoment(uint120 momentId) external {}
    function createComment(uint120 momentId, string calldata commentText) external returns (uint128) {}
    function removeComment(uint128 commentId) external {}
    function mintChaildSpaceDomain(uint64 parentSpaceId, string calldata domainName, uint64 expireSeconds) external returns (uint64) {}
    function returnSpace(uint64 spaceId) external {}
    function updateRentedSpaceDomainName(uint64 spaceId, string calldata domainName) external {}
}