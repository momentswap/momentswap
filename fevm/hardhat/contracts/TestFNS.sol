// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./interfaces/ISpaceFNS.sol";

contract TestSpaceFNS {
    function TestMintSpaceDomain(
        address spaceAddr,
        uint64 creatorId,
        uint64 primarySpaceId,
        string calldata domainName,
        uint64 expireSeconds
    ) public returns (uint64)  {
        uint64 id = ISpaceFNS(spaceAddr).createSpaceDomain(creatorId, primarySpaceId, domainName, expireSeconds);
        return id;
    }

    function TestUpdateSubDomainName(
        address spaceAddr,
        uint64 spaceId,
        string calldata newDomainName
    ) public   {
        ISpaceFNS(spaceAddr).updateSubDomainName(spaceId, newDomainName);
    }

    function TestUpdateExpireSeconds(
        address spaceAddr,
        uint64 spaceId, uint64 newExpireSeconds
    ) public {
        ISpaceFNS(spaceAddr).updateExpireSeconds(spaceId, newExpireSeconds);
    }

    function TestReturnSpace(
        address spaceAddr,
        uint64 spaceId
    ) public  {
        ISpaceFNS(spaceAddr).returnSpace(spaceId);
    }

}