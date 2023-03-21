import { BigNumber, Contract } from "ethers";
import { useCallback, useMemo } from "react";

import SapceFNS from "@Contracts/SpaceFNS.sol/SpaceFNS.json";
import { useWalletProvider } from "@hooks";

const marketContractAddress = process.env.NEXT_PUBLIC_FNS_MARKET_CONTRACT_ADDRESS;

if (!marketContractAddress) {
  throw new Error("Please set NEXT_PUBLIC_FNS_MARKET_CONTRACT_ADDRESS in a .env file");
}

const fnsContractAddress = process.env.NEXT_PUBLIC_SPACE_FNS_CONTRSCT_ADDRESS;
if (!fnsContractAddress) {
  throw new Error("Please set NEXT_PUBLIC_SPACE_FNS_CONTRSCT_ADDRESS in a .env file");
}

export const useSpaceFNSContract = () => {
  const { signer, provider } = useWalletProvider();
  const contractWithSigner = useMemo(() => new Contract(fnsContractAddress, SapceFNS.abi, signer), [signer]);
  const contractWithProvider = useMemo(() => new Contract(fnsContractAddress, SapceFNS.abi, provider), [provider]);

  // Read-only contract functions

  const getAllDomainByCreator = useCallback(
    (
      creator: string,
    ): Promise<[mainDomain: string, subDomainIDs: BigNumber[], subDomainNames: string[], subDomainUsers: string[]]> => {
      return contractWithProvider.getMainDomainAndChild(creator);
    },
    [contractWithProvider],
  );

  const getSubDomainDetailsByDomainID = useCallback(
    (
      domainID: string,
    ): Promise<
      [
        tokenID: BigNumber,
        fullDomain: string,
        subDomain: string,
        mainDomainID: BigNumber,
        creator: string,
        user: string,
        start: BigNumber,
        expires: BigNumber,
      ]
    > => {
      return contractWithProvider.allChildFNSDomain(domainID);
    },
    [contractWithProvider],
  );

  const getApprovedMarketByDomainID = useCallback(
    (domainID: string): Promise<string> => {
      return contractWithProvider.getApproved(domainID);
    },
    [contractWithProvider],
  );

  const getOwnerByMainDomain = useCallback(
    (mainDomain: string): Promise<string> => {
      return contractWithProvider.getMainDomainOwner(mainDomain);
    },
    [contractWithProvider],
  );

  const getOwnerByDomainID = useCallback(
    (domainID: string): Promise<string> => {
      return contractWithProvider.ownerOf(domainID);
    },
    [contractWithProvider],
  );

  const getUserByFullDomain = useCallback(
    (fullDomain: string): Promise<string> => {
      return contractWithProvider.getChildDomainUser(fullDomain);
    },
    [contractWithProvider],
  );

  const getDomainIDByFullDomain = useCallback(
    (fullDomain: string): Promise<BigNumber> => {
      return contractWithProvider.getChildDomainId(fullDomain);
    },
    [contractWithProvider],
  );

  const getDomainLeaseTermsByCreator = useCallback(
    (
      creator: string,
    ): Promise<[subDomainIDs: BigNumber[], fullDomains: string[], leaseTerms: [BigNumber, BigNumber][]]> => {
      return contractWithProvider.getChildDomainLeaseTerm(creator);
    },
    [contractWithProvider],
  );

  const getDomainLeaseTermsByUser = useCallback(
    (
      user: string,
    ): Promise<[subDomainIDs: BigNumber[], fullDomains: string[], leaseTerms: [BigNumber, BigNumber][]]> => {
      return contractWithProvider.getLeasedDomainLeaseTerm(user);
    },
    [contractWithProvider],
  );

  const getApprovedByDomainID = useCallback(
    (domainID: string): Promise<string> => {
      return contractWithProvider.getApproved(domainID);
    },
    [contractWithProvider],
  );

  const getAvatar = useCallback(
    (user: string): Promise<string> => {
      return contractWithSigner.getAvatar(user);
    },
    [contractWithProvider],
  );

  // Read-write contract  functions

  const approve = useCallback(
    (tokenID: string): Promise<any> => {
      return contractWithSigner.approve(marketContractAddress, tokenID);
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

  const setAvatar = useCallback(
    (image: string): Promise<any> => {
      return contractWithSigner.setAvatar(image);
    },
    [contractWithSigner],
  );

  return {
    getAvatar,
    getAllDomainByCreator,
    getApprovedMarketByDomainID,
    getUserByFullDomain,
    getDomainIDByFullDomain,
    getDomainLeaseTermsByCreator,
    getDomainLeaseTermsByUser,
    getOwnerByMainDomain,
    getOwnerByDomainID,
    getSubDomainDetailsByDomainID,
    getApprovedByDomainID,
    setAvatar,
    approve,
    mintSubDomain,
    registerMainDomain,
    resetSubDomain,
    updateSubDomain,
  };
};
