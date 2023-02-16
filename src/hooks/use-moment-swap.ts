import { BigNumber, Contract } from "ethers";

import MomentSwapFRC721 from "@Contracts/MomentSwapFRC721.sol/MomentSwapFRC721.json";
import { MomentSwapFRC721NFT } from "@utils/definitions/interfaces";
import { useWalletProvider } from "src/hooks";

const contractAddress = process.env.NEXT_PUBLIC_MOMENTSWAP_CONTRACT_ADDRESS || "";
export const getContract = () => new Contract(contractAddress, MomentSwapFRC721.abi);

export const useMomentSwap = () => {
  const { signer, provider } = useWalletProvider();
  const contractWithProvider = new Contract(contractAddress, MomentSwapFRC721.abi, provider);
  const contractWithSigner = new Contract(contractAddress, MomentSwapFRC721.abi, signer);

  // read-only
  const getNFTCollection = (): Promise<Array<MomentSwapFRC721NFT>> | undefined => {
    if (!provider) return undefined;
    return contractWithProvider.getNFTCollection();
  };
  const getNFTCollectionByOwner = (owner: string): Promise<Array<MomentSwapFRC721NFT>> | undefined => {
    if (!provider) return undefined;
    return contractWithProvider.getNFTCollectionByOwner(owner);
  };

  // read-write
  const mintMomentSwapNFT = (owner: string, ipfsURL: string): Promise<BigNumber> | undefined => {
    if (!signer) return undefined;
    return contractWithSigner.mintMomentSwapNFT(owner, ipfsURL);
  };
  const mintMultipleMomentSwapNFTs = (
    owner: string,
    ipfsURLs: Array<string>,
  ): Promise<Array<BigNumber>> | undefined => {
    if (!signer) return undefined;
    return contractWithSigner.mintMultipleMomentSwapNFTs(owner, ipfsURLs);
  };

  return { getNFTCollection, getNFTCollectionByOwner, mintMomentSwapNFT, mintMultipleMomentSwapNFTs };
};
