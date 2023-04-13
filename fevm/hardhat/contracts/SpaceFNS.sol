// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./interfaces/ISpaceFNS.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract SpaceFNS is ISpaceFNS {
    using Counters for Counters.Counter;
    Counters.Counter private _spaceIds;

    struct SpaceDomain {
        uint64 creatorId;
        uint64 userId;
        uint64 expireSeconds;
        uint64 primarySpaceId;
        string domainName;
    }
    

    /// Check domain length decorator
    modifier checkDomainNameLength(string calldata domainName) {
        uint256 domainName_length = bytes(domainName).length;
        if (domainName_length < 3 || domainName_length > 10) {
            revert DomainNameEroor(); 
        }
        _;
    }

    /// Must be the creator to modify the domain name and modify the expiration time
    modifier isCreator(uint64 spaceId, uint64 userId) {
        if (spaceDomains[spaceId].creatorId != userId) {
            revert NotCreator();
        }
        _;
    }

    /// Must be called by the Account contract
    modifier onlyCaller() {
        if (accountCaller != msg.sender) {
            revert NotAccountContract();
        }
        _;
    }

    /// The caller must have permission
    modifier onlyAppover(uint64 spaceId){
        if (approvals[spaceId] != tx.origin) {
            revert NotAppoved();
        }
        _;
    }

    /// The owner must have permission
    modifier onlyOwner(uint64 spaceId){
        if (approvals[spaceId] != msg.sender) {
            revert NotAppoved();
        }
        _;
    }

    /// Must be Admin can call
    modifier onlyAdmin() {
        if (msg.sender != admin) {
            revert UnAdmin();
        }
        _;
    }

    error NotAccountContract();
    error NotAppoved();
    error NotExpired();
    error NotCreator();
    error UnAdmin();
    error NotSubdomain();
    error DomainAlreadyExists();
    error DomainNameEroor();

    /// id(spaceId) ==> SpaceDomain struct
    mapping(uint64 => SpaceDomain) public spaceDomains;

    /// domainName ==> spaceId
    mapping(string => uint64) public spaceDomainIds;

    /// spaceId ==> authorized address
    mapping(uint64 => address) private approvals;

    /// @notice Address that can call functions with onlyCaller modifier.
    address public accountCaller;
    address public admin;

    constructor() {
        admin = msg.sender;
    }

    /// @notice Checks if a space is expired.
    /// @param spaceId The ID of the space.
    /// @return A boolean indicating whether the space is expired.
    function isExpired(uint64 spaceId) public view override returns (bool) {
        return spaceDomains[spaceId].expireSeconds < getBlockTimestamp();
    }
   
    /// @notice Checks if an array of spaces is expired.
    /// @param spaceIds An array of space IDs.
    /// @return An array of booleans indicating whether each space is expired.
    function isExpireds(uint64[] calldata spaceIds) public view override returns (bool[] memory) {
        uint64 length = uint64(spaceIds.length);
        bool[] memory expireds = new bool[](length);

        for (uint64 i = 0; i < length; i++) {
            expireds[i] = spaceDomains[spaceIds[i]].expireSeconds < getBlockTimestamp();
        }

        return expireds;
    }

    /// @notice Allows the contract owner to set the caller address.
    /// @param _caller The new caller address to be set.
    /// @dev Only the contract owner can call this function.
    function setCaller(address _caller) external onlyAdmin() {
        accountCaller = _caller;
    }

    /// @notice Gets the address approved to act on behalf of a space.
    /// @param spaceId The ID of the space.
    /// @return The address approved to act on behalf of the space.
    function getApproved(uint64 spaceId)  public view override returns (address) {
        return approvals[spaceId];
    }

    /// @notice Get the userid of spacedomain
    /// @param spaceId The ID of the space.
    /// @return A userid
    function getSpaceDomainUserId(uint64 spaceId) public view override returns (uint64) {
        return spaceDomains[spaceId].userId;
    }

    /// @notice Get the creator ID of spacedomain
    /// @param spaceId The ID of the space.
    /// @return A creator ID.
    function getSpaceDomainCreatorId(uint64 spaceId) public view override returns (uint64) {
        return spaceDomains[spaceId].creatorId;
    }

    /// @notice Mints a new Space Domain.
    /// @param creatorId The ID of the creator.
    /// @param primarySpaceId The ID of the parent space.
    /// @param domainName The name of the domain.
    /// @param expireSeconds The number of seconds until the domain expires.
    /// @return The ID of the new Space Domain.
    /// Requirements: 
    /// - DomainName cannot be less than 3 and greater than 10 characters 
    /// - Domain name cannot already exist
    function mintSpaceDomain(
        uint64 creatorId,
        uint64 primarySpaceId,
        string calldata domainName,
        uint64 expireSeconds
    ) public override checkDomainNameLength(domainName) onlyCaller() returns (uint64) {
        uint64 spaceId = uint64(_spaceIds.current());
        string memory fullDomainName = domainName;
        if (primarySpaceId != 0) {
            string memory parentDomain = getDomainNameById(primarySpaceId);
            fullDomainName = spliceDomainName(domainName, parentDomain);
        }

        if (spaceDomainIds[fullDomainName] != 0) {
            revert DomainAlreadyExists(); 
        }
        // expireSeconds = getBlockTimestamp() + expireSeconds;
        spaceDomains[spaceId] = SpaceDomain({
            creatorId: creatorId,
            userId: creatorId,
            expireSeconds: getBlockTimestamp() + expireSeconds,
            primarySpaceId: primarySpaceId,
            domainName: fullDomainName
        });

        spaceDomainIds[fullDomainName] = spaceId;
        approvals[spaceId] = tx.origin;

        _spaceIds.increment();

        emit MintSpaceDomain(tx.origin, primarySpaceId, fullDomainName, expireSeconds);
        return spaceId;
    }

    /// @notice Updates the name of a child domain.
    /// @param spaceId The ID of the space.
    /// @param oldDomainName The current name of the domain.
    /// @param newDomainName The new name of the domain.
    /// Requirements: 
    /// - The caller is the authorized address
    /// - Not parent domain
    /// - DomainName cannot be less than 3 and greater than 10 characters
    /// - Domain name cannot already exist
    /// - Delete the original domain name mapping
    function updateSubDomainName(
        uint64 spaceId,
        string calldata primaryDomain,
        string calldata oldDomainName,
        string calldata newDomainName
    ) public override checkDomainNameLength(newDomainName) onlyCaller() onlyAppover(spaceId) {
        if (spaceDomains[spaceId].primarySpaceId == 0) {
            revert NotSubdomain(); 
        }

        string memory oldFullDomainName = spliceDomainName2(oldDomainName, primaryDomain);       
        string memory newFullDomainName = spliceDomainName2(newDomainName, primaryDomain);

        /// The new full domain name cannot already exist
        if (spaceDomainIds[newFullDomainName] != 0) {
            revert DomainAlreadyExists(); 
        }

        /// Delete the original domain name
        delete(spaceDomainIds[oldFullDomainName]);

        /// change domain name
        spaceDomains[spaceId].domainName = newFullDomainName;
        spaceDomainIds[newFullDomainName] = spaceId;

        emit UpdataDomainName(spaceId, newFullDomainName);
    }

    /// @notice Update the expiration time of a space with the given space ID
    /// @param spaceId The ID of the space to update
    /// @param newExpireSeconds The new expiration time, in seconds, for the space
    /// Requirements:
    /// - The caller must be authorized to update the space
    function updateExpireSeconds(uint64 spaceId, uint64 newExpireSeconds, uint64 userId) public override 
        isCreator(spaceId, userId) onlyCaller() onlyAppover(spaceId){
        uint64 expireSeconds = getBlockTimestamp() + newExpireSeconds;
        spaceDomains[spaceId].expireSeconds = expireSeconds;
        emit UpdataExpriceTime(tx.origin, spaceId, newExpireSeconds);
    }

    /// @notice Authorized to the operator
    /// @param operator The address of the operator to approve
    /// @param spaceId The ID of the space to approve the operator for
    /// Requirements:
    /// - The caller must be authorized to approve an operator for the space
    function _approve(address operator, uint64 spaceId) internal {
        approvals[spaceId] = operator;
        emit Approved(msg.sender, operator, spaceId);
    }

    function approve(address operator, uint64 spaceId) public override onlyOwner(spaceId) {
        _approve(operator, spaceId);
    }

    /// @notice Rent a space with the given space ID to the user with the given user ID and address
    /// @param spaceId The ID of the space to rent
    /// @param userId The ID of the user renting the space
    /// @param userAddr The address of the user renting the space
    /// Requirements:
    /// - The caller is the authorized address
    /// - Change the `userid` of `SpaceDomain` to the renter,
    /// - Change the authorized address of `SpaceDomain` to the address of the renter
    function rentSpace(uint64 spaceId, uint64 userId, address userAddr) public override onlyOwner(spaceId) {
        spaceDomains[spaceId].userId = userId;
        approve(userAddr, spaceId);
    }

    /// @notice Return a space with the given space ID to the creator
    /// @param userId The ID of the creator of the space
    /// @param spaceId The ID of the space to return
    /// Requirements:
    /// - Domain name has expired
    /// - The caller is the creator of the domain name
    /// - After returning, the authorization address is changed to the creator
    /// - UserId changed to creator
    function returnSpace(uint64 userId, uint64 spaceId) public override onlyCaller() isCreator(spaceId, userId) {
        if (spaceDomains[spaceId].expireSeconds >= getBlockTimestamp()) {
            revert NotExpired(); 
        }

        spaceDomains[spaceId].userId = userId;
        approvals[spaceId] = tx.origin;
    }

    /// @dev Splicing the parent domain name and subdomain name together
    function spliceDomainName(
        string calldata subdomain,
        string memory primaryDomain
    ) internal pure returns (string memory) {
        return string(abi.encodePacked(subdomain, ".", primaryDomain));
    }

    function spliceDomainName2(
        string calldata subdomain,
        string calldata primaryDomain
    ) internal pure returns (string memory) {
        return string(abi.encodePacked(subdomain, ".", primaryDomain));
    }

    /// @dev Obtain the domain name through spaceid (domain name id)
    function getDomainNameById(uint64 spaceId) internal view returns (string memory) {
        return spaceDomains[spaceId].domainName;
    }

    /// @dev Get the current blockchain timestamp
    function getBlockTimestamp() public view returns (uint64) {
        return uint64(block.timestamp);
    }

    /// @dev Get SpaceId 
    function getSpaceIdByDomainName(string calldata domainName) public view returns (uint64) {
        return spaceDomainIds[domainName];
    }

    /// @dev Get spaceDomain 
    function getSpaceDomainByID(uint64 id) public view returns (SpaceDomain memory) {
        return spaceDomains[id];
    }
}