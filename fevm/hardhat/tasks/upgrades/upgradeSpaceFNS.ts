import { HardhatRuntimeEnvironment } from "hardhat/types";
import type { SpaceFNS, SpaceFNS__factory } from "../../typechain-types";

export async function upgradeSpaceFNS(hre: HardhatRuntimeEnvironment, spaceFnsAddress: string) {
  console.log("SpaceFNS upgrading....");

  const spaceFNSFactory: SpaceFNS__factory = <SpaceFNS__factory>await hre.ethers.getContractFactory("SpaceFNS");
  const spaceFNS: SpaceFNS = <SpaceFNS>await hre.upgrades.upgradeProxy(spaceFnsAddress, spaceFNSFactory);
  await spaceFNS.deployed();

  console.log(`✅ SpaceFNS upgraded to: ${spaceFNS.address}\n`);
  return spaceFNS.address;
}
