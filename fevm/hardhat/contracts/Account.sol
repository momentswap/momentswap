// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./interfaces/IAccount.sol";
import {IMoment} from "./interfaces/IMoment.sol";
import {ISpaceFNS} from "./interfaces/ISpaceFNS.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/// @notice This contract implements the IAccount interface and provides functionality for managing accounts.
contract Account is IAccount, Initializable, OwnableUpgradeable {

    /// @notice Error to be thrown when an account already exists for the given address.
    error AccountAlreadyExists();

    /// @notice Error to be thrown when an account is not found.
    error AccountNotFound();

    /// @notice Error to be thrown when the maximum number of allowed sub-space domains has been reached.
    error MaximumNumberOfSpaceDomainsReached();

    /// @notice Error to be thrown when a Space domain has not expired.
    error SpaceDomainHasNotExpired();

    /// @notice Error to be thrown when an operation requires approval but the approval has not been given yet.
    error Unapproved();

    /// @notice Error to be thrown when a function is called by a non-user account.
    error NotUser();

    /// @notice Error to be thrown when a user attempts to mint without paying the required fee.
    error MintFeeNotPaid();

    /// @notice Maximum number of allowed sub-space domains for an account.
    uint64 public subSpaceDomainLimit;

    /// @notice Total number of created accounts.
    uint64 public totalAccountCount;

    /// @notice The fee charged for minting tokens.
    uint256 public mintFee;

    /// @notice The address that will receive the fees for minting tokens.
    address payable public beneficiary;

    /// @notice Mapping of space id to SpaceMarket address.
    mapping(uint64 => address) private approvals;

    /// @notice Mapping of addresses to account IDs.
    mapping(address => uint64) public accountIds;

    /// @notice Mapping of account IDs to account data.
    mapping(uint64 => AccountData) public accounts;

    /// @notice The `IMoment` contract that manages the Moment NFT.
    IMoment public moment;

    /// @notice The `ISpaceFNS` contract that manages the Space Domain.
    ISpaceFNS public spaceFNS;

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

    /// @notice initialize function that initializes the `IMoment` contract and sets the maximum number of allowed sub-space domains.
    /// @param _moment The `IMoment` contract that provides the current timestamp.
    /// @param _spaceFNS The `ISpaceFNS` contract that manages the Space FNS.
    function initialize(IMoment _moment, ISpaceFNS _spaceFNS) public initializer {
        __Ownable_init();
        moment = _moment;
        spaceFNS = _spaceFNS;
        mintFee = 0.0003 ether;
        subSpaceDomainLimit = 5;
        beneficiary = payable(msg.sender);
    }

    /// @notice Checks if the caller is the creator of the specified space.
    /// @param spaceId The ID of the space to check.
    /// @return A boolean value indicating whether the caller is the space creator or not.
    /// @return The address of the space creator.
    function checkSpaceCreator(uint64 spaceId) public view checkRegistered returns (bool, address) {
        uint64 creatorId = spaceFNS.getSpaceDomainCreatorId(spaceId);
        return (creatorId == accountIds[tx.origin], accounts[creatorId].owner);
    }

    /// @notice Gets the address approved to act on behalf of a space.
    /// @param spaceId The ID of the space.
    /// @return The address approved to act on behalf of the space.
    function getApproved(uint64 spaceId)  public view override returns (address) {
        return approvals[spaceId];
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
    function batchGetAccountData(uint64[] calldata accountIdArray) public view returns (AccountData[] memory){
        AccountData[] memory accountData = new AccountData[](accountIdArray.length);
        for (uint256 i = 0; i < accountIdArray.length; i++) {
            accountData[i] = accounts[accountIdArray[i]];
        }
        return accountData;
    }

    /// @notice Returns the account IDs of the given addresses.
    /// @dev If an address does not have an account, it is omitted from the result.
    /// @param addressArray The list of addresses for which to retrieve the account IDs.
    /// @return An array of account IDs corresponding to the given addresses.
    function batchGetAccountId(address[] calldata addressArray) public view returns (uint64[] memory) {
        uint64[] memory _accountIds = new uint64[](addressArray.length);
        for (uint256 i = 0; i < addressArray.length; i++) {
            _accountIds[i] = accountIds[addressArray[i]];
        }
        return _accountIds;
    }

    /// @notice Returns the addresses corresponding to the given account IDs.
    /// @dev If an account ID does not exist, it is omitted from the result.
    /// @param accountIdArray The list of account IDs for which to retrieve the addresses.
    /// @return An array of addresses corresponding to the given account IDs.
    function batchGetAddress(uint64[] calldata accountIdArray) public view returns (address[] memory) {
        address[] memory addresses = new address[](accountIdArray.length);
        for (uint256 i = 0; i < accountIdArray.length; i++) {
            addresses[i] = accounts[accountIdArray[i]].owner;
        }
        return addresses;
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

    /// @notice Authorized to the operator
    /// @param operator The address of the operator to approve
    /// @param spaceId The ID of the space to approve the operator for
    /// Requirements:
    /// - The caller must be authorized to approve an operator for the space
     function approve(address operator, uint64 spaceId) public override onlySpaceUser(spaceId) {
        approvals[spaceId] = operator;
        emit Approval(msg.sender, operator, spaceId);
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
        account.createdSpaceIds = [spaceId];

        emit CreateAccount(accountId, spaceId, domainName, avatarURI, msg.sender);
        return accountId;
    }

    /// @notice Cancels the account associated.
    function cancelAccount() external checkRegistered {
        emit CancelAccount(accountIds[msg.sender]);

        delete accounts[accountIds[msg.sender]];
        delete accountIds[msg.sender];
    }

    /// @notice Updates the avatar URI associated with the calling account.
    /// @param avatarURI The new avatar URI to associate with the calling account.
    function updateAvatarURI(string calldata avatarURI) public checkRegistered {
        emit UpdateAvatarURI(accountIds[msg.sender], avatarURI);
    }

    /// @notice Creates a new moment with the given metadata URI.
    /// @param metadataURI The URI of the metadata to associate with the moment.
    function createMoment(string calldata metadataURI) external payable checkRegistered {
        if (msg.value < mintFee) revert MintFeeNotPaid();
        beneficiary.transfer(msg.value);

        uint120 momentId = moment.createMoment(metadataURI);
        accounts[accountIds[msg.sender]].momentIds.push(momentId);

        emit CreateMoment(accountIds[msg.sender], momentId, metadataURI);
    }

    /// @notice Removes the moment associated with the given moment ID.
    /// @dev The calling account must be the owner of the moment in order to remove it.
    /// @param momentId The ID of the moment to remove.
    function removeMoment(uint120 momentId) external checkRegistered {
        uint120[] storage momentIds = accounts[accountIds[msg.sender]].momentIds;
        for (uint256 i = 0; i < momentIds.length; i++) {
            if (momentIds[i] == momentId) {
                momentIds[i] = momentIds[momentIds.length - 1];
                momentIds.pop();

                emit RemoveMoment(accountIds[msg.sender], momentId);
                break;
            }
        }
    }

    /// @notice Adds a like to the moment associated with the given moment ID from the calling account.
    /// @dev The calling account must not have already liked the moment.
    /// @param momentId The ID of the moment to like.
    function likeMoment(uint120 momentId) external checkRegistered {
        emit LikeMoment(accountIds[msg.sender], momentId);
    }

    /// @notice Cancels the like from the calling account to the moment associated with the given moment ID.
    /// @dev The calling account must have already liked the moment.
    /// @param momentId The ID of the moment to cancel the like for.
    function cancelLikeMoment(uint120 momentId) external checkRegistered {
       emit CancelLikeMoment(accountIds[msg.sender], momentId);
    }

    /// @notice Creates a new comment on the moment associated with the given moment ID with the given comment text.
    /// @param momentId The ID of the moment to create the comment on.
    /// @param commentText The text of the comment to create.
    function createComment(
        uint120 momentId,
        string calldata commentText
    ) external checkRegistered {
        uint128 commentId =  moment.createComment();
        emit CreateComment(accountIds[msg.sender], momentId, commentId, commentText);
    }

    /// @notice Removes the comment associated with the given comment ID.
    /// @dev The calling account must be the owner of the comment in order to remove it.
    /// @param commentId The ID of the comment to remove.
    function removeComment(uint128 commentId) external {
        emit RemoveComment(accountIds[msg.sender], commentId);
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

        emit CreateSubSpaceDomain(accountIds[msg.sender], primarySpaceId, spaceId, domainName, expireSeconds);
        return spaceId;
    }

    /// @notice Rents the space with the given space ID.
    /// @param spaceId The ID of the space to return.
    function rentSpace(uint64 userId, uint64 spaceId) external onlyAppover(spaceId) {
        spaceFNS.rentSpace(spaceId, userId);
        accounts[userId].rentedSpaceIds.push(spaceId);
        delete approvals[spaceId];

        emit RentSpace(userId, spaceId);
    }

    /// @notice Function for returning a rented space domain.
    /// @param userId The id of the account that rented the space domain.
    /// @param spaceId The ID of the space domain to return.
    function returnSpace(uint64 userId, uint64 spaceId) external {
        if (userId == 0) revert AccountNotFound();
        if (!spaceFNS.isExpired(spaceId)) revert SpaceDomainHasNotExpired();

        uint64[] storage rentedSpaceIds = accounts[userId].rentedSpaceIds;
        for (uint256 i = 0; i < rentedSpaceIds.length; i++) {
            if (rentedSpaceIds[i] == spaceId) {
                rentedSpaceIds[i] = rentedSpaceIds[rentedSpaceIds.length - 1];
                rentedSpaceIds.pop();
                spaceFNS.returnSpace(spaceId);

                emit ReturnSpace(userId, spaceId);
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

        emit SetSubSpaceDomainLimit(limit);
    }

    /// @dev Sets the fee required to mint a new space.
    /// @param _mintFee The new fee amount.
    function setMintFee(uint256 _mintFee) public onlyOwner {
        mintFee = _mintFee;

        emit SetMintFee(_mintFee);
    }

    /// @dev Sets the address of the beneficiary account.
    /// @param _beneficiary The address of the beneficiary account.
    function setBeneficiary(address _beneficiary) public onlyOwner {
        beneficiary = payable(_beneficiary);

        emit SetBeneficiary(_beneficiary);
    }
}