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
    ): Promise<[primaryDomain: string, subDomains: string[], subDomainTenants: string[], leasedDomains: string[]]> => {
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

  const getOwnerByPrimaryDomain = useCallback(
    (primaryDomain: string): Promise<string> => {
      return contractWithProvider.getMainDomainOwner(primaryDomain);
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
    (primaryDomain: string, subDomain: string): Promise<any> => {
      return contractWithSigner.mintChildDomain(primaryDomain, subDomain);
    },
    [contractWithSigner],
  );

  const registerPrimaryDomain = useCallback(
    (primaryDomain: string, subDomain: string): Promise<any> => {
      return contractWithSigner.register(primaryDomain, subDomain);
    },
    [contractWithSigner],
  );

  const resetSubDomain = useCallback(
    (primaryDomain: string, subDomain: string): Promise<any> => {
      return contractWithSigner.resetChildDomain(primaryDomain, subDomain);
    },
    [contractWithSigner],
  );

  const updateSubDomain = useCallback(
    (primaryDomain: string, oldSubDomain: string, newSubDomain: string): Promise<any> => {
      return contractWithSigner.updateChildDomain(primaryDomain, oldSubDomain, newSubDomain);
    },
    [contractWithSigner],
  );

  return {
    getAllDomainByWallet,
    getApprovedMarketByDomainID,
    getDomainIDByFullDomain,
    getDomainUserByFullDomain,
    getOwnerByPrimaryDomain,
    approve,
    mintSubDomain,
    registerPrimaryDomain,
    resetSubDomain,
    updateSubDomain,
  };
};
