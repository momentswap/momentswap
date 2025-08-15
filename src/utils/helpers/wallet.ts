import { NETWORK_PARAM } from "@utils/definitions/consts";

export const isWalletInstalled = (): boolean => {
  return typeof window !== "undefined" && !!window.ethereum;
};

export const detectWallet = () => {
  if (typeof window !== "undefined" && window.ethereum) {
    return window.ethereum;
  }
  return null;
};

export const addAndSwitchHyperEvmChain = async (): Promise<void> => {
  if (!window.ethereum) {
    throw new Error("Please install a wallet");
  }

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: NETWORK_PARAM.chainId }],
    });
  } catch (switchError: any) {
    // If network doesn't exist (4902), add the network
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [NETWORK_PARAM],
        });
      } catch (addError) {
        console.error("Failed to add network:", addError);
        throw addError;
      }
    } else {
      console.error("Failed to switch network:", switchError);
      throw switchError;
    }
  }
};