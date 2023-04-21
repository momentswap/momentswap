// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./interfaces/IAccount.sol";
import {IMoment} from "./interfaces/IMoment.sol";
import {ISpaceFNS} from "./interfaces/ISpaceFNS.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/proxy/Proxy.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Upgrade.sol";


contract ProxyAccount is Proxy, ERC1967Upgrade, Initializable {
    uint64 public subSpaceDomainLimit;
    uint64 public totalAccountCount;
    mapping(uint64 => address) private approvals;
    mapping(address => uint64) public accountIds;
    mapping(uint64 => AccountData) public accounts;
    IMoment public moment;
    ISpaceFNS public spaceFNS;

    /**
   * @dev Modifier to check whether the `msg.sender` is the admin.
   * If it is, it will run the function. Otherwise, it will delegate the call
   * to the implementation.
   */
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