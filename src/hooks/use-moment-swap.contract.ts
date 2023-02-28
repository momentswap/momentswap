import { BigNumber, Contract } from "ethers";

import MomentSwapFRC721 from "@Contracts/MomentSwapFRC721.sol/MomentSwapFRC721.json";
import { useWalletProvider } from "@hooks";
import { MomentSwapFRC721NFT } from "@utils/definitions/interfaces";
import { useCallback, useMemo } from "react";

const contractAddress = process.env.NEXT_PUBLIC_MOMENTSWAP_CONTRACT_ADDRESS;
if (!contractAddress) {
  throw new Error("Please set NEXT_PUBLIC_MOMENTSWAP_CONTRACT_ADDRESS in a .env file");
}

export const useMomentSwap = () => {
  const { signer, provider } = useWalletProvider();
  const contractWithSigner = useMemo(() => new Contract(contractAddress, MomentSwapFRC721.abi, signer), [signer]);
  const contractWithProvider = useMemo(() => new Contract(contractAddress, MomentSwapFRC721.abi, provider), [provider]);

  // Read-only contract functions
  const getNFTCollection = useCallback((): Promise<Array<MomentSwapFRC721NFT>> => {
    return contractWithProvider.getNFTCollection();
  }, [contractWithProvider]);

  const getNFTCollectionByOwner = useCallback(
    (owner: string): Promise<Array<MomentSwapFRC721NFT>> => {
      return contractWithProvider.getNFTCollectionByOwner(owner);
    },
    [contractWithProvider],
  );

  // Read-write contract functions

  const mintMomentSwapNFT = useCallback(
    (ipfsURL: string): Promise<BigNumber> | undefined => {
      return contractWithSigner.mintMomentSwapNFT(ipfsURL);
    },
    [contractWithSigner],
  );

  const mintMultipleMomentSwapNFTs = useCallback(
    (ipfsURLs: Array<string>): Promise<Array<BigNumber>> | undefined => {
      return contractWithSigner.mintMultipleMomentSwapNFTs(ipfsURLs);
    },
    [contractWithSigner],
  );

  return {
    getNFTCollection,
    getNFTCollectionByOwner,
    mintMomentSwapNFT,
    mintMultipleMomentSwapNFTs,
  };
};
