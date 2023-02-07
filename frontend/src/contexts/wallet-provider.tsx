import { BigNumber, ethers } from "ethers";
import detectEthereumProvider from "@metamask/detect-provider";
import React, {
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Provider = ethers.providers.Web3Provider | undefined;
export type Signer = ethers.Signer | undefined;

interface WalletProviderContext {
  provider: Provider;
  chainId: number | undefined;
  signer: Signer;
  signerAddress: string | undefined;
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
  signerAddress: undefined,
  providerError: null,
});

export const WalletProviderProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [providerError, setProviderError] = useState<string | null>(null);
  const [provider, setProvider] = useState<Provider>(undefined);
  const [chainId, setChainId] = useState<number | undefined>(undefined);
  const [signer, setSigner] = useState<Signer>(undefined);
  const [signerAddress, setSignerAddress] = useState<string | undefined>(
    undefined
  );
  useEffect(() => {
    const logged = localStorage.getItem("eth-logged");
    if (logged) {
      detectEthereumProvider().then((detectedProvider) => {
        if (detectedProvider) {
          const provider = new ethers.providers.Web3Provider(
            // @ts-ignore
            detectedProvider,
            "any"
          );
          provider.send("eth_requestAccounts", []).then(() => {
            setProviderError(null);
            setProvider(provider);
            provider.getNetwork().then((network) => {
              setChainId(network.chainId);
            });
            const signer = provider.getSigner();
            setSigner(signer);
            signer
              .getAddress()
              .then((address) => {
                setSignerAddress(address);
              })
              .catch(() => {
                setProviderError(
                  "An error occurred while getting the signer address"
                );
              });
          });
        }
      });
    }
  }, []);

  const connect = useCallback(() => {
    setProviderError(null);
    detectEthereumProvider()
      .then((detectedProvider) => {
        if (detectedProvider) {
          const provider = new ethers.providers.Web3Provider(
            // @ts-ignore
            detectedProvider,
            "any"
          );
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
                  setProviderError(
                    "An error occurred while getting the network"
                  );
                });
              const signer = provider.getSigner();
              setSigner(signer);
              signer
                .getAddress()
                .then((address) => {
                  setSignerAddress(address);
                })
                .catch(() => {
                  setProviderError(
                    "An error occurred while getting the signer address"
                  );
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
                        setSignerAddress(address);
                      })
                      .catch(() => {
                        setProviderError(
                          "An error occurred while getting the signer address"
                        );
                      });
                  } catch (e) {}
                });
              }
              localStorage.setItem("eth-logged", "true");
            })
            .catch(() => {
              setProviderError(
                "An error occurred while requesting eth accounts"
              );
            });
        } else {
          setProviderError("Please install MetaMask");
        }
      })
      .catch(() => {
        setProviderError("Please install MetaMask");
      });
  }, []);

  const disconnect = useCallback(() => {
    localStorage.removeItem("eth-logged");
    setProviderError(null);
    setProvider(undefined);
    setChainId(undefined);
    setSigner(undefined);
    setSignerAddress(undefined);
  }, []);

  const contextValue = useMemo(
    () => ({
      connect,
      disconnect,
      provider,
      chainId,
      signer,
      signerAddress,
      providerError,
    }),
    [
      connect,
      disconnect,
      provider,
      chainId,
      signer,
      signerAddress,
      providerError,
    ]
  );
  return (
    <WalletProviderContext.Provider value={contextValue}>
      {children}
    </WalletProviderContext.Provider>
  );
};
export const useWalletProvider = () => {
  return useContext(WalletProviderContext);
};
