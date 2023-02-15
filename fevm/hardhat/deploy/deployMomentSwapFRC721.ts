import hre from "hardhat";

import type { MomentSwapFRC721, MomentSwapFRC721__factory } from "../typechain-types";

async function main() {
  console.log("MomentSwap721 deploying....");

  const owner = new hre.ethers.Wallet(process.env.WALLET_PRIVATE_KEY || "undefined", hre.ethers.provider);
  const momentSwapFRC721Factory: MomentSwapFRC721__factory = <MomentSwapFRC721__factory>(
    await hre.ethers.getContractFactory("MomentSwapFRC721", owner)
  );

  const momentSwapFRC721: MomentSwapFRC721 = <MomentSwapFRC721>await momentSwapFRC721Factory.deploy();
  await momentSwapFRC721.deployed();
  console.log("momentSwapFRC721 deployed to ", momentSwapFRC721.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// import path from 'path';
//Optional: Log to a file for reference
// await hre.run('logToFile', {
//   filePath: path.resolve(__dirname, 'log.txt'),
//   data: {
//     network: 'hyperspace',
//     chainId: momentSwapFRC721.deployTransaction.chainId,
//     owner: momentSwapFRC721.deployTransaction.from,
//     address: momentSwapFRC721.address,
//     tx: momentSwapFRC721.deployTransaction.hash,
//     explorerUrl: `https://hyperspace.filscan.io/address/general?address=${momentSwapFRC721.address}`,
//   },
// });
