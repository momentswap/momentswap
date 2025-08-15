import { addAndSwitchHyperEvmChain, isWalletInstalled, detectWallet } from "@utils/helpers/wallet";
import { BigNumber, ethers } from "ethers";
import React, { ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Provider = ethers.providers.Web3Provider | undefined;
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
  connect: () => {
  },
  disconnect: () => {
  },
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

  useEffect(() => {
    const initializeWallet = async () => {
      try {
        console.log("🚀 Initializing wallet connection...");

        // Check if wallet is installed
        if (!isWalletInstalled()) {
          setProviderError("Please install MetaMask or other compatible wallet");
          return;
        }

        const ethereum = detectWallet();
        if (!ethereum) {
          setProviderError("No wallet detected");
          return;
        }

        // Try to switch to correct network
        try {
          await addAndSwitchHyperEvmChain();
        } catch (error) {
          console.warn("Network switch failed, continuing initialization:", error);
        }

        // Create Web3Provider
        const web3Provider = new ethers.providers.Web3Provider(ethereum, "any");

        // Wait for provider to be ready
        await web3Provider.ready;
        console.log("✅ Provider ready");

        setProviderError(null);
        setProvider(web3Provider);

        try {
          const network = await web3Provider.getNetwork();
          setChainId(network.chainId);
          console.log("🌐 Network connected successfully:", network);
        } catch (error) {
          console.error("❌ Failed to get network:", error);
          setProviderError("Network connection failed");
          return;
        }

        // Listen for network changes
        web3Provider.on("network", (newNetwork, oldNetwork) => {
          if (oldNetwork) {
            console.log("🔄 Network changed, reloading page");
            window.location.reload();
          }
        });

        // Check if already have authorized accounts
        try {
          const accounts = await ethereum.request({ method: "eth_accounts" });

          if (accounts && accounts.length > 0) {
            console.log("🔍 Found authorized account:", accounts[0]);
            const signer = web3Provider.getSigner();
            setSigner(signer);

            const address = await signer.getAddress();
            setAddress(address);
            localStorage.setItem("wallet-logged", "true");

            console.log("✅ Wallet auto-connected successfully");
            console.log("📍 Address:", address);
          } else {
            console.log("⏳ No authorized accounts found");
            localStorage.removeItem("wallet-logged");
          }
        } catch (error) {
          console.error("❌ Failed to check wallet connection status:", error);
          localStorage.removeItem("wallet-logged");
        }

        // Listen for account and network changes
        if (ethereum.on) {
          ethereum.on("chainChanged", (chainId: string) => {
            try {
              const newChainId = BigNumber.from(chainId).toNumber();
              console.log("🔄 Network switched to:", newChainId);
              setChainId(newChainId);
            } catch (e) {
              console.error("❌ Failed to handle network change:", e);
            }
          });

          ethereum.on("accountsChanged", (accounts: string[]) => {
            if (!accounts || accounts.length === 0) {
              console.log("🔌 User disconnected");
              setSigner(undefined);
              setAddress(undefined);
              localStorage.removeItem("wallet-logged");
            } else {
              console.log("👤 User switched account:", accounts[0]);
              if (web3Provider) {
                const signer = web3Provider.getSigner();
                setSigner(signer);
                signer.getAddress()
                  .then((newAddress) => {
                    setAddress(newAddress);
                    localStorage.setItem("wallet-logged", "true");
                  })
                  .catch(error => {
                    console.error("❌ Failed to get new account address:", error);
                    setProviderError("Failed to get account address");
                  });
              }
            }
          });
        }

      } catch (error) {
        console.error("❌ Wallet initialization failed:", error);
        setProviderError(`Initialization failed: ${error}`);
      }
    };

    initializeWallet();
  }, []);

  const connect = useCallback(async () => {
    console.log("🔗 User requesting wallet connection...");

    if (!isWalletInstalled()) {
      setProviderError("Please install MetaMask or other compatible wallet");
      window.open("https://metamask.io/download/", "_blank");
      return;
    }

    setProviderError(null);

    try {
      await addAndSwitchHyperEvmChain();

      const ethereum = detectWallet();
      if (!ethereum) {
        setProviderError("No wallet detected");
        return;
      }

      const web3Provider = new ethers.providers.Web3Provider(ethereum, "any");

      // Request user authorization - this will popup wallet
      console.log("🔐 Requesting user authorization...");
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      console.log("✅ User authorization successful:", accounts);

      setProvider(web3Provider);

      const network = await web3Provider.getNetwork();
      setChainId(network.chainId);

      const signer = web3Provider.getSigner();
      setSigner(signer);

      const address = await signer.getAddress();
      setAddress(address);

      localStorage.setItem("wallet-logged", "true");
      console.log("🎉 Wallet connected successfully!");
      console.log("📍 Address:", address);

    } catch (error: any) {
      console.error("❌ Failed to connect wallet:", error);
      if (error.code === 4001) {
        setProviderError("User rejected the connection request");
      } else if (error.code === -32002) {
        setProviderError("Wallet connection request pending, please check your wallet");
      } else {
        setProviderError(`Connection failed: ${error.message}`);
      }
      localStorage.removeItem("wallet-logged");
    }
  }, []);

  const disconnect = useCallback(() => {
    console.log("🔌 Disconnecting wallet");
    localStorage.removeItem("wallet-logged");
    setProviderError(null);
    setProvider(undefined);
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