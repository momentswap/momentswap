// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/proxy/Proxy.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Upgrade.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";


contract ProxySpaceMarket is ReentrancyGuard, Proxy, ERC1967Upgrade, Initializable {
    struct Item {
        address seller;
        uint256 price;
    }
    address payable public beneficiary;
    uint16 public freeRate;
    uint256 totalTransactionFee;
    mapping(address => mapping(uint64 => Item)) public spaceList;
    mapping(address => uint256) public proceeds;

    modifier ifAdmin() {
        if (msg.sender == _getAdmin()) {
            _;
        } else {
            _fallback();
        }
    }

    function initialize(address _logic) public initializer() {
        _changeAdmin(msg.sender);
        _upgradeTo(_logic);
    }
    
    /**
     * @dev Returns the current implementation address.
     */
    function _implementation() internal view virtual override returns (address impl) {
        return ERC1967Upgrade._getImplementation();
    }

    function updateImplementation(address _logic) public ifAdmin {
        _upgradeTo(_logic);
    }

    function setAdmin(address newAdmin) public  ifAdmin() {
        _changeAdmin(newAdmin);
    }

    function getImplementation() public ifAdmin returns (address) {
        return StorageSlot.getAddressSlot(_IMPLEMENTATION_SLOT).value;
    }

    function getAdmin() public view returns (address) {
        return _getAdmin();
    }
}