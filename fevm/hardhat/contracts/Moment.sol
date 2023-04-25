// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {IMoment} from "./interfaces/IMoment.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";

/// @notice This contract implements the IMoment interface and provides functionality for managing moments.
contract Moment is IMoment, Initializable, OwnableUpgradeable, ERC721URIStorageUpgradeable {

    /// @notice Error to be thrown when the caller is not authorized to perform an action.
    error Unauthorized();

    /// @notice Total number of moments created.
    uint120 public totalMomentCount;

    /// @notice Total number of comments created.
    uint128 public totalCommentCount;

    /// @notice Address that can call functions with onlyCaller modifier.
    address public caller;

    /// @notice Modifier that only allows the `caller` address to call a function.
    modifier onlyCaller() {
        if (msg.sender != caller) revert Unauthorized();
        _;
    }

    /// @notice initialize function that initializes the ERC721 token with the name "Moment NFTs" and the symbol "MMT".
    function initialize() public initializer {
        __Ownable_init();
        __ERC721_init("Moment NFTs", "MMT");
    }

    /// @notice Creates a new moment and returns its ID.
    /// @param metadataURI The URI of the metadata associated with the moment.
    /// @return The ID of the newly created moment.
    function createMoment(string calldata metadataURI) external onlyCaller returns (uint120) {
        uint120 momentId = ++totalMomentCount;
        _mint(tx.origin, momentId);
        _setTokenURI(momentId, metadataURI);
        return momentId;
    }

    /// @notice Removes a moment with the specified ID.
    /// @param momentId The ID of the moment to be removed.
    function removeMoment(uint120 momentId) external onlyCaller {
        _burn(momentId);
    }

    /// @notice Creates a new comment for the specified moment and returns its ID.
    /// @return The ID of the newly created comment.
    function createComment() external onlyCaller returns (uint128) {
        uint128 commentId = ++totalCommentCount;
        return commentId;
    }

    /// @notice Allows the contract owner to set the caller address.
    /// @param _caller The new caller address to be set.
    /// @dev Only the contract owner can call this function.
    function setCaller(address _caller) external onlyOwner {
        caller = _caller;
    }
}