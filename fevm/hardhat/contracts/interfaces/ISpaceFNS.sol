// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

interface ISpaceFNS {
    /**
     * @dev Mint domain name event
     * Released when the user is in the mint domain name, the passed parameters are the address of the caller, the parent domain name spaceid (the parent id of the parent domain name is 0), the domain name, and the expiration time
     */ 
    event MintSpaceDomain(
        address indexed account,  
        uint64 indexed parentSpaceId,
        string indexed domainName,
        uint64 expireSeconds
    );

    /**
     * @dev Update domain name expiration time event
     * Released when `account` updates the expiration time of `spaceId` to `expireSeconds`
     */
    event UpdataExpriceTime(
        address indexed account,
        uint64 indexed spaceId,
        uint64 expireSeconds
    );

    /**
     * @dev Authorized event
     * Released when `account` authorizes `spaceId` to `operator`
     */
    event Approved(
        address indexed account,
        address indexed operator,
        uint64 indexed spaceId
    );

    /**
     * @dev Change subdomain name event
     * Released when the domain name of `spaceId` is updated to a new `domain name`
     */ 
    event UpdataDomainName(
        uint64 indexed spaceId,
        string newName
    );



    /**
     * @dev Expiration query, returns whether `spaceId` has expired
     */
    function isExpired(uint64 spaceId) external view returns (bool);

    /**
     * @dev Batch expiration query, return whether `spaceId` has expired
     */
    function isExpireds(uint64[] calldata spaceIds) external view returns (bool[] memory);

    /**
     * @dev Query authorized address by spaceId
     */
    function getApproved(uint64 spaceId) external view returns (address);

    /**
     * @dev mint domain, release `MintSpaceDomain` event
     * Require:
     * - domainName cannot be less than 3 and greater than 10 characters
     * - Domain name cannot already exist
     */
    function mintSpaceDomain(uint64 creatorId, uint64 parentSpaceId, string calldata domainName, uint64 expireSeconds) external returns (uint64);

    /**
     * @dev Change subdomain name , release `UpdataDomainName` event
     * Require:
     * - The caller is the authorized address
     * - not parent domain
     * - domainName cannot be less than 3 and greater than 10 characters
     * - Domain name cannot already exist
     * - Delete the original domain name mapping
     */
    function updateChildDomainName(uint64 spaceId, string calldata domainName) external ;

    /**
     * @dev Update domain name expiration time, release `UpdataExpriceTime` event
     * Require:
     * - The caller is the authorized address
     */
    function updateExpireSeconds(uint64 spaceId, uint64 newExpireSeconds) external ;

    /**
     * @dev Authorization, will release the `Approved` event, which is called when the user authorizes the market and the user purchases a domain name for lease or sale
     * - The caller is the authorized address
     */
    function approve(address operator, uint64 spaceId) external ;

    /**
     * @dev Renting a domain name, called when the market contract is completed
     * Require:
     * - The caller is the authorized address
     * - Change the `userid` of `SpaceDomain` to the renter,
     * - Change the authorized address of `SpaceDomain` to the address of the renter
     */
    function rentSpace(uint64 spaceId, uint64 userId, address userAddr) external ;

    /**
     * @dev return domain name 
     * Require:
     * - domain name has expired
     * - The caller is the creator of the domain name
     * - After returning, the authorization address is changed to the creator
     * - userId changed to creator
     */
    function returnSpace(uint64 userId, uint64 spaceId) external ;
}


