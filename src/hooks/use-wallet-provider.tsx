import detectEthereumProvider from "@metamask/detect-provider";
import { NETWORK_PARAM } from "@utils/definitions/consts";
import { addAndSwitchFilecoinChain, isMetaMaskInstalled } from "@utils/helpers";
import { BigNumber, ethers } from "ethers";
import React, { ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useChainList } from "./use-chain-list";

export type Provider = ethers.providers.Web3Provider | ethers.providers.JsonRpcProvider | undefined;
export type Signer = ethers.Signer | undefined;

interface WalletProviderContext {
  provider: Provider;
  chainId: number | undefined;
  signer: Signer;
  address: string | undefined;
  providerError: string | null;
  connect(): void;
  disconnect(): void;
}

const WalletProviderContext = React.createContext<WalletProviderContext>({
  connect: () => {},
  disconnect: () => {},
  provider: undefined,
  chainId: undefined,
  signer: undefined,
  address: undefined,
  providerError: null,
});

export const WalletProviderProvider = ({ children }: { children: ReactNode }) => {
  const [signer, setSigner] = useState<Signer>(undefined);
  const [provider, setProvider] = useState<Provider>(undefined);
  const [chainId, setChainId] = useState<number | undefined>(undefined);
  const [address, setAddress] = useState<string | undefined>(undefined);
  const [providerError, setProviderError] = useState<string | null>(null);
  const chainList = useChainList(s=>s.TYPE)

  useEffect(() => {
    (async () => {
      chainList==="FIL"&& await addAndSwitchFilecoinChain();

      let provider = new ethers.providers.JsonRpcProvider(NETWORK_PARAM.rpcUrls[0]);

      try {
        const detectedProvider = await detectEthereumProvider();
        if (detectedProvider) {
          provider = new ethers.providers.Web3Provider(detectedProvider, "any");
        }
      } catch {}

      setProviderError(null);
      setProvider(provider);
      provider.getNetwork().then((network) => {
        setChainId(network.chainId);
      });
      // Force page refresh when network changes.
      provider.on("network", (_, oldNetwork) => {
        if (oldNetwork) {
          window.location.reload();
        }
      });

      const logged = localStorage.getItem("wallet-logged");
      if (logged) {
        const signer = provider.getSigner();
        setSigner(signer);
        signer
          .getAddress()
          .then((address) => {
            setAddress(address);
          })
          .catch(() => {
            setProviderError("An error occurred while getting the signer address");
          });
      }
    })();
  }, []);

  const connect = useCallback(() => {
    if (!isMetaMaskInstalled()) {
      setProviderError("MetaMask not installed.");
      alert("Please install MetaMask!");
      throw new Error("MetaMask not installed.");
    }
    setProviderError(null);
    addAndSwitchFilecoinChain().then(() => {
      detectEthereumProvider()
        .then((detectedProvider) => {
          if (detectedProvider) {
            const provider = new ethers.providers.Web3Provider(
              // @ts-ignore
              detectedProvider,
              "any",
            );
            // Force page refresh when network changes.
            provider.on("network", (_, oldNetwork) => {
              if (oldNetwork) {
                window.location.reload();
              }
            });
            provider
              .send("eth_requestAccounts", [])
              .then(() => {
                setProviderError(null);
                setProvider(provider);
                provider
                  .getNetwork()
                  .then((network) => {
                    setChainId(network.chainId);
                  })
                  .catch(() => {
                    setProviderError("An error occurred while getting the network");
                  });
                const signer = provider.getSigner();
                setSigner(signer);
                signer
                  .getAddress()
                  .then((address) => {
                    setAddress(address);
                  })
                  .catch(() => {
                    setProviderError("An error occurred while getting the signer address");
                  });
                // TODO: try using ethers directly
                // @ts-ignore
                if (detectedProvider && detectedProvider.on) {
                  // @ts-ignore
                  detectedProvider.on("chainChanged", (chainId) => {
                    try {
                      setChainId(BigNumber.from(chainId).toNumber());
                    } catch (e) {}
                  });
                  // @ts-ignore
                  detectedProvider.on("accountsChanged", (accounts) => {
                    try {
                      const signer = provider.getSigner();
                      setSigner(signer);
                      signer
                        .getAddress()
                        .then((address) => {
                          setAddress(address);
                        })
                        .catch(() => {
                          setProviderError("An error occurred while getting the signer address");
                        });
                    } catch (e) {}
                  });
                }
                localStorage.setItem("wallet-logged", "true");
              })
              .catch(() => {
                setProviderError("An error occurred while requesting eth accounts");
              });
          } else {
            setProviderError("Please install MetaMask");
          }
        })
        .catch(() => {
          setProviderError("Please install MetaMask");
        });
    });
  }, []);

  const disconnect = useCallback(() => {
    localStorage.removeItem("wallet-logged");
    setProviderError(null);
    // setProvider(undefined);
    setChainId(undefined);
    setSigner(undefined);
    setAddress(undefined);
  }, []);

  const contextValue = useMemo(
    () => ({
      connect,
      disconnect,
      provider,
      chainId,
      signer,
      address,
      providerError,
    }),
    [connect, disconnect, provider, chainId, signer, address, providerError],
  );
  return <WalletProviderContext.Provider value={contextValue}>{children}</WalletProviderContext.Provider>;
};

export const useWalletProvider = () => {
  return useContext(WalletProviderContext);
};
