import { BigNumber, Contract } from "ethers";
import { useCallback, useMemo } from "react";

import FNSMarket from "@Contracts/FNSMarket.sol/RentMarket.json";
import { useNotifyStatus, useWalletProvider } from "@hooks";

const marketContractAddress = process.env.NEXT_PUBLIC_FNS_MARKET_CONTRACT_ADDRESS;
if (!marketContractAddress) {
  throw new Error("Please set NEXT_PUBLIC_FNS_MARKET_CONTRACT_ADDRESS in a .env file");
}

const fnsContractAddress = process.env.NEXT_PUBLIC_SPACE_FNS_CONTRSCT_ADDRESS;
if (!fnsContractAddress) {
  throw new Error("Please set NEXT_PUBLIC_SPACE_FNS_CONTRSCT_ADDRESS in a .env file");
}

export const useFNSMarketContract = () => {
  const { signer, provider } = useWalletProvider();
  const contractWithSigner = useMemo(() => new Contract(marketContractAddress, FNSMarket.abi, signer), [signer]);
  const contractWithProvider = useMemo(() => new Contract(marketContractAddress, FNSMarket.abi, provider), [provider]);

  const setNotifySuccess = useNotifyStatus((state) => state.success);
  const setNotifyReset = useNotifyStatus((state) => state.resetStatus);
  const setNotifyFail = useNotifyStatus((state) => state.fail);
  // Read-only contract functions

  const getListedDomainsByDomainID = useCallback(
    (domainID: string): Promise<[domainID: BigNumber, price: BigNumber, expire: BigNumber, owner: string]> => {
      return contractWithProvider.getListing(fnsContractAddress, domainID);
    },
    [contractWithProvider],
  );

  // Read-write contract functions

  const unlist = useCallback(
    (domainID: string): Promise<any> => {
      return contractWithSigner.cancelListing(domainID);
    },
    [contractWithSigner],
  );

  const lendDomain = useCallback(
    async(domainID: string, price: string): Promise<any> => {
      const res = await contractWithSigner.lendItem(fnsContractAddress, domainID, { value: price });
      setNotifySuccess();
      await res.wait();
      setNotifyReset();
    },
    [contractWithSigner],
  );

  const listDomain = useCallback(
    async(domainID: string, price: string, expire: number): Promise<any> => {
      const res = await contractWithSigner.listItem(fnsContractAddress, domainID, price, expire);
      setNotifySuccess();
      await res.wait();
      setNotifyReset();
    },
    [contractWithSigner],
  );

  const updateListDomain = useCallback(
    async(domainID: string, price: string, expire: number): Promise<any> => {
      const res = await contractWithSigner.updateListing(fnsContractAddress, domainID, price, expire);
      setNotifySuccess();
      await res.wait();
      setNotifyReset();
    },
    [contractWithSigner],
  );

  const cancelListDomain = useCallback(
    async(domainID: string): Promise<any> => {
      const res = await contractWithSigner.cancelListing(fnsContractAddress, domainID);
      setNotifySuccess();
      await res.wait();
      setNotifyReset();
    },
    [contractWithSigner],
  );

  const withdrawProceeds = useCallback((): Promise<any> => {
    return contractWithSigner.withdrawProceeds();
  }, [contractWithSigner]);

  return {
    getListedDomainsByDomainID,
    unlist,
    lendDomain,
    listDomain,
    updateListDomain,
    cancelListDomain,
    withdrawProceeds,
  };
};
