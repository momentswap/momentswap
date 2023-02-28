import { ethers } from "hardhat";
import { RentMarket, RentMarket__factory } from "../typechain-types";

async function main() {
  console.log("RentMarket deploying....");

  const owner = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY || "undefined", ethers.provider);
  const rentMarketFactory: RentMarket__factory = await ethers.getContractFactory("RentMarket", owner);

  const rentMarket: RentMarket = await rentMarketFactory.deploy();
  await rentMarket.deployed();
  console.log("RentMarket deployed to ", rentMarket.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
