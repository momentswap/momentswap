// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";

contract SpaceFNS {
  event DomainRegistered(string indexed label, uint256 indexed token_id, address indexed owner);

  event ChildDomainRegistered(string indexed label, uint256 indexed token_id, address indexed owner);


  event FirstLevelDomainOwnerWithdraw(uint256 indexed amount,address indexed owner);

  using Counters for Counters.Counter;
  Counters.Counter private _registeredCount;

  //FNS information
  struct FNSInfo {
    string name;
    uint256 parent;
    uint256 tokenId;
    address owner;
    uint256 start_time;
    uint256 end_time;
    uint256[] child;
    uint256 earning;
  }

  ///The life cycle of second-level domain names
  uint256 constant DEFAULT_EXPIRE_TIME = 48 weeks;

  ///Up to MAXIMUM_NODES second-level domains under a first-level domain
  uint256 constant MAXIMUM_NODES = 10;

  //FNS name ==>tokenID
  mapping(string => uint256) private allNames;

  //tokenID ==>domain information
  mapping(uint256 => FNSInfo) public allFNS;

  mapping(address => uint256) private balances;

  //first-level domain Corresponding to owner address
  mapping(string => address) private mainNames;

  //domain under owner
  mapping(address => string) public resMainNames;

  //second-level  domain name‘s hash ==> owner address
  mapping(bytes32 => address) private childOwner;

  //owner  address own second-level domain
  mapping(address => string[]) private childNames;



  constructor() {
    //In order to mark the parent_id of the first level domain as 0, the FNS with token_id of 0 cannot appear in the smart contract 
    //Prevent the contract from generating domains with ID 0
    //so you can set the parent_id  of the main domain to 0
    _registeredCount.increment();
  }

  ///Register main domain name
  ///Limit an address to one first-level domain name
  function register(string calldata label) external checkLabelLength(label){
    require(mainNames[label] == address(0), "Name is already exist ");

    require(bytes(resMainNames[msg.sender]).length == 0, "an address only own one first-level domain ");

    uint256 index = _registeredCount.current();

    allFNS[index] = FNSInfo(label, 0, index, msg.sender, 0, 0, new uint256[](0), 0);
    emit DomainRegistered(label, index, msg.sender);

    _registeredCount.increment();

    mainNames[label] = msg.sender;

    allNames[label] = index;

    resMainNames[msg.sender] = label;
  }
  modifier checkLabelLength(string calldata lable){
     uint256 lable_length=bytes(lable).length ;

      require(lable_length>=3 && lable_length<=10,"Domain name length does not meet the specification");
      _;
  }

  /// mint second-level domains
  function createSubnode(string calldata _node, string calldata label) external payable checkLabelLength(label){

    require(mainNames[_node]!=address(0),"input first-level domain name does not exist ");
    uint256 parent_id = allNames[_node];
    uint256 earnMoney = allFNS[parent_id].earning;
    uint256[] memory arr = allFNS[parent_id].child;
    require(arr.length < MAXIMUM_NODES, "Maximum domain limit reached");

    require(msg.value >= earnMoney, "Insufficient funds to mint");

    bytes32 newChildName = keccak256(abi.encodePacked(_node, ".", label));
    string memory node_string = dealwithString(_node, ".", label);

    require(childOwner[newChildName] == address(0), "ChildName is already exist ");

    balances[allFNS[parent_id].owner] += msg.value;

    uint256 index = _registeredCount.current();
    allFNS[parent_id].child.push(index);

    allFNS[index] = FNSInfo(
      label,
      parent_id,
      index,
      msg.sender,
      block.timestamp,
      block.timestamp + DEFAULT_EXPIRE_TIME,
      new uint256[](0),
      0
    );

    emit ChildDomainRegistered(label, index, msg.sender);

    _registeredCount.increment();

    allNames[node_string] = index;
    childNames[msg.sender].push(label);
    childOwner[newChildName]=msg.sender;
  }

  //The owner of a first-level domain can setting  mint price
  function settingEarnFunds(string calldata _node, uint256 earnMoney) public onlyOwner(_node) {
    uint256 parent_id = allNames[_node];
    allFNS[parent_id].earning = earnMoney;
  }

  ///The owner of a first-level domain can withdraw the earned funds
  function withdraw() external {
    require(balances[msg.sender] > 0, "Insufficient funds to withdraw");
    uint256 amount = balances[msg.sender];
    balances[msg.sender] = 0;
    emit FirstLevelDomainOwnerWithdraw(amount,msg.sender);
    payable(msg.sender).transfer(amount);
  }

  ///Permission control for the owner of _node
  modifier onlyOwner(string calldata _node) {
    require(mainNames[_node] == msg.sender, "Not the owner");
    _;
  }

  ///Get Owner address by  first-level domains
  function getAddress(string calldata name) external view returns (address) {
    uint256 tokenid = allNames[name];
    return allFNS[tokenid].owner;
  }

  ///Get first-level domains by owner address
  ///Limit an address to one first-level domain name
  function getFirstName(address owner) external view returns (string memory) {
    return resMainNames[owner];
  }

  ///Get a list of second-level domains by first-level domains
  function getNameChildNames(string calldata name) external view returns (string[] memory) {
    uint256 token_id = allNames[name];
    uint256[] memory arr = allFNS[token_id].child;
    string[] memory names = new string[](arr.length);
    for (uint i = 0; i < arr.length; i = i + 1) {
      names[i] = allFNS[token_id].name;
    }
    return names;
  }

  ///Get a collection of second-level domains owned by owner
  function getAddressChildNames(address owner) external view returns (string[] memory) {
    return childNames[owner];
  }


  function dealwithString(string calldata a, string memory b, string calldata c) internal pure returns (string memory) {
    return string(abi.encodePacked(a, b, c));
  }


}
