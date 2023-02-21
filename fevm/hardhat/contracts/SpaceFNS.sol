// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/Address.sol";


contract SpaceFNS {
    using Address for address;


    /**
     * @dev Emitted when `First-Domain` token is  Registered.
     */
    event DomainRegistered(string indexed label, uint256 indexed tokenId, address indexed owner);

    /**
     * @dev Emitted when `Second-Domain` token is  Registered.
     */
    event ChildDomainRegistered(string indexed label, uint256 indexed token_id, address indexed owner);

     /**
     * @dev Emitted when the owner of  First-Domain  withdraw  funds.
     */
    event FirstLevelDomainOwnerWithdraw(uint256 indexed amount,address indexed owner);

    /**
     * @dev Emitted when `tokenId` token is transferred from `from` to `to`.
     */
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);

    /**
     * @dev Emitted when `owner` enables `approved` to manage the `tokenId` token.
     */
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);

    /**
     * @dev Emitted when `owner` enables or disables (`approved`) `operator` to manage all of its assets.
     */
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

    using Counters for Counters.Counter;
    Counters.Counter private _registeredCount;

    //SpaceFNS information
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

    //the owner of first-level domain earning how much money
    mapping(address => uint256) private balances;

    //first-level domain Corresponding to owner address
    mapping(string => address) private mainNames;

    //domain under owner
    mapping(address => string) public resMainNames;

    //second-level  domain name‘s hash ==> owner address
    mapping(bytes32 => address) private childOwner;

    mapping(uint256 => address) private _tokenApprovals;

    mapping(address => mapping(address => bool)) private _operatorApprovals;


    function modifierOwner(uint256 tokenId,address owner) private{
        allFNS[tokenId].owner=owner;
        if (allFNS[tokenId].parent!=uint256(0)){
             //allNames[allFNS[tokenId].name]=owner;
             string memory _node=allFNS[allFNS[tokenId].parent].name;
             string memory label=allFNS[tokenId].name;
             bytes32 newChildName = keccak256(abi.encodePacked(_node, ".", label));
             childOwner[newChildName]=owner;
             delete _tokenApprovals[tokenId];
            
        }else{
            mainNames[allFNS[tokenId].name]=owner;
            resMainNames[owner]=allFNS[tokenId].name;
            delete _tokenApprovals[tokenId];
        }
    } 

    constructor() {
        //In order to mark the parent_id of the first level domain as 0, the FNS with token_id of 0 cannot appear in the smart contract 
        //Prevent the contract from generating domains with ID 0
        //so you can set the parent_id  of the main domain to 0
        _registeredCount.increment();
    }


    function ownerOf(uint256 tokenId) public view returns (address owner){
         require(allFNS[tokenId].owner != address(0), "SpaceFNS address zero is not a valid owner");
         return allFNS[tokenId].owner;
    }

    function approve(address to, uint256 tokenId) public  {
        address owner = SpaceFNS.ownerOf(tokenId);
        require(to != owner, "SpaceFNS: approval to current owner");

        require(
            msg.sender == owner || isApprovedForAll(owner, msg.sender),
            "SpaceFNS approve caller is not token owner or approved for all"
        );

        _approve(to, tokenId);
    }

    function setApprovalForAll(address operator, bool approved) external{
        _setApprovalForAll(msg.sender,operator,approved);
    }


    function _approve(address to, uint256 tokenId) internal virtual {
        _tokenApprovals[tokenId] = to;
        emit Approval(SpaceFNS.ownerOf(tokenId), to, tokenId);
    }
    function isApprovedForAll(address owner, address operator) public view returns (bool){
        return _operatorApprovals[owner][operator];
    }


    function getApproved(uint256 tokenId) public view  returns (address) {
        require(SpaceFNS.ownerOf(tokenId)!=address(0),"tokenId No Minted");
        return _tokenApprovals[tokenId];
    }

  
    function transferFrom(address from, address to, uint256 tokenId) public  {
        //solhint-disable-next-line max-line-length
        require(_isApprovedOrOwner(msg.sender, tokenId), "SpaceFNS caller is not token owner or approved");

        _transfer(from, to, tokenId);
    }

    

    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view  returns (bool) {
        address owner = SpaceFNS.ownerOf(tokenId);
        return (spender == owner || isApprovedForAll(owner, spender) || getApproved(tokenId) == spender);
    }
    /**
     * @dev See {IERC721-safeTransferFrom}.
     */
    function safeTransferFrom(address from, address to, uint256 tokenId) public  {
        safeTransferFrom(from, to, tokenId, "");
    }

    /**
     * @dev See {IERC721-safeTransferFrom}.
     */
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public  {
        require(_isApprovedOrOwner(msg.sender, tokenId), "SpaceFNS caller is not token owner or approved");
        _safeTransfer(from, to, tokenId, data);
    }

    /**
     * @dev Safely transfers `tokenId` token from `from` to `to`, checking first that contract recipients
     * are aware of the ERC721 protocol to prevent tokens from being forever locked.
     *
     * `data` is additional data, it has no specified format and it is sent in call to `to`.
     *
     * This internal function is equivalent to {safeTransferFrom}, and can be used to e.g.
     * implement alternative mechanisms to perform token transfer, such as signature-based.
     *
     * Requirements:
     *
     * - `from` cannot be the zero address.
     * - `to` cannot be the zero address.
     * - `tokenId` token must exist and be owned by `from`.
     * - If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer.
     *
     * Emits a {Transfer} event.
     */
    function _safeTransfer(address from, address to, uint256 tokenId, bytes memory data) internal  {
        _transfer(from, to, tokenId);
        require(_checkOnERC721Received(from, to, tokenId, data), "SpaceFNS transfer to non ERC721Receiver implementer");
    }


    function _transfer(address from, address to, uint256 tokenId) internal  {
        require(SpaceFNS.ownerOf(tokenId) == from, "SpaceFNS transfer from incorrect owner");
        require(to != address(0), "SpaceFNS transfer to the zero address");

        //_beforeTokenTransfer(from, to, tokenId, 1);

        // Check that tokenId was not transferred by `_beforeTokenTransfer` hook
        require(SpaceFNS.ownerOf(tokenId) == from, "SpaceFNS transfer from incorrect owner");

        // Clear approvals from the previous owner
        delete _tokenApprovals[tokenId];

        modifierOwner(tokenId,to);

       

        emit Transfer(from, to, tokenId);
    }


    function _checkOnERC721Received(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) private returns (bool) {
        if (to.isContract()) {
            try IERC721Receiver(to).onERC721Received(msg.sender, from, tokenId, data) returns (bytes4 retval) {
                return retval == IERC721Receiver.onERC721Received.selector;
            } catch (bytes memory reason) {
                if (reason.length == 0) {
                    revert("SpaceFNS transfer to non ERC721Receiver implementer");
                } else {
                    /// @solidity memory-safe-assembly
                    assembly {
                        revert(add(32, reason), mload(reason))
                    }
                }
            }
        } else {
            return true;
        }
    }

    //---



    //  function _isApprovedOrOwner(address spender, uint256 tokenId) internal view virtual returns (bool) {
    //     address owner = SpaceFNS.ownerOf(tokenId);
    //     return (spender == owner || isApprovedForAll(owner, spender) || getApproved(tokenId) == spender);
    // }

    
    // function safeTransferFrom(address from, address to, uint256 tokenId, bytes calldata data) external{

    // }
    function _setApprovalForAll(address owner, address operator, bool approved) internal  {
        require(owner != operator, "SpaceFNS approve to caller");
        _operatorApprovals[owner][operator] = approved;
        emit ApprovalForAll(owner, operator, approved);
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



    function dealwithString(string calldata a, string memory b, string calldata c) internal pure returns (string memory) {
        return string(abi.encodePacked(a, b, c));
    }


}
