// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

// https://docs.openzeppelin.com/contracts/4.x/erc721
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract MomentSwapFRC721 is ERC721URIStorage, Ownable {
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  struct momentSwapFRC721NFT {
    address owner;
    string tokenURI;
    uint256 tokenId;
    uint256 timestamp;
  }

  uint256 public mintFee;
  address payable public beneficiary;
  momentSwapFRC721NFT[] public nftCollection;
  mapping(address => momentSwapFRC721NFT[]) public nftCollectionByOwner;

  event NewMomentSwapFRC721NFTMinted(
    address indexed sender,
    uint256 indexed tokenId,
    uint256 indexed timestamp,
    string tokenURI
  );

  constructor() ERC721("MomentSwap NFTs", "BAC") {
    mintFee = 0.0003 ether;
    beneficiary = payable(owner());
    console.log("Hello Fil-ders! Now creating MomentSwap FRC721 NFT contract!");
  }

  function mintMomentSwapNFT(string memory ipfsURI) public payable returns (uint256) {
    require(msg.value >= mintFee, "Fee not paid.");
    beneficiary.transfer(msg.value);

    uint256 newItemId = _tokenIds.current();
    momentSwapFRC721NFT memory newNFT = momentSwapFRC721NFT({
      owner: msg.sender,
      tokenURI: ipfsURI,
      tokenId: newItemId,
      timestamp: block.timestamp
    });

    _mint(msg.sender, newItemId);
    _setTokenURI(newItemId, ipfsURI);
    nftCollectionByOwner[msg.sender].push(newNFT);

    _tokenIds.increment();

    nftCollection.push(newNFT);

    emit NewMomentSwapFRC721NFTMinted(msg.sender, newItemId, block.timestamp, ipfsURI);

    return newItemId;
  }

  /**
   * @notice helper function to display NFTs for frontends
   */
  function getNFTCollection() public view returns (momentSwapFRC721NFT[] memory) {
    return nftCollection;
  }

  /**
   * @notice helper function to fetch NFT's by owner
   */
  function getNFTCollectionByOwner(address owner) public view returns (momentSwapFRC721NFT[] memory) {
    return nftCollectionByOwner[owner];
  }

  /**
   */
  function mintMultipleMomentSwapNFTs(string[] memory ipfsMetadata) public returns (uint256[] memory) {
    console.log("minting momentSwap nfts");

    //get length of ipfsMetadata array
    uint256 length = ipfsMetadata.length;
    uint256[] memory tokenIdArray = new uint256[](length);

    //loop through calling mintMomentSwapNFT for each
    uint256 j = 0;
    for (j = 0; j < length; j++) {
      //for loop example
      tokenIdArray[j] = mintMomentSwapNFT(ipfsMetadata[j]);
    }

    return tokenIdArray;
  }

  function setMintFee(uint256 _mintFee) public onlyOwner {
    mintFee = _mintFee;
  }

  function setBeneficiary(address _beneficiary) public onlyOwner {
    beneficiary = payable(_beneficiary);
  }
}
