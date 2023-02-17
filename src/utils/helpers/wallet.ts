export const addAndSwitchFilecoinChain = (): Promise<any> => {
  return window.ethereum.request({
    method: "wallet_addEthereumChain",
    params: [
      {
        chainId: "0xc45",
        chainName: "Filecoin - Hyperspace testnet",
        nativeCurrency: {
          name: "testnet filecoin",
          symbol: "tFIL",
          decimals: 18,
        },
        rpcUrls: [
          "https://api.hyperspace.node.glif.io/rpc/v1",
          "https://filecoin-hyperspace.chainstacklabs.com/rpc/v1",
        ],
        blockExplorerUrls: ["https://hyperspace.filfox.info/en"],
      },
    ],
  });
};

//Created check function to see if the MetaMask extension is installed
export const isMetaMaskInstalled = () => {
  //Have to check the ethereum binding on the window object to see if it's installed
  const { ethereum } = window;
  return Boolean(ethereum && ethereum.isMetaMask);
};
