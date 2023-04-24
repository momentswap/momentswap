import { HardhatRuntimeEnvironment } from "hardhat/types";
import type { SpaceFNS, SpaceFNS__factory } from "../../typechain-types";

export async function deploySpaceFNS(hre: HardhatRuntimeEnvironment) {
  console.log("SpaceFNS deploying....");

  const spaceFNSFactory: SpaceFNS__factory = <SpaceFNS__factory>await hre.ethers.getContractFactory("SpaceFNS");
  const spaceFNS: SpaceFNS = <SpaceFNS>await hre.upgrades.deployProxy(spaceFNSFactory, []);
  await spaceFNS.deployed();

  console.log(`✨ SpaceFNS deployed to: ${spaceFNS.address}\n`);
  return spaceFNS.address;
}
