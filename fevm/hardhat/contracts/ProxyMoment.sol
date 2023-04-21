// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/proxy/Proxy.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Upgrade.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {IMoment, MomentData, CommentData} from "./interfaces/IMoment.sol";

contract ProxyMoment is Proxy, ERC1967Upgrade, Initializable, ERC721URIStorage {
    /// @notice Total number of moments created.
    uint120 public totalMomentCount;

    /// @notice Total number of comments created.
    uint128 public totalCommentCount;

    /// @notice Mapping of moment IDs to MomentData struct.
    mapping(uint120 => MomentData) public moments;

    /// @notice Mapping of comment IDs to CommentData struct.
    mapping(uint128 => CommentData) public comments;

    /// @notice Mapping of moment IDs to addcount ID of users who liked a moment.
    mapping(uint120 => uint64[]) public likes;

    /// @notice Mapping of moment IDs to IDs of comments made on a moment.
    mapping(uint120 => uint128[]) public commentsOnMoment;

    /// @notice Address that can call functions with onlyCaller modifier.
    address public caller;

    constructor() ERC721("Moment NFTs", "MMT") {}

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
        
    ///  @notice Returns the current implementation address.
    function _implementation() internal view virtual override returns (address impl) {
        return ERC1967Upgrade._getImplementation();
    }
    /// @notice update Implementation
    function updateImplementation(address _logic) public onlyAdmin {
        _upgradeTo(_logic);
    }

    /// @notice set admin address
    function setAdmin(address newAdmin) public  onlyAdmin {
        _changeAdmin(newAdmin);
    }

    /// @notice get implementation address
    function getImplementation() public onlyAdmin returns (address) {
        return StorageSlot.getAddressSlot(_IMPLEMENTATION_SLOT).value;
    }

    /// @notice get admin address
    function getAdmin() public view returns (address) {
        return _getAdmin();
    }
}