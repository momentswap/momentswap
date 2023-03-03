import { Contract } from "ethers";
import { useCallback, useMemo } from "react";

import FNSMarket from "@Contracts/FNSMarket.sol/RentMarket.json";
import { useWalletProvider } from "@hooks";

const contractAddress = process.env.NEXT_PUBLIC_FNS_MARKET_CONTRACT_ADDRESS;
if (!contractAddress) {
  throw new Error("Please set NEXT_PUBLIC_FNS_MARKET_CONTRACT_ADDRESS in a .env file");
}

const fnsContractAddress = process.env.NEXT_PUBLIC_SPACE_FNS_CONTRSCT_ADDRESS;
if (!contractAddress) {
  throw new Error("Please set NEXT_PUBLIC_SPACE_FNS_CONTRSCT_ADDRESS in a .env file");
}

export const useFNSMarketContract = () => {
  const { signer, provider } = useWalletProvider();
  const contractWithSigner = useMemo(() => new Contract(contractAddress, FNSMarket.abi, signer), [signer]);
  const contractWithProvider = useMemo(() => new Contract(contractAddress, FNSMarket.abi, provider), [provider]);

  // Read-only contract functions

  const getListedDomains = useCallback((): Promise<
    [domainID: string, price: string, expire: number, owner: string]
  > => {
    return contractWithProvider.getListing(fnsContractAddress);
  }, [contractWithProvider]);

  // Read-write contract functions

  const unlist = useCallback(
    (domainID: string): Promise<any> => {
      return contractWithSigner.cancelListing(domainID);
    },
    [contractWithSigner],
  );

  const lendDomain = useCallback(
    (domainID: string): Promise<any> => {
      return contractWithSigner.lendItem(fnsContractAddress, domainID);
    },
    [contractWithSigner],
  );

  const listDomain = useCallback(
    (domainID: string, price: string, expire: number): Promise<any> => {
      return contractWithSigner.listItem(fnsContractAddress, domainID, price, expire);
    },
    [contractWithSigner],
  );

  const updateListDomain = useCallback(
    (domainID: string, price: string, expire: number): Promise<any> => {
      return contractWithSigner.updateListing(fnsContractAddress, domainID, price, expire);
    },
    [contractWithSigner],
  );

  const withdrawProceeds = useCallback((): Promise<any> => {
    return contractWithSigner.withdrawProceeds();
  }, [contractWithSigner]);

  return {
    getListedDomains,
    unlist,
    lendDomain,
    listDomain,
    updateListDomain,
    withdrawProceeds,
  };
};
