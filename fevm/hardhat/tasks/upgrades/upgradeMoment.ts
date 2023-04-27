import { HardhatRuntimeEnvironment } from "hardhat/types";
import type { Moment, Moment__factory } from "../../typechain-types";

export async function upgradeMoment(hre: HardhatRuntimeEnvironment, momentAddress: string) {
  console.log("Moment upgrading....");

  const momentFactory: Moment__factory = <Moment__factory>await hre.ethers.getContractFactory("Moment");
  const moment: Moment = <Moment>await hre.upgrades.upgradeProxy(momentAddress, momentFactory);
  await moment.deployed();

  console.log(`✅ Moment upgraded to: ${moment.address}\n`);
  return moment.address;
}
