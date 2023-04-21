// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./interfaces/ISpaceFNS.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Upgrade.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

contract SpaceFNS is ISpaceFNS, ERC1967Upgrade, Initializable {
    using Counters for Counters.Counter;
    Counters.Counter public _spaceIds;

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
            revert DomainNameError();
        }
        _;
    }

    /// Must be called by the Account contract
    modifier onlyCaller() {
        if (caller != msg.sender) {
            revert Unauthorized();
        }
        _;
    }

    modifier OnlyAdmin() {
        if (msg.sender == _getAdmin()) {
            _; 
        } else {
            revert NotAdmin();
        }
    }

    /// @notice Error to be thrown when an unauthorized user tries to access some functions for Account contract.
    error Unauthorized();
    error NotExpired();
    error NotCreator();
    error NotSubdomain();
    error DomainAlreadyExists();
    error DomainNameError();
    error DomainInUse();
    error DomainNotInUse();
    error NotAdmin();

    /// id(spaceId) ==> SpaceDomain struct
    mapping(uint64 => SpaceDomain) public spaceDomains;

    /// domainName ==> spaceId
    mapping(string => uint64) public spaceDomainIds;

    /// @notice Address that can call functions with onlyCaller modifier.
    address public caller;

    // constructor() {}

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
        bool[] memory expireds = new bool[](spaceIds.length);

        for (uint64 i = 0; i < spaceIds.length; i++) {
            expireds[i] = isExpired(spaceIds[i]);
        }

        return expireds;
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

    /// @notice Allows the contract owner to set the caller address.
    /// @param _caller The new caller address to be set.
    /// @dev Only the contract owner can call this function.
    function setCaller(address _caller) external OnlyAdmin() {
        caller = _caller;
    }

    function initSpace(address _caller) public OnlyAdmin() initializer() {
        caller = _caller;
    }

    /// @notice Creates a new Space Domain.
    /// @param creatorId The ID of the creator.
    /// @param primarySpaceId The ID of the parent space.
    /// @param domainName The name of the domain.
    /// @param expireSeconds The number of seconds until the domain expires.
    /// @return The ID of the new Space Domain.
    /// Requirements:
    /// - DomainName cannot be less than 3 and greater than 10 characters
    /// - Domain name cannot already exist
    function createSpaceDomain(
        uint64 creatorId,
        uint64 primarySpaceId,
        string calldata domainName,
        uint64 expireSeconds
    ) public override checkDomainNameLength(domainName) onlyCaller() returns (uint64) {
        _spaceIds.increment();
        uint64 spaceId = uint64(_spaceIds.current());
        string memory fullDomainName = domainName;
        if (primarySpaceId != 0) {
            string memory primaryDomain = getDomainNameById(primarySpaceId);
            fullDomainName = spliceDomainName(domainName, primaryDomain);
        }

        if (spaceDomainIds[fullDomainName] != 0) {
            revert DomainAlreadyExists();
        }

        spaceDomains[spaceId] = SpaceDomain({
            creatorId: creatorId,
            userId: creatorId,
            expireSeconds: expireSeconds,
            primarySpaceId: primarySpaceId,
            domainName: fullDomainName
        });

        spaceDomainIds[fullDomainName] = spaceId;

        return spaceId;
    }

    /// @notice Updates the name of a child domain.
    /// @param spaceId The ID of the space.
    /// Requirements:
    /// - The caller is the authorized address
    /// - Not parent domain
    /// - DomainName cannot be less than 3 and greater than 10 characters
    /// - Domain name cannot already exist
    /// - Delete the original domain name mapping
    function updateSubDomainName(
        uint64 spaceId,
        string calldata newDomainName
    ) public override checkDomainNameLength(newDomainName) onlyCaller() {
        if (spaceDomains[spaceId].primarySpaceId == 0) {
            revert NotSubdomain();
        }

        (string memory primaryDomain, string memory oldDomainName) = getPrimaryAndSubDomain(spaceId);
        string memory newFullDomainName = spliceDomainName(newDomainName, primaryDomain);

        /// The new full domain name cannot already exist
        if (spaceDomainIds[newFullDomainName] != 0) {
            revert DomainAlreadyExists();
        }

        /// Delete the original domain name
        delete(spaceDomainIds[oldDomainName]);

        /// change domain name
        spaceDomains[spaceId].domainName = newFullDomainName;
        spaceDomainIds[newFullDomainName] = spaceId;
    }

    /// @notice Update the expiration time of a space with the given space ID
    /// @param spaceId The ID of the space to update
    /// @param expireSeconds The new expiration time, in seconds, for the space
    /// Requirements:
    /// - The caller must be authorized to update the space
    function updateExpireSeconds(uint64 spaceId, uint64 expireSeconds) public override onlyCaller() {
        SpaceDomain storage spaceDomain = spaceDomains[spaceId];
        if (spaceDomain.creatorId != spaceDomain.userId) {
            revert DomainInUse();
        }

        spaceDomain.expireSeconds = expireSeconds;
    }

    /// @notice Rent a space with the given space ID to the user with the given user ID
    /// @param spaceId The ID of the space to rent
    /// @param userId The ID of the user renting the space
    /// Requirements:
    /// - The caller is the authorized address
    /// - Change the `userid` of `SpaceDomain` to the renter,
    /// - Change the authorized address of `SpaceDomain` to the address of the renter
    function rentSpace(uint64 spaceId, uint64 userId) public override onlyCaller() {
        SpaceDomain storage spaceDomain = spaceDomains[spaceId];
        if (spaceDomain.creatorId == userId) {
            revert();
        }

        spaceDomain.userId = userId;
        spaceDomain.expireSeconds += getBlockTimestamp();
    }

    /// @notice Return a space to the creator
    /// @param spaceId The ID of the space to return
    /// Requirements:
    /// - Domain name has expired
    /// - After returning, the authorization address is changed to the creator
    function returnSpace(uint64 spaceId) public override {
        if (!isExpired(spaceId)) {
            revert NotExpired();
        }

        SpaceDomain storage spaceDomain = spaceDomains[spaceId];

        if (spaceDomain.creatorId == spaceDomain.userId) {
            revert DomainNotInUse();
        }

        spaceDomain.expireSeconds = 0;
        spaceDomain.userId = spaceDomains[spaceId].creatorId;
    }

    /// @dev Splicing the parent domain name and subdomain name together
    function spliceDomainName(
        string calldata subdomain,
        string memory primaryDomain
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

    /// @dev Get primaryDomain  and subdomain by spaceId
    function getPrimaryAndSubDomain(uint64 subSpaceId) public view returns (string memory primaryDomain, string memory subdomain) {
        if (spaceDomains[subSpaceId].primarySpaceId == 0) {
            revert NotSubdomain();
        }

        primaryDomain = spaceDomains[spaceDomains[subSpaceId].primarySpaceId].domainName;
        subdomain = spaceDomains[subSpaceId].domainName;
    }
}