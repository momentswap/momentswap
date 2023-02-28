// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

//import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract SpaceFNS {
  ///Up to MAXIMUM_NODES second-level domains under a first-level domain
  uint256 constant MAXIMUM_NODES = 5;

  using Counters for Counters.Counter;
  Counters.Counter private _registeredCount;
  Counters.Counter private _registeredChildCount;

  // Logged when the user of an NFT is changed or expires is changed
  /// @notice Emitted when the `user` of an NFT or the `expires` of the `user` is changed
  /// The zero address for user indicates that there is no user address
  event UpdateUser(uint256 indexed tokenId, address indexed user, uint64 expires);

  ///@dev Emitted when `First-Domain` token is  Registered.
  event DomainRegistered(string indexed label, uint256 indexed tokenId, address indexed owner);

  ///@dev Emitted when `Second-Domain` token is  Registered.
  event ChildDomainRegistered(string indexed label, uint256 indexed tokenId, address indexed owner);

  ///@dev Emitted when `Second-Domain` token is  Update.
  event ChildDomainUpdate(string indexed label, uint256 indexed tokenId, address indexed owner);

  //@dev Emitted when `owner` enables `approved` to setting  the `tokenId` token expires time.
  event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);

  constructor() {
    //The tokenID of both the main domain and the child-domain is incremented from 1
    _registeredCount.increment();
    _registeredChildCount.increment();
  }

  //tokenID mapped to main domain information
  mapping(uint256 => FNSToken) public allMainFNSDomain;

  //tokenID mapped to child domain information
  mapping(uint256 => childFNSToken) public allChildFNSDomain;

  //Main domain name mapped to  address
  mapping(string => address) public mainNames;

  //Main domain name mapped to  tokenId
  mapping(string => uint256) public mainNameId;

  //Address mapped to Main domain name
  mapping(address => string) public resMainNames;

  //second-domain name mapped to user address
  mapping(string => address) public childNames;

  //second-domain name mapped to second-domain tokenId
  mapping(string => uint256) public childNameId;

  mapping(address => uint256[]) public leasedChildFNSTokens;

  ///second-domain tokenId mapped to approval controller address
  mapping(uint256 => address) private childApprovals;

  ///@dev main-domain name infromation
  struct FNSToken {
    uint256 tokenId;
    string name;
    address owner;
    uint256[] child;
  }

  ///@dev child-domain name infromation
  struct childFNSToken {
    uint256 tokenId;
    string allName;
    string childName;
    uint256 parent;
    address owner;
    address user;
    uint64 expires;
  }

  /// @dev Returns the account approved for `tokenId` token.
  function getApproved(uint256 tokenId) public view returns (address) {
    require(allChildFNSDomain[tokenId].owner != address(0), "tokenId No Minted");
    return childApprovals[tokenId];
  }

  /// @dev Gives permission to `to` to setting `tokenId` token expire time
  function approve(address to, uint256 tokenId) public {
    address owner = allChildFNSDomain[tokenId].owner;
    address user = allChildFNSDomain[tokenId].user;
    require(to != owner, "SpaceFNS: approval to current owner");
    require(to != user, "SpaceFNS: approval to current user");

    require(msg.sender == owner, "SpaceFNS: approve caller is not token owner ");
    _approve(to, tokenId);
  }

  function _approve(address to, uint256 tokenId) internal {
    childApprovals[tokenId] = to;
    emit Approval(SpaceFNS.ownerOf(tokenId), to, tokenId);
  }

  modifier checkLabelLength(string calldata lable) {
    uint256 lable_length = bytes(lable).length;
    require(lable_length >= 3 && lable_length <= 10, "Domain name length does not meet the specification");
    _;
  }

  modifier checkChildDomain(string calldata parent, string[] calldata childLabel) {
    for (uint256 i = 0; i < childLabel.length; i++) {
      uint256 lable_length = bytes(childLabel[i]).length;
      require(lable_length >= 3 && lable_length <= 10, "Domain name length does not meet the specification");
      require(childNames[childLabel[i]] == address(0), "Name is already exist");
    }
    _;
  }

  ///@dev Register main domain name
  ///@dev Limit an address to one first-level domain name
  function register(string calldata label) external checkLabelLength(label) returns (string memory) {
    require(mainNames[label] == address(0), "Name is already exist ");

    require(bytes(resMainNames[msg.sender]).length == 0, "an address only own one first-level domain ");

    uint256 index = _registeredCount.current();

    allMainFNSDomain[index] = FNSToken(index, label, msg.sender, new uint256[](0));

    emit DomainRegistered(label, index, msg.sender);

    _registeredCount.increment();

    mainNames[label] = msg.sender;

    mainNameId[label] = index;

    resMainNames[msg.sender] = label;

    return label;
  }

  modifier onlyOwner(string calldata _node) {
    require(mainNames[_node] == msg.sender, "Not the owner");
    _;
  }

  ///@dev mint second-level domains
  function mintChildDomain(string calldata parentNode, string calldata childNode)
    public
    checkLabelLength(childNode)
    onlyOwner(parentNode)
    returns (string memory)
  {
    string memory allname = dealwithString(childNode, ".", parentNode);
    uint256 parentId = mainNameId[parentNode];

    require(childNames[allname] == address(0), "ChildName is already exist");
    require(childNameId[allname] == uint256(0), "ChildName is already exist");
    require(allMainFNSDomain[parentId].child.length < MAXIMUM_NODES, "Mint second domain number too many");
    uint256 childIndex = _registeredChildCount.current();
    allChildFNSDomain[childIndex] = childFNSToken(childIndex, allname, childNode, parentId, msg.sender, msg.sender, 0);
    allMainFNSDomain[parentId].child.push(childIndex);
    emit ChildDomainRegistered(allname, childIndex, msg.sender);
    _registeredChildCount.increment();
    childNames[allname] = msg.sender;
    childNameId[allname] = childIndex;
    return allname;
  }

  ///@dev update child-domain
  function updateChildDomain(
    string calldata parentNode,
    string calldata oldChildNode,
    string calldata newChildNode
  ) public checkLabelLength(newChildNode) {
    string memory allname = dealwithString(oldChildNode, ".", parentNode);
    require(childNames[allname] != address(0), "ChildName is no exist");
    uint256 index = childNameId[allname];
    require(allChildFNSDomain[index].user == msg.sender, "Not the owner");
    delete childNames[allname];
    delete childNameId[allname];
    string memory newAllName = dealwithString(newChildNode, ".", parentNode);
    emit ChildDomainUpdate(newAllName, index, msg.sender);
    allChildFNSDomain[index].allName = newAllName;
    allChildFNSDomain[index].childName = newChildNode;
    childNames[newAllName] = msg.sender;
    childNameId[newAllName] = index;
  }

  /// @notice set the user and expires of an NFT
  /// @dev The zero address indicates there is no user
  /// Throws if `tokenId` is not valid NFT
  /// @param user  The new user of the NFT
  /// @param expires  UNIX timestamp, The new user could use the NFT before expires
  function setUser(
    uint256 tokenId,
    address user,
    uint64 expires
  ) external {
    require(getApproved(tokenId) == msg.sender, "Not  approval account");
    allChildFNSDomain[tokenId].user = user;
    allChildFNSDomain[tokenId].expires = expires;
    delete childApprovals[tokenId];
    emit UpdateUser(tokenId, user, expires);
    childNames[allChildFNSDomain[tokenId].allName] = msg.sender;
    leasedChildFNSTokens[user].push(tokenId);
  }

  /// @notice Get the user address of an NFT
  /// @dev The zero address indicates that there is no user or the user is expired
  /// @param tokenId The NFT to get the user address for
  /// @return The user address for this NFT
  function userOf(uint256 tokenId) external view returns (address) {
    return allChildFNSDomain[tokenId].user;
  }

  /// @notice Get the user expires of an NFT
  /// @dev The zero value indicates that there is no user
  /// @param tokenId The NFT to get the user expires for
  /// @return The user expires for this NFT
  function userExpires(uint256 tokenId) public view returns (uint256) {
    return allChildFNSDomain[tokenId].expires;
  }

  ///@dev Returns the owner of the `tokenId` token.
  function ownerOf(uint256 tokenId) public view returns (address) {
    require(allChildFNSDomain[tokenId].owner != address(0), "tokenId No Minted");
    return allChildFNSDomain[tokenId].owner;
  }

  function dealwithString(
    string calldata a,
    string memory b,
    string calldata c
  ) internal pure returns (string memory) {
    return string(abi.encodePacked(a, b, c));
  }

  ///@dev Get the tokenId of child-domain name by childAllname
  ///for example A.B
  ///B: mainDomain name
  ///A: childDomain name
  function getChildDomainId(string calldata childAllName) public view returns (uint256) {
    require(childNameId[childAllName] != uint256(0), "ChildName is not exist");
    return childNameId[childAllName];
  }

  ///@dev Get the user of child-domain name by childAllname
  ///for example A.B
  ///B: mainDomain name
  ///A: childDomain name
  function getChildDomainUser(string calldata childAllName) external view returns (address) {
    require(childNames[childAllName] != address(0), "ChildName is not exist");
    return childNames[childAllName];
  }

  ///@dev Get the owner of the main domain by the main domain
  function getMainDomainOwner(string calldata nodeName) external view returns (address) {
    require(mainNames[nodeName] != address(0), "mainName is not exist");
    return mainNames[nodeName];
  }

  ///@dev get child-domains  collection by the main domain
  function getMainDomainChild(string calldata nodeName) external view returns (address[] memory) {
    require(mainNames[nodeName] != address(0), "mainName is not exist");
    uint256 doMainId = mainNameId[nodeName];
    uint256[] memory childArrayIds = allMainFNSDomain[doMainId].child;
    address[] memory childArray = new address[](childArrayIds.length);
    for (uint256 i = 0; i < childArrayIds.length; i = i + 1) {
      address childAddress = allChildFNSDomain[childArrayIds[i]].user;
      childArray[i] = childAddress;
    }
    return childArray;
  }

  ///@dev Get the owner of the main domain and child-domains and child-domains by the owner of the main domain
  function getMainDomainAndChild(address owner)
    external
    view
    returns (
      string memory,
      string[] memory,
      address[] memory,
      string[] memory
    )
  {
    require(bytes(resMainNames[owner]).length != uint256(0), "mainName is not exist");
    string memory mainNodeName = resMainNames[owner];
    uint256 doMainId = mainNameId[mainNodeName];
    uint256[] memory childArrayIds = allMainFNSDomain[doMainId].child;
    address[] memory childAddressArray = new address[](childArrayIds.length);
    string[] memory childNameArray = new string[](childArrayIds.length);
    string[] memory leasedChildFNSNames = new string[](leasedChildFNSTokens[owner].length);
    uint256 leasedChildFNSNameIndex = 0;

    for (uint256 i = 0; i < childArrayIds.length; i = i + 1) {
      address childAddress = allChildFNSDomain[childArrayIds[i]].user;
      string memory tmpChildName = allChildFNSDomain[childArrayIds[i]].childName;
      childAddressArray[i] = childAddress;
      childNameArray[i] = tmpChildName;
    }

    for (uint256 i = 0; i < leasedChildFNSTokens[owner].length; i = i + 1) {
      uint256 tokenId = leasedChildFNSTokens[owner][i];
      if (tokenId == 0) {
        continue;
      }

      leasedChildFNSNames[leasedChildFNSNameIndex] = allChildFNSDomain[tokenId].allName;
      leasedChildFNSNameIndex = leasedChildFNSNameIndex + 1;
    }

    return (mainNodeName, childNameArray, childAddressArray, leasedChildFNSNames);
  }

  ///@dev child-domain expires and is reset
  function resetChildDomain(string calldata allName) external {
    uint256 childTokenId = getChildDomainId(allName);
    require(block.timestamp >= userExpires(childTokenId), "child domain have not expired ");
    //require(allChildFNSDomain[childTokenId].owner==msg.sender,"Not Owner");
    address user = allChildFNSDomain[childTokenId].user;
    allChildFNSDomain[childTokenId].user = allChildFNSDomain[childTokenId].owner;

    // TODO: Optimize array operations
    for (uint256 i = 0; i < leasedChildFNSTokens[user].length; i = i + 1) {
      if (leasedChildFNSTokens[user][i] != childTokenId) {
        continue;
      }
      delete leasedChildFNSTokens[user][i];
    }
  }
}
