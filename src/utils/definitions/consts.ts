export const DEFAULT_THEME = "pastel";

export const NETWORK_PARAM =
  process.env.NEXT_PUBLIC_FILECOIN_NETWORK == "mainnet"
    ? {
        chainId: "0x13a",
        chainName: "Filecoin - Mainnet",
        nativeCurrency: {
          name: "mainnet filecoin",
          symbol: "FIL",
          decimals: 18,
        },
        rpcUrls: ["https://rpc.ankr.com/filecoin", "https://rpc.ankr.com/filecoin"],
        blockExplorerUrls: ["https://filfox.info/en"],
      }
    : {
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
      };
