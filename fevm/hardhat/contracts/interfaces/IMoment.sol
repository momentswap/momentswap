// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

/// @title Moment Contract Interface
/// @notice This interface defines the methods that can be called on the moment contract.
interface IMoment {
    /// @notice Creates a new moment and returns its ID.
    /// @param metadataURI The URI of the metadata associated with the moment.
    /// @return The ID of the newly created moment.
    function createMoment(string calldata metadataURI) external returns (uint120);

    /// @notice Creates a new comment for the specified moment and returns its ID.
    /// @return The ID of the newly created comment.
    function createComment() external returns (uint128);
}
