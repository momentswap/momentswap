import { HardhatRuntimeEnvironment } from "hardhat/types";
import type { SpaceFNS, SpaceFNS__factory } from "../../typechain-types";

export default async function deploySpaceFNS(hre: HardhatRuntimeEnvironment) {
  console.log("\nSpaceFNS deploying....");

  const spaceFNSFactory: SpaceFNS__factory = <SpaceFNS__factory>await hre.ethers.getContractFactory("SpaceFNS");
  const spaceFNS: SpaceFNS = <SpaceFNS>await spaceFNSFactory.deploy();
  await spaceFNS.deployed();

  console.log("✨ SpaceFNS deployed to:", spaceFNS.address);
  return spaceFNS.address;
}
