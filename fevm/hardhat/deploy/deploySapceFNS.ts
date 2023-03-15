import { ethers } from "hardhat";
import { SpaceFNS, SpaceFNS__factory } from "../typechain-types";

async function main() {
  console.log("SpaceFNS deploying....");

  const owner = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY || "undefined", ethers.provider);
  const spaceFNSFactory: SpaceFNS__factory = await ethers.getContractFactory("SpaceFNS", owner);

  const spaceFNS: SpaceFNS = await spaceFNSFactory.deploy();
  await spaceFNS.deployed();
  console.log("SpaceFNS deployed to ", spaceFNS.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
