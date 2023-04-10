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
        uint64 parentSpaceId;
        string domainName;
    }

    /// Check domain length decorator
    modifier checkDomainNameLength(string calldata domainName) {
        uint256 domainName_length = bytes(domainName).length;
        require(domainName_length >= 3 && domainName_length <= 10, "Domain name length does not meet the specification");
        _;
    }

    /// id(spaceId) ==> SpaceDomain struct
    mapping(uint64 => SpaceDomain) public spaceDomains;

    /// domainName ==> spaceId
    mapping(string => uint64) public spaceDomainIds;

    /// spaceId ==> authorized address
    mapping(uint64 => address) private approvals;

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
    
    /// @notice Gets the address approved to act on behalf of a space.
    /// @param spaceId The ID of the space.
    /// @return The address approved to act on behalf of the space.
    function getApproved(uint64 spaceId)  public view override returns (address) {
        return approvals[spaceId];
    }

    /// @notice Mints a new Space Domain.
    /// @param creatorId The ID of the creator.
    /// @param parentSpaceId The ID of the parent space.
    /// @param domainName The name of the domain.
    /// @param expireSeconds The number of seconds until the domain expires.
    /// @return The ID of the new Space Domain.
    /// Requirements: 
    /// - DomainName cannot be less than 3 and greater than 10 characters 
    /// - Domain name cannot already exist
    function mintSpaceDomain(
        uint64 creatorId,
        uint64 parentSpaceId,
        string calldata domainName,
        uint64 expireSeconds
    ) public override checkDomainNameLength(domainName) returns (uint64) {
        uint64 spaceId = uint64(_spaceIds.current());
        string memory fullDomainName = domainName;
        if (parentSpaceId != 0) {
            string memory parentDomain = getDomainNameById(parentSpaceId);
            fullDomainName = spliceDomainName(domainName, parentDomain);
        }

        require(spaceDomainIds[fullDomainName] == 0, "The domain name already exists");
        
        spaceDomains[spaceId] = SpaceDomain({
            creatorId: creatorId,
            userId: creatorId,
            expireSeconds: getBlockTimestamp() + expireSeconds,
            parentSpaceId: parentSpaceId,
            domainName: domainName
        });

        spaceDomainIds[fullDomainName] = spaceId;
        approvals[spaceId] = msg.sender;

        _spaceIds.increment();

        emit MintSpaceDomain(msg.sender, parentSpaceId, domainName, expireSeconds);
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
    function updateChildDomainName(
        uint64 spaceId,
        string calldata oldDomainName,
        string calldata newDomainName
    ) public override checkDomainNameLength(newDomainName){
        require(approvals[spaceId] == msg.sender, "Only the holder can update the domain name");
        require(spaceDomains[spaceId].parentSpaceId != 0, "Only subdomains are allowed to be modified" );

        /// Obtain the parent domain name through the parent domain name id
        string memory parentDomain = getDomainNameById(spaceDomains[spaceId].parentSpaceId);
        /// Splicing the parent domain name and the new domain name into a new full domain name
        string memory fullDomainName = spliceDomainName(newDomainName, parentDomain);
        /// The new full domain name cannot already exist
        require(spaceDomainIds[fullDomainName] == 0, "The domain name already exists");

        /// Get the original full domain name
        string memory oldFullDomainName = spliceDomainName(oldDomainName, parentDomain);
        
        /// Delete the original domain name
        delete(spaceDomainIds[oldFullDomainName]);

        /// change domain name
        spaceDomains[spaceId].domainName = newDomainName;
        spaceDomainIds[fullDomainName] = spaceId;

        emit UpdataDomainName(spaceId, fullDomainName);
    }

    /// @notice Update the expiration time of a space with the given space ID
    /// @param spaceId The ID of the space to update
    /// @param newExpireSeconds The new expiration time, in seconds, for the space
    /// Requirements:
    /// - The caller must be authorized to update the space
    function updateExpireSeconds(uint64 spaceId, uint64 newExpireSeconds) public override {
        require(approvals[spaceId] == msg.sender, "Only the holder can update the expiration time");
        uint64 expireSeconds = getBlockTimestamp() + newExpireSeconds;
        spaceDomains[spaceId].expireSeconds = expireSeconds;
        emit UpdataExpriceTime(msg.sender, spaceId, expireSeconds);
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

    function approve(address operator, uint64 spaceId) public override {
        require(approvals[spaceId] == msg.sender, "Only the authorizer can approve an operator");
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
    function rentSpace(uint64 spaceId, uint64 userId, address userAddr) public override {
        require(approvals[spaceId] == msg.sender, "Only the authorizer can rent a space");
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
    function returnSpace(uint64 userId, uint64 spaceId) public override {
        require(spaceDomains[spaceId].expireSeconds < getBlockTimestamp(), "Space Domain Name is not expired");
        require(spaceDomains[spaceId].creatorId == userId, "Must be the creator to call");
        spaceDomains[spaceId].userId = userId;
        approvals[spaceId] = msg.sender;
    }

    /// @dev Splicing the parent domain name and subdomain name together
    function spliceDomainName(
        string calldata subdomain,
        string memory parentDomain
    ) internal pure returns (string memory) {
        return string(abi.encodePacked(subdomain, ".", parentDomain));
    }

    /// @dev Obtain the domain name through spaceid (domain name id)
    function getDomainNameById(uint64 spaceId) internal view returns (string memory) {
        return spaceDomains[spaceId].domainName;
    }

    /// @dev Get the current blockchain timestamp
    function getBlockTimestamp() public view returns (uint64) {
        return uint64(block.timestamp);
    }
}