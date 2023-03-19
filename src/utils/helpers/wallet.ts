import { NetworkParams } from "@utils/definitions/consts";

const network = process.env.NEXT_PUBLIC_FILECOIN_NETWORK;
export const addAndSwitchFilecoinChain = (): Promise<any> => {
  let params;
  if (network == "mainnet") {
    params = NetworkParams[0];
  } else {
    params = NetworkParams[1];
  }
  console.log(network);

  console.log(params);

  return window.ethereum.request({
    method: "wallet_addEthereumChain",
    params: [params],
  });
};

//Created check function to see if the MetaMask extension is installed
export const isMetaMaskInstalled = () => {
  //Have to check the ethereum binding on the window object to see if it's installed
  const { ethereum } = window;
  return Boolean(ethereum && ethereum.isMetaMask);
};
