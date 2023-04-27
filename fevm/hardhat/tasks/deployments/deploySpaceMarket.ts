import { HardhatRuntimeEnvironment } from "hardhat/types";

import type { SpaceMarket, SpaceMarket__factory } from "../../typechain-types";

export async function deploySpaceMarket(hre: HardhatRuntimeEnvironment) {
  console.log("SpaceMarket deploying....");

  const spaceMarketFactory: SpaceMarket__factory = <SpaceMarket__factory>(
    await hre.ethers.getContractFactory("SpaceMarket")
  );
  const spaceMarket: SpaceMarket = <SpaceMarket>await hre.upgrades.deployProxy(spaceMarketFactory, []);
  await spaceMarket.deployed();

  console.log(`✅ SpaceMarket deployed to: ${spaceMarket.address}\n`);
  return spaceMarket.address;
}
