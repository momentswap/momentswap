// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";

contract SpaceFNS {
    event DomainRegistered(string indexed label, uint256 indexed token_id,address indexed owner);

    event ChildDomainRegistered(string indexed label,uint256 indexed token_id,address indexed owner);

    using Counters for Counters.Counter;
    Counters.Counter private _registeredCount;

   //FNS info
   struct FNSInfo{
       string  name;
       uint256 parent;
       uint256 tokenId;
       address owner;
       uint256 start_time;
       uint256 end_time;
       uint256[] child;
       uint256  earning;
   }

    uint256 constant DEFAULT_EXPIRE_TIME =  48 weeks;
    uint256 constant MAXIMUM_NODES = 10;
    

    //FNS name ==>tokenID
    mapping(string=>uint256) private allNames;

    //tokenID ==>Fns informationg
    mapping(uint256=>FNSInfo) private allFNS;

    
    mapping(address => uint256) private balances;

    //owner
    mapping(string => address) private mainNames;

    mapping(address=>string)private resMainNames;

    mapping(bytes32=>address) private childOwner;

    mapping(address=>string[])private childNames;


    constructor(){
        _registeredCount.increment();
    }



     function register(string calldata label,address owner) external {
        //bytes32 hashedLabel = keccak256(abi.encodePacked(label));
        
        //check lable 
        require(
           mainNames[label]==address(0),
            "Name is already exist "
        );

        //expiryTimes[hashedLabel] = block.timestamp + DEFAULT_EXPIRE_TIME;
        uint256 index=_registeredCount.current();
      
        allFNS[index]= FNSInfo(label,0,index,owner,0,0,new uint256[](0),0);
        emit DomainRegistered(label,index,owner);

        _registeredCount.increment();

        mainNames[label]=owner;

        allNames[label]=index;

        resMainNames[owner]=label;

    }
    //checkNodeIsExire(_node) 
     function createSubnode(
       string calldata _node,
       string calldata label,
       address owner
    ) external payable   {

        uint256 parent_id=allNames[_node];
        uint256 earnMoney=allFNS[parent_id].earning;
        uint256[] memory arr=allFNS[parent_id].child;
        require(
            arr.length < MAXIMUM_NODES,
            "Maximum domain limit reached"
        );

        require(
            msg.value>=earnMoney,
            "Insufficient funds to mint"
        );
      
        
        bytes32  newChildName = keccak256(abi.encodePacked(_node, ".",label ));
        string memory node_string=node_append(_node,'.',label);
        
        require(
                childOwner[newChildName]==address(0), 
                "ChildName is already exist "
        );

        balances[allFNS[parent_id].owner]+=msg.value;
             
        uint256 index=_registeredCount.current();
        allFNS[parent_id].child.push(index);

      
        allFNS[index]= FNSInfo(label,parent_id,index,owner,block.timestamp,block.timestamp+DEFAULT_EXPIRE_TIME,new uint256[](0),0);

        emit ChildDomainRegistered(label,index,owner);

        _registeredCount.increment();

        allNames[node_string]=index;
        
        childNames[owner].push(label);


    }

    function settingEarnFunds( string calldata _node,uint256 earnMoney)public  onlyOwner(_node){
        uint256 parent_id=allNames[_node];
        allFNS[parent_id].earning=earnMoney;
    }

    function withdraw()external {
        require(
            balances[msg.sender]>0,
            "Insufficient funds to withdraw"
        );
        uint256 amount=balances[msg.sender];
        balances[msg.sender]=0;
        payable(msg.sender).transfer(amount);
        
    }

      modifier onlyOwner(string calldata _node) {
        require(
            mainNames[_node] == msg.sender ,
            "Not the owner"
        );
        _;
    }




    function getAddress(string calldata name) external view returns (address) {
        uint256  id=allNames[name];
        return allFNS[id].owner;
    }

    function getName(address owner)external view returns (string memory){
        return  resMainNames[owner];
    }

    function getNameChildNames(string calldata name)external view returns (string[] memory){
        uint256 token_id=allNames[name];
        uint256[] memory arr=allFNS[token_id].child;
        string[] memory names= new string[](arr.length);
        for (uint i=0;i<arr.length;i=i+1){
           
            names[i]=allFNS[token_id].name;
        }
        return names;
    }


    function getAddressChildNames(address owner)external view returns(string[] memory){
        return childNames[owner];
    }


    function node_append(string calldata a, string memory b, string calldata c) internal pure returns (string memory ) {

        return string(abi.encodePacked(a, b, c));

    }



}