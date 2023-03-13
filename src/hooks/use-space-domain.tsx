import { BigNumber } from "ethers";
import { useEffect, useState } from "react";
import { useSpaceFNSContract } from "./use-space-fns-contract";
import { useWalletProvider } from "./use-wallet-provider";

export const useSpaceDomain = (queryAddress?: string) => {
  const { address: loginAddress } = useWalletProvider();
  const { getAllDomainByCreator } = useSpaceFNSContract();
  const [loading, setLoading] = useState(false);
  const [mainDomain, setMainDomain] = useState("");
  const [subDomainIDs, setSubDomainIDs] = useState<BigNumber[]>([]);
  const [subDomainNames, setSubDomainNames] = useState<string[]>([]);
  const [subDomainUsers, setSubDomainUsers] = useState<string[]>([]);
  const address = queryAddress || loginAddress;
  useEffect(() => {
    (async () => {
      if (address) {
        try {
          setLoading(true);
          const [_mainDomain, _subDomainIDs, _subDomainNames, _subDomainUsers] = await getAllDomainByCreator(address);
          setLoading(false);
          setMainDomain(_mainDomain);
          setSubDomainIDs(_subDomainIDs);
          setSubDomainNames(_subDomainNames);
          setSubDomainUsers(_subDomainUsers);
        } catch {
          setLoading(false);
        }
      }
    })();
  }, [address]);

  return { mainDomain, subDomainIDs, subDomainNames, subDomainUsers, loading };
};
