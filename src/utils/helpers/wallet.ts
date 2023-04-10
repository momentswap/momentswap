import { NETWORK_PARAM } from "@utils/definitions/consts";

const network = process.env.NEXT_PUBLIC_FILECOIN_NETWORK;
export const addAndSwitchFilecoinChain = async () => {
  console.log(NETWORK_PARAM);

  try {
    window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [NETWORK_PARAM],
    });
  } catch {}
};

//Created check function to see if the MetaMask extension is installed
export const isMetaMaskInstalled = () => {
  //Have to check the ethereum binding on the window object to see if it's installed
  const { ethereum } = window;
  return Boolean(ethereum && ethereum.isMetaMask);
};
