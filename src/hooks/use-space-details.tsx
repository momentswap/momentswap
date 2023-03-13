import { useEffect, useState } from "react";
import { useSpaceFNSContract } from "./use-space-fns-contract";
import { useWalletProvider } from "./use-wallet-provider";

export const useSpaceDetails = (queryAddress?: string) => {
  const { address: loginAddress } = useWalletProvider();
  const { getAllDomainByCreator } = useSpaceFNSContract();
  const [loading, setLoading] = useState(false);
  const address = queryAddress || loginAddress;
  useEffect(() => {
    (async () => {
      if (address) {
        try {
          setLoading(true);
          const [_mainDomain, _subDomains, _subDomainTenants, _leasedDomains] = await getAllDomainByCreator(address);
          setLoading(false);
        } catch {
          setLoading(false);
        }
      }
    })();
  }, [address]);

  return { loading };
};
