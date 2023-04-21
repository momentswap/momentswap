// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/proxy/Proxy.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Upgrade.sol";

contract ProxySpaceFNS is Proxy, ERC1967Upgrade, Initializable {
    using Counters for Counters.Counter;
    Counters.Counter public _spaceIds;
    struct SpaceDomain {
        uint64 creatorId;
        uint64 userId;
        uint64 expireSeconds;
        uint64 primarySpaceId;
        string domainName;
    }
    mapping(uint64 => SpaceDomain) public spaceDomains;
    mapping(string => uint64) public spaceDomainIds;
    address public caller;

    error NotAdmin();
    /// @notice The caller must have admin
    modifier onlyAdmin() {
        if (msg.sender != _getAdmin()) {
            revert NotAdmin();
        }
        _;
    }

    ///  @dev Initialization function, setting the logical contract address, can only be called once
    function initialize(address _logic) public initializer() {
        _changeAdmin(msg.sender);
        _upgradeTo(_logic);
    }
    
    ///  @dev Returns the current implementation address.
    function _implementation() internal view virtual override returns (address impl) {
        return ERC1967Upgrade._getImplementation();
    }

    /// @dev update Implementation
    function updateImplementation(address _logic) public onlyAdmin {
        _upgradeTo(_logic);
    }

    /// @notice set admin address
    function setAdmin(address newAdmin) public  onlyAdmin {
        _changeAdmin(newAdmin);
    }

    /// @notice get implementation address
    function getImplementation() public view onlyAdmin returns (address) {
        return StorageSlot.getAddressSlot(_IMPLEMENTATION_SLOT).value;
    }

    /// @notice get admin address
    function getAdmin() public view returns (address) {
        return _getAdmin();
    }

    // function _beforeFallback() internal override {
    //     require(msg.sender != _getAdmin(), "Cannot call fallback function from the proxy admin");
    //     super._beforeFallback();
    // }
}
