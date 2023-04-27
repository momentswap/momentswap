import { HardhatRuntimeEnvironment } from "hardhat/types";
import type { Account, Account__factory } from "../../typechain-types";

export async function upgradeAccount(hre: HardhatRuntimeEnvironment, accountAddress: string) {
  console.log("Account upgrading....");

  const accountFactory: Account__factory = <Account__factory>await hre.ethers.getContractFactory("Account");
  const account: Account = <Account>await hre.upgrades.upgradeProxy(accountAddress, accountFactory);
  await account.deployed();

  console.log(`✨ Account upgraded to: ${account.address}\n`);
  return account.address;
}
