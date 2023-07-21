// See https://hardhat.org/hardhat-runner/docs/config
// Hardhat's config file will always run before any task,
// so you can use it to integrate with other tools, like importing @babel/register.
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import { config as dotenvConfig } from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
import { resolve } from "path";
// import type { NetworkUserConfig } from 'hardhat/types';

//Import our customised tasks
import "./fevm/hardhat/tasks";


if (!process.env.WALLET_PRIVATE_KEY) {
  dotenvConfig({ path: resolve(__dirname, process.env.DOT_ENV_PATH || ".env"), override: true });
}

const walletPrivateKey: string | undefined = process.env.WALLET_PRIVATE_KEY;
const accounts = walletPrivateKey ? [walletPrivateKey] : [];

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  defaultNetwork: "filecoinCalibration",
  networks: {
    hardhat: {},
    filecoinMainnet: {
      url: "https://api.node.glif.io",
      chainId: 314,
      accounts: accounts,
      gas: 1000000000,
      timeout: 90000,
    },
    filecoinCalibration: {
      url: "https://api.calibration.node.glif.io/rpc/v1",
      chainId: 314159,
      accounts: accounts,
      gas: 1000000000,
      timeout: 90000,
    },
    filecoinWallaby: {
      url: "https://wallaby.node.glif.io/rpc/v0",
      chainId: 31415,
      accounts: accounts,
      gas: 1000000000,
      timeout: 90000,
      //explorer: https://wallaby.filscan.io/ and starboard
    },
    filecoinHyperspace: {
      url: "https://rpc.ankr.com/filecoin_testnet", //https://beryx.zondax.ch/ //chainstack
      chainId: 3141,
      accounts: accounts,
      gas: 1000000000,
      timeout: 90000,
    },
    ethGoerli: {
      url: "https://rpc.ankr.com/eth_goerli",
      chainId: 5,
      accounts: accounts,
    },
    ethSepolia: {
      url: "https://ethereum-sepolia.blockpi.network/v1/rpc/public",
      chainId: 11155111,
      accounts: accounts,
    },
  },
  paths: {
    root: "./fevm/hardhat",
    tests: "./fevm/hardhat/test",
    cache: "./fevm/hardhat/cache",
  },
  mocha: { timeout: 40000 },
};

export default config;