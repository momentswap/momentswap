import { HardhatRuntimeEnvironment } from "hardhat/types";

import type { SpaceMarket, SpaceMarket__factory } from "../../typechain-types";

export default async function deploySpaceMarket(hre: HardhatRuntimeEnvironment) {
  console.log("\nSpaceMarket deploying....");

  const spaceMarketFactory: SpaceMarket__factory = <SpaceMarket__factory>(
    await hre.ethers.getContractFactory("SpaceMarket")
  );
  const spaceMarket: SpaceMarket = <SpaceMarket>await spaceMarketFactory.deploy();
  await spaceMarket.deployed();

  console.log("✨ SpaceMarket deployed to:", spaceMarket.address);
  return spaceMarket.address;
}
