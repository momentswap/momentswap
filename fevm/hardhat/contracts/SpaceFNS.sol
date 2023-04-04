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

    /** *
     * Check domain length decorator
     */
    modifier checkDomainNameLength(string calldata domainName) {
        uint256 domainName_length = bytes(domainName).length;
        require(domainName_length >= 3 && domainName_length <= 10, "Domain name length does not meet the specification");
        _;
    }

    /**
     * id(spaceId) ==> SpaceDomain struct
     */
    mapping(uint64 => SpaceDomain) public spaceDomains;

    /**
     * domainName ==> spaceId
     */
    mapping(string => uint64) public spaceDomainIds;

    /**
     * spaceId ==> authorized address
     */
    mapping(uint64 => address) private approvals;


    function isExpired(uint64 spaceId) public view override returns (bool) {
        return spaceDomains[spaceId].expireSeconds < getBlockTimestamp();
    }

    function isExpireds(uint64[] calldata spaceIds) public view override returns (bool[] memory) {
        uint64 length = spaceIds.length;
        bool[] memory expireds = new bool[](length);

        for (uint64 i = 0; i < length; i++) {
            expireds[i] = spaceDomains[spaceIds[i]].expireSeconds < getBlockTimestamp();
        }

        return expireds;
    }
    
    function getApproved(uint64 spaceId)  public view override returns (address) {
        return approvals[spaceId];
    }


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

    function updateChildDomainName(
        uint64 spaceId,
        string calldata domainName
    ) public override checkDomainNameLength(domainName){
        require(approvals[spaceId] == msg.sender, "Only the holder can update the domain name");
        require(spaceDomains[spaceId].parentSpaceId != 0, "Only subdomains are allowed to be modified" );

        string memory oldDomainName = spaceDomains[spaceId].domainName;

        // Obtain the parent domain name through the parent domain name id
        string memory parentDomain = getDomainNameById(spaceDomains[spaceId].parentSpaceId);
        // Splicing the parent domain name and the new domain name into a new full domain name
        string memory fullDomainName = spliceDomainName(domainName, parentDomain);
        // The new full domain name cannot already exist
        require(spaceDomainIds[fullDomainName] == 0, "The domain name already exists");

        // Get the original full domain name
        string memory oldFullDomainName = spliceDomainName(oldDomainName, parentDomain);
        // Delete the original domain name
        delete(spaceDomainIds[oldFullDomainName]);

        // change domain name
        spaceDomains[spaceId].domainName = domainName;
        spaceDomainIds[fullDomainName] = spaceId;

        emit UpdataDomainName(spaceId, domainName);
    }

    function updateExpireSeconds(uint64 spaceId, uint64 newExpireSeconds) public override {
        require(approvals[spaceId] == msg.sender, "Only the holder can update the expiration time");
        uint64 expireSeconds = getBlockTimestamp() + newExpireSeconds;
        spaceDomains[spaceId].expireSeconds = expireSeconds;
        emit UpdataExpriceTime(msg.sender, spaceId, expireSeconds);
    }

    function _approve(address operator, uint64 spaceId) internal {
        approvals[spaceId] = operator;
        emit Approved(msg.sender, operator, spaceId);
    }

    function approve(address operator, uint64 spaceId) public override {
        require(approvals[spaceId] == msg.sender, "Only the authorizer can approve an operator");
        _approve(operator, spaceId);
    }

    function rentSpace(uint64 spaceId, uint64 userId, address userAddr) public override {
        require(approvals[spaceId] == msg.sender, "Only the authorizer can rent a space");
        spaceDomains[spaceId].userId = userId;
        approve(userAddr, spaceId);
    }

    function returnSpace(uint64 userId, uint64 spaceId) public override {
        require(spaceDomains[spaceId].expireSeconds < getBlockTimestamp(), "Space Domain Name is not expired");
        require(spaceDomains[spaceId].creatorId == userId, "Must be the creator to call");
        spaceDomains[spaceId].userId = userId;
        approvals[spaceId] = msg.sender;
    }

    /**
     * Splicing the parent domain name and subdomain name together
     */
    function spliceDomainName(
        string calldata subdomain,
        string memory parentDomain
    ) internal pure returns (string memory) {
        return string(abi.encodePacked(subdomain, ".", parentDomain));
    }

    /**
     * Obtain the domain name through spaceid (domain name id)
     */
    function getDomainNameById(uint64 spaceId) internal view returns (string memory) {
        return spaceDomains[spaceId].domainName;
    }

    /**
     * @dev Get the current blockchain timestamp
     */
    function getBlockTimestamp() public view returns (uint64) {
        return uint64(block.timestamp);
    }
}