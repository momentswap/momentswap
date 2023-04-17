import { HardhatRuntimeEnvironment } from "hardhat/types";
import type { Account, Account__factory } from "../../typechain-types";

export async function deployAccount(hre: HardhatRuntimeEnvironment, momentAddress: string, spaceFnsAddress: string) {
  console.log("\nAccount deploying....");

  const accountFactory: Account__factory = <Account__factory>await hre.ethers.getContractFactory("Account");
  const account: Account = <Account>await accountFactory.deploy(momentAddress, spaceFnsAddress);
  await account.deployed();

  console.log("✨ Account deployed to:", account.address);
  return account.address;
}
