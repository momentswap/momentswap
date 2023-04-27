import { HardhatRuntimeEnvironment } from "hardhat/types";

import type { SpaceMarket, SpaceMarket__factory } from "../../typechain-types";

export async function upgradeSpaceMarket(hre: HardhatRuntimeEnvironment, spaceMarketAddress: string) {
  console.log("SpaceMarket upgrading....");

  const spaceMarketFactory: SpaceMarket__factory = <SpaceMarket__factory>(
    await hre.ethers.getContractFactory("SpaceMarket")
  );
  const spaceMarket: SpaceMarket = <SpaceMarket>await hre.upgrades.upgradeProxy(spaceMarketAddress, spaceMarketFactory);
  await spaceMarket.deployed();

  console.log(`✅ SpaceMarket upgraded to: ${spaceMarket.address}\n`);
  return spaceMarket.address;
}
