import { HardhatRuntimeEnvironment } from "hardhat/types";
import type { Moment, Moment__factory } from "../../typechain-types";

export default async function deployMoment(hre: HardhatRuntimeEnvironment) {
  console.log("\nMoment deploying....");

  const momentFactory: Moment__factory = <Moment__factory>await hre.ethers.getContractFactory("Moment");
  const moment: Moment = <Moment>await momentFactory.deploy();
  await moment.deployed();

  console.log("✨ Moment deployed to:", moment.address);
  return moment.address;
}
