// See https://hardhat.org/hardhat-runner/docs/config
// Hardhat's config file will always run before any task,
// so you can use it to integrate with other tools, like importing @babel/register.
import "@nomicfoundation/hardhat-toolbox";
import { config as dotenvConfig } from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
import { resolve } from "path";
// import type { NetworkUserConfig } from 'hardhat/types';

//Import our customised tasks
import "./fevm/hardhat/tasks";

if (!process.env.WALLET_PRIVATE_KEY) {
  dotenvConfig({ path: resolve(__dirname, ".env"), override: true });
}

const walletPrivateKey: string | undefined = process.env.WALLET_PRIVATE_KEY;
const accounts = walletPrivateKey ? [walletPrivateKey] : [];

const config: HardhatUserConfig = {
  solidity: "0.8.19",
  mocha: { timeout: 600000 },
  defaultNetwork: "filecoinHyperspace",
  networks: {
    hardhat: {},
    filecoinMainnet: {
      url: "https://api.node.glif.io",
      chainId: 314,
      accounts: accounts,
    },
    filecoinWallaby: {
      url: "https://wallaby.node.glif.io/rpc/v0",
      chainId: 31415,
      accounts: accounts,
      //explorer: https://wallaby.filscan.io/ and starboard
    },
    filecoinHyperspace: {
      url: "https://api.hyperspace.node.glif.io/rpc/v1", //https://beryx.zondax.ch/ //chainstack
      chainId: 3141,
      accounts: accounts,
      gasMultiplier: 3,
    },
    ethGoerli: {
      url: "https://eth-goerli.g.alchemy.com/v2/S4Rrp2eHb-xk5dxnNQygNcv-QfPmzTXX",
      chainId: 5,
      accounts: accounts,
    },
  },
  paths: {
    root: "./fevm/hardhat",
    tests: "./fevm/hardhat/test",
    cache: "./fevm/hardhat/cache",
  },
};

export default config;