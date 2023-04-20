// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IAccount.sol";
import {IMoment} from "./interfaces/IMoment.sol";
import {ISpaceFNS} from "./interfaces/ISpaceFNS.sol";

/// @notice This contract implements the IAccount interface and provides functionality for managing accounts.
contract Account is IAccount, Ownable {

    /// @notice Error to be thrown when an account already exists for the given address.
    error AccountAlreadyExists();

    /// @notice Error to be thrown when an account is not found.
    error AccountNotFound();

    /// @notice Error to be thrown when an unauthorized user tries to access some functions for Account contract.
    error Unauthorized();

    /// @notice Error to be thrown when the maximum number of allowed sub-space domains has been reached.
    error MaximumNumberOfSpaceDomainsReached();

    /// @notice Error to be thrown when a Space domain has expired.
    error SpaceDomainHasExpired();

    /// @notice Error to be thrown when a Space domain has not expired.
    error SpaceDomainHasNotExpired();

    error Unapproved();

    error NotUser();

    /// @notice Maximum number of allowed sub-space domains for an account.
    uint64 public subSpaceDomainLimit;

    /// @notice Total number of created accounts.
    uint64 public totalAccountCount;


    mapping(uint64 => address) private approvals;

    /// @notice Mapping of addresses to account IDs.
    mapping(address => uint64) public accountIds;

    /// @notice Mapping of account IDs to account data.
    mapping(uint64 => AccountData) public accounts;

    /// @notice The `IMoment` contract that provides the current timestamp.
    IMoment public immutable moment;

    /// @notice The `ISpaceFNS` contract that manages the Space FNS.
    ISpaceFNS public immutable spaceFNS;

    /// @notice Modifier to check if the caller's address is registered as an account.
    modifier checkRegistered() {
        if (accountIds[tx.origin] == 0) revert AccountNotFound();
        _;
    }

    /// @notice The caller must have permission
    modifier onlyAppover(uint64 spaceId){
        if (getApproved(spaceId) != msg.sender) {
            revert Unapproved();
        }
        _;
    }

    /// @notice The caller must have permission
    modifier onlySpaceUser(uint64 spaceId) {
        if (spaceFNS.getSpaceDomainUserId(spaceId) != accountIds[msg.sender]) {
            revert NotUser();
        }
        _;
    }

    /// @notice Constructor that initializes the `IMoment` contract and sets the maximum number of allowed sub-space domains.
    /// @param _moment The `IMoment` contract that provides the current timestamp.
    /// @param _spaceFNS The `ISpaceFNS` contract that manages the Space FNS.
    constructor(IMoment _moment, ISpaceFNS _spaceFNS) {
        subSpaceDomainLimit = 5;
        moment = _moment;
        spaceFNS = _spaceFNS;
    }

    /// @notice Checks if the caller is the creator of the specified space.
    /// @param spaceId The ID of the space to check.
    /// @return A boolean value indicating whether the caller is the space creator or not.
    function isSpaceCreator(uint64 spaceId) public view checkRegistered returns (bool) {
        return spaceFNS.getSpaceDomainCreatorId(spaceId) == accountIds[tx.origin];
    }

    /// @notice Gets the address approved to act on behalf of a space.
    /// @param spaceId The ID of the space.
    /// @return The address approved to act on behalf of the space.
    function getApproved(uint64 spaceId)  public view override returns (address) {
        return approvals[spaceId];
    }

    /// @notice Returns the account ID of the given address.
    /// @dev If an address does not have an account, it is omitted from the result.
    /// @param accountAddress The address for which to retrieve the account ID.
    /// @return An account ID corresponding to the given address.
    function getAccountId(address accountAddress) public view returns (uint64) {
        return accountIds[accountAddress];
    }

    /// @notice Returns the account IDs of the given addresses.
    /// @dev If an address does not have an account, it is omitted from the result.
    /// @param addressArray The list of addresses for which to retrieve the account IDs.
    /// @return An array of account IDs corresponding to the given addresses.
    function batchGetAccountId(address[] calldata addressArray) public view returns (uint64[] memory) {
        uint64[] memory _accountIds = new uint64[](addressArray.length);
        for (uint256 i = 0; i < addressArray.length; i++) {
            _accountIds[i] = getAccountId(addressArray[i]);
        }
        return _accountIds;
    }

    /// @notice Returns the address corresponding to the given account ID.
    /// @dev If an account ID does not exist, it is omitted from the result.
    /// @param accountId The account ID for which to retrieve the address.
    /// @return An address corresponding to the given account ID.
    function getAddress(uint64 accountId) public view returns (address) {
        return accounts[accountId].owner;
    }

    /// @notice Returns the addresses corresponding to the given account IDs.
    /// @dev If an account ID does not exist, it is omitted from the result.
    /// @param accountIdArray The list of account IDs for which to retrieve the addresses.
    /// @return An array of addresses corresponding to the given account IDs.
    function batchGetAddress(uint64[] calldata accountIdArray) public view returns (address[] memory) {
        address[] memory addresses = new address[](accountIdArray.length);
        for (uint256 i = 0; i < accountIdArray.length; i++) {
            addresses[i] = getAddress(accountIdArray[i]);
        }
        return addresses;
    }

    /// @notice Returns the account data for the given account ID.
    /// @dev If an account ID does not exist, it is omitted from the result.
    /// @param accountId The account ID for which to retrieve the account data.
    /// @return An account data corresponding to the given account ID.
    function getAccountData(uint64 accountId) public view returns (AccountData memory) {
        return accounts[accountId];
    }

    /// @notice Returns the account data for the given account IDs.
    /// @dev If an account ID does not exist, it is omitted from the result.
    /// @param accountIdArray The list of account IDs for which to retrieve the account data.
    /// @return An array of account data corresponding to the given account IDs.
    function batchGetAccountData(uint64[] calldata accountIdArray) public view returns (AccountData[] memory) {
        AccountData[] memory accountData = new AccountData[](accountIdArray.length);
        for (uint256 i = 0; i < accountIdArray.length; i++) {
            accountData[i] = getAccountData(accountIdArray[i]);
        }
        return accountData;
    }

    /// @notice Returns the avatar URI for the given account ID.
    /// @dev If an account ID does not exist, it is omitted from the result.
    /// @param accountId The account ID for which to retrieve the avatar URI.
    /// @return An avatar URI corresponding to the given account ID.
    function getAvatarURI(uint64 accountId) public view returns (string memory) {
        return accounts[accountId].avatarURI;
    }

    // TODO: Transfer All to Events
    /// @notice Returns the avatar URIs for the given account IDs.
    /// @dev If an account ID does not exist, it is omitted from the result.
    /// @param accountIdArray The list of account IDs for which to retrieve the avatar URIs.
    /// @return An array of avatar URIs corresponding to the given account IDs.
    function batchGetAvatarURIs(uint64[] calldata accountIdArray) public view returns (string[] memory) {
        string[] memory avatarURIs = new string[](accountIdArray.length);
        for (uint256 i = 0; i < accountIdArray.length; i++) {
            avatarURIs[i] = getAvatarURI(accountIdArray[i]);
        }
        return avatarURIs;
    }

    // TODO: Transfer All to Events
    /// @notice Returns the moment IDs associated with the given account ID.
    /// @param accountId The ID of the account for which to retrieve the moment IDs.
    /// @return An array of moment IDs associated with the given account ID.
    function getMomentIds(uint64 accountId) external view returns (uint120[] memory) {
        return accounts[accountId].momentIds;
    }

    // TODO: Transfer All to Events
    /// @notice Returns the comment IDs associated with the given account ID.
    /// @param accountId The ID of the account for which to retrieve the comment IDs.
    /// @return An array of comment IDs associated with the given account ID.
    function getCommentIds(uint64 accountId) external view returns (uint128[] memory) {
        return accounts[accountId].commentIds;
    }

    // TODO: Transfer All to Events
    /// @notice Returns the moment IDs that the account has liked.
    /// @param accountId The ID of the account for which to retrieve the liked moment IDs.
    /// @return An array of moment IDs that the account has liked.
    function getLikedMomentIds(uint64 accountId) external view returns (uint120[] memory) {
         return accounts[accountId].likedMomentIds;
    }

    /// @notice Returns the IDs of the spaces created by the given account ID.
    /// @param accountId The ID of the account for which to retrieve the created space IDs.
    /// @return An array of space IDs created by the given account ID.
    function getCreatedSpaceIds(uint64 accountId) external view returns (uint64[] memory) {
         return accounts[accountId].createdSpaceIds;
    }

    /// @notice Returns the IDs of the spaces rented by the given account ID.
    /// @param accountId The ID of the account for which to retrieve the rented space IDs.
    /// @return An array of space IDs rented by the given account ID.
    function getRentedSpaceIds(uint64 accountId) external view returns (uint64[] memory) {
        return accounts[accountId].rentedSpaceIds;
    }

    function _approve(address operator, uint64 spaceId) internal virtual {
        approvals[spaceId] = operator;
        emit Approval(msg.sender, operator, spaceId);
    }

    /// @notice Authorized to the operator
    /// @param operator The address of the operator to approve
    /// @param spaceId The ID of the space to approve the operator for
    /// Requirements:
    /// - The caller must be authorized to approve an operator for the space
     function approve(address operator, uint64 spaceId) public override onlySpaceUser(spaceId) {
        _approve(operator, spaceId);
    }

    /// @notice Creates a new account with the given domain name and avatar URI.
    /// @param domainName The domain name to associate with the account.
    /// @param avatarURI The URI of the avatar to associate with the account.
    /// @return The ID of the newly created account.
    function createAccount(
        string calldata domainName,
        string calldata avatarURI
    ) external returns (uint64) {
        if (accountIds[msg.sender] != 0) revert AccountAlreadyExists();

        uint64 accountId = ++totalAccountCount;
        accountIds[msg.sender] = accountId;
        uint64 spaceId = spaceFNS.createSpaceDomain(accountId, 0, domainName, 0);

        AccountData storage account = accounts[accountId];
        account.owner = msg.sender;
        account.avatarURI = avatarURI;
        account.createdSpaceIds = [spaceId];

        emit CreateAccount(accountId, msg.sender, domainName, avatarURI);
        return accountId;
    }

    /// @notice Cancels the account associated.
    function cancelAccount() external checkRegistered {
        emit CancelAccount(accountIds[msg.sender]);

        delete accounts[accountIds[msg.sender]];
        delete accountIds[msg.sender];
    }

    // TODO: Transfer All to Events
    /// @notice Updates the avatar URI associated with the calling account.
    /// @param avatarURI The new avatar URI to associate with the calling account.
    function updateAvatarURI(string calldata avatarURI) public checkRegistered {
        accounts[accountIds[msg.sender]].avatarURI = avatarURI;

        emit UpdateAvatarURI(accountIds[msg.sender], avatarURI);
    }

    // TODO: Transfer All to Events
    /// @notice Creates a new moment with the given metadata URI.
    /// @param metadataURI The URI of the metadata to associate with the moment.
    /// @return The ID of the newly created moment.
    function createMoment(string calldata metadataURI) external checkRegistered returns (uint120) {
        uint120 momentId = moment.createMoment(accountIds[msg.sender], metadataURI);
        accounts[accountIds[msg.sender]].momentIds.push(momentId);

        emit CreateMoment(accountIds[msg.sender], momentId, metadataURI);
        return momentId;
    }

    // TODO: Transfer All to Events
    /// @notice Removes the moment associated with the given moment ID.
    /// @dev The calling account must be the owner of the moment in order to remove it.
    /// @param momentId The ID of the moment to remove.
    function removeMoment(uint120 momentId) external checkRegistered {
        uint120[] storage momentIds = accounts[accountIds[msg.sender]].momentIds;
        for (uint256 i = 0; i < momentIds.length; i++) {
            if (momentIds[i] == momentId) {
                momentIds[i] = momentIds[momentIds.length - 1];
                momentIds.pop();
                moment.removeMoment(momentId);

                emit RemoveMoment(accountIds[msg.sender], momentId);
                break;
            }
        }
    }

    // TODO: Transfer All to Events
    /// @notice Adds a like to the moment associated with the given moment ID from the calling account.
    /// @dev The calling account must not have already liked the moment.
    /// @param momentId The ID of the moment to like.
    function likeMoment(uint120 momentId) external checkRegistered {
        accounts[accountIds[msg.sender]].likedMomentIds.push(momentId);
        moment.addLike(momentId, accountIds[msg.sender]);

        emit LikeMoment(accountIds[msg.sender], momentId);
    }

    // TODO: Transfer All to Events
    /// @notice Cancels the like from the calling account to the moment associated with the given moment ID.
    /// @dev The calling account must have already liked the moment.
    /// @param momentId The ID of the moment to cancel the like for.
    function cancelLikeMoment(uint120 momentId) external checkRegistered {
        uint120[] storage likedMomentIds = accounts[accountIds[msg.sender]].likedMomentIds;
        for (uint256 i = 0; i < likedMomentIds.length; i++) {
            if (likedMomentIds[i] == momentId) {
                likedMomentIds[i] = likedMomentIds[likedMomentIds.length - 1];
                likedMomentIds.pop();
                moment.removeLike(momentId, accountIds[msg.sender]);

                emit CancelLikeMoment(accountIds[msg.sender], momentId);
                break;
            }
        }
    }

    // TODO: Transfer All to Events
    /// @notice Creates a new comment on the moment associated with the given moment ID with the given comment text.
    /// @param momentId The ID of the moment to create the comment on.
    /// @param commentText The text of the comment to create.
    /// @return The ID of the newly created comment.
    function createComment(
        uint120 momentId,
        string calldata commentText
    ) external checkRegistered returns (uint128) {
        uint128 commentId =  moment.createComment(momentId, accountIds[msg.sender], commentText);
        accounts[accountIds[msg.sender]].commentIds.push(commentId);

        emit CreateComment(accountIds[msg.sender], commentId, commentText);
        return commentId;
    }

    // TODO: Transfer All to Events
    /// @notice Removes the comment associated with the given comment ID.
    /// @dev The calling account must be the owner of the comment in order to remove it.
    /// @param commentId The ID of the comment to remove.
    function removeComment(uint128 commentId) external {
        uint128[] storage commentIds = accounts[accountIds[msg.sender]].commentIds;
        for (uint256 i = 0; i < commentIds.length; i++) {
            if (commentIds[i] == commentId) {
                commentIds[i] = commentIds[commentIds.length - 1];
                commentIds.pop();
                moment.removeComment(commentId);

                emit RemoveComment(accountIds[msg.sender], commentId);
                break;
            }
        }
    }

    /// @notice Creates a new sub space domain with the given domain name and expire time.
    /// @dev The calling account must own the primary space in order to create a sub space domain.
    /// @param primarySpaceId The ID of the primary space to create the sub space domain for.
    /// @param domainName The domain name to associate with the sub space domain.
    /// @param expireSeconds The number of seconds until the sub space domain expires.
    /// @return The ID of the newly created sub space domain.
    function createSubSpaceDomain(
        uint64 primarySpaceId,
        string calldata domainName,
        uint64 expireSeconds
    ) external checkRegistered returns (uint64) {
        if (accounts[accountIds[msg.sender]].createdSpaceIds.length > subSpaceDomainLimit) {
            revert MaximumNumberOfSpaceDomainsReached();
        }

        uint64 spaceId = spaceFNS.createSpaceDomain(accountIds[msg.sender], primarySpaceId, domainName, expireSeconds);
        accounts[accountIds[msg.sender]].createdSpaceIds.push(spaceId);

        emit CreateSubSpaceDomain(primarySpaceId, spaceId, domainName, expireSeconds);
        return spaceId;
    }

    /// @notice Rents the space with the given space ID.
    /// @param spaceId The ID of the space to return.
    function rentSpace(uint64 userId, uint64 spaceId) external onlyAppover(spaceId) {
        spaceFNS.rentSpace(spaceId, userId);
        accounts[userId].rentedSpaceIds.push(spaceId);

        delete approvals[spaceId];
    }

    /// @notice Function for returning a rented space domain.
    /// @param user The address of the account that rented the space domain.
    /// @param spaceId The ID of the space domain to return.
    function returnSpace(address user, uint64 spaceId) external {
        if (accountIds[user] == 0) revert AccountNotFound();
        if (!spaceFNS.isExpired(spaceId)) revert SpaceDomainHasNotExpired();

        uint64[] storage rentedSpaceIds = accounts[accountIds[user]].rentedSpaceIds;
        for (uint256 i = 1; i < rentedSpaceIds.length; i++) {
            if (rentedSpaceIds[i] == spaceId) {
                rentedSpaceIds[i] = rentedSpaceIds[rentedSpaceIds.length - 1];
                rentedSpaceIds.pop();
                spaceFNS.returnSpace(spaceId);

                emit ReturnSpace(accountIds[user], spaceId);
                break;
            }
        }
    }

    /// @notice Function for updating the domain name of a rented space domain.
    /// @param spaceId The ID of the rented space domain to update.
    /// @param domainName The new domain name to set.
    function updateRentedSpaceDomainName(uint64 spaceId, string calldata domainName) external checkRegistered onlySpaceUser(spaceId) {
        spaceFNS.updateSubDomainName(spaceId, domainName);

        emit UpdateRentedSpaceDomainName(spaceId, domainName);
    }

    /// @notice Update the expiration time of a space with the given space ID
    /// @param spaceId The ID of the space to update
    /// @param expireSeconds The number of seconds until the sub space domain expires.
    /// Requirements:
    /// - The caller must be authorized to update the space
    function updateExpireSeconds(uint64 spaceId, uint64 expireSeconds) public override onlyAppover(spaceId) {
        spaceFNS.updateExpireSeconds(spaceId, expireSeconds);

        emit UpdateExpireSeconds(spaceId, expireSeconds);
    }

    /// @notice Function for setting the maximum number of sub-space domains allowed for an account.
    /// @param limit The maximum number of sub-space domains allowed.
    function setSubSpaceDomainLimit(uint64 limit) external onlyOwner {
        subSpaceDomainLimit = limit;
    }
}