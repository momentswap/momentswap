// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

// https://docs.openzeppelin.com/contracts/4.x/erc721
import "../../../node_modules/@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "../../../node_modules/@openzeppelin/contracts/utils/Counters.sol";
import "../../../node_modules/hardhat/console.sol";

contract MomentSwapFRC721 is ERC721URIStorage {
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  struct momentSwapFRC721NFT {
    address owner;
    string tokenURI;
    uint256 tokenId;
    uint256 timestamp;
  }

  momentSwapFRC721NFT[] public nftCollection;
  mapping(address => momentSwapFRC721NFT[]) public nftCollectionByOwner;

  event NewMomentSwapFRC721NFTMinted(
    address indexed sender,
    uint256 indexed tokenId,
    uint256 indexed timestamp,
    string tokenURI
  );

  constructor() ERC721("MomentSwap NFTs", "BAC") {
    console.log("Hello Fil-ders! Now creating MomentSwap FRC721 NFT contract!");
  }

  function mintMomentSwapNFT(address owner, string memory ipfsURI) public returns (uint256) {
    uint256 newItemId = _tokenIds.current();

    momentSwapFRC721NFT memory newNFT = momentSwapFRC721NFT({
      owner: msg.sender,
      tokenURI: ipfsURI,
      tokenId: newItemId,
      timestamp: block.timestamp
    });

    _mint(owner, newItemId);
    _setTokenURI(newItemId, ipfsURI);
    nftCollectionByOwner[owner].push(newNFT);

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
  function mintMultipleMomentSwapNFTs(address owner, string[] memory ipfsMetadata) public returns (uint256[] memory) {
    console.log("minting momentSwap nfts");

    //get length of ipfsMetadata array
    uint256 length = ipfsMetadata.length;
    uint256[] memory tokenIdArray = new uint256[](length);

    //loop through calling mintMomentSwapNFT for each
    uint256 j = 0;
    for (j = 0; j < length; j++) {
      //for loop example
      tokenIdArray[j] = mintMomentSwapNFT(owner, ipfsMetadata[j]);
    }

    return tokenIdArray;
  }
}
