import { BigNumber, Contract } from "ethers";
import { useCallback, useMemo } from "react";

import SapceFNS from "@Contracts/SpaceFNS.sol/SpaceFNS.json";
import { useWalletProvider } from "@hooks";

const contractAddress = process.env.NEXT_PUBLIC_SPACE_FNS_CONTRSCT_ADDRESS;
if (!contractAddress) {
  throw new Error("Please set NEXT_PUBLIC_SPACE_FNS_CONTRSCT_ADDRESS in a .env file");
}

export const useSpaceFNSContract = () => {
  const { signer, provider } = useWalletProvider();
  const contractWithSigner = useMemo(() => new Contract(contractAddress, SapceFNS.abi, signer), [signer]);
  const contractWithProvider = useMemo(() => new Contract(contractAddress, SapceFNS.abi, provider), [provider]);

  // Read-only contract functions

  const getAllDomainByWallet = useCallback(
    (
      wallet: string,
    ): Promise<[mainDomain: string, subDomains: string[], subDomainTenants: string[], leasedDomains: string[]]> => {
      return contractWithProvider.getMainDomainAndChild(wallet);
    },
    [contractWithProvider],
  );

  const getApprovedMarketByDomainID = useCallback(
    (domainID: string): Promise<string> => {
      return contractWithProvider.getApproved(domainID);
    },
    [contractWithProvider],
  );

  const getDomainIDByFullDomain = useCallback(
    (fullDomain: string): Promise<BigNumber> => {
      return contractWithProvider.getChildDomainId(fullDomain);
    },
    [contractWithProvider],
  );

  const getDomainUserByFullDomain = useCallback(
    (fullDomain: string): Promise<string> => {
      return contractWithProvider.getChildDomainUser(fullDomain);
    },
    [contractWithProvider],
  );

  const getOwnerByMainDomain = useCallback(
    (mainDomain: string): Promise<string> => {
      return contractWithProvider.getMainDomainOwner(mainDomain);
    },
    [contractWithProvider],
  );

  // Read-write contract  functions

  const approve = useCallback(
    (marketAddress: string, tokenID: string): Promise<any> => {
      return contractWithSigner.approve(marketAddress, tokenID);
    },
    [contractWithSigner],
  );

  const mintSubDomain = useCallback(
    (mainDomain: string, subDomain: string): Promise<any> => {
      return contractWithSigner.mintChildDomain(mainDomain, subDomain);
    },
    [contractWithSigner],
  );

  const registerMainDomain = useCallback(
    (mainDomain: string): Promise<any> => {
      return contractWithSigner.register(mainDomain);
    },
    [contractWithSigner],
  );

  const resetSubDomain = useCallback(
    (fullDomain: string): Promise<any> => {
      return contractWithSigner.resetChildDomain(fullDomain);
    },
    [contractWithSigner],
  );

  const updateSubDomain = useCallback(
    (mainDomain: string, oldSubDomain: string, newSubDomain: string): Promise<any> => {
      return contractWithSigner.updateChildDomain(mainDomain, oldSubDomain, newSubDomain);
    },
    [contractWithSigner],
  );

  return {
    getAllDomainByWallet,
    getApprovedMarketByDomainID,
    getDomainIDByFullDomain,
    getDomainUserByFullDomain,
    getOwnerByMainDomain,
    approve,
    mintSubDomain,
    registerMainDomain,
    resetSubDomain,
    updateSubDomain,
  };
};
