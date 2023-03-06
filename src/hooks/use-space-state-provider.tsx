import React, { ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { useSpaceFNSContract } from "./use-space-fns-contract";
import { useWalletProvider } from "./use-wallet-provider";

interface SpaceStateContext {
  mainDomain: string;
  subDomains: string[];
  subDomainTenants: string[];
  leasedDomains: string[];
}

const SpaceStateProviderContext = React.createContext<SpaceStateContext>({
  mainDomain: "",
  subDomains: [],
  subDomainTenants: [],
  leasedDomains: [],
});

export const SpaceStateProviderProvider = ({ children }: { children: ReactNode }) => {
  const { address } = useWalletProvider();
  const { getAllDomainByWallet } = useSpaceFNSContract();
  const [mainDomain, setMainDomain] = useState("");
  const [subDomains, setSubDomains] = useState<string[]>([]);
  const [subDomainTenants, setSubDomainTenants] = useState<string[]>([]);
  const [leasedDomains, setLeasedDomains] = useState<string[]>([]);
  useEffect(() => {
    (async () => {
      if (address) {
        try {
          const [_mainDomain, _subDomains, _subDomainTenants, _leasedDomains] = await getAllDomainByWallet(address);
          setMainDomain(_mainDomain);
          setSubDomains(_subDomains);
          setSubDomainTenants(_subDomainTenants);
          setLeasedDomains(_leasedDomains);
        } catch {}
      }
    })();
  }, [address]);

  const contextValue = useMemo(
    () => ({ mainDomain, subDomains, subDomainTenants, leasedDomains }),
    [mainDomain, subDomains, subDomainTenants, leasedDomains],
  );
  return <SpaceStateProviderContext.Provider value={contextValue}>{children}</SpaceStateProviderContext.Provider>;
};

export const useSpaceStateProvider = () => {
  return useContext(SpaceStateProviderContext);
};
