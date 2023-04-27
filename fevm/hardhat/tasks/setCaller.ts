import { task } from "hardhat/config";

task("setCaller", "Allows the contract owner to set the caller address.")
  .addParam<string>("contractName", "Need to set the caller's contract Name")
  .addParam<string>("contractAddress", "Need to set the caller's contract address")
  .addParam<string>("callerAddress", "Caller contract Address")
  .setAction(async ({ contractName, contractAddress, callerAddress }, { ethers }) => {
    // const owner = new hre.ethers.Wallet(process.env.WALLET_PRIVATE_KEY || "undefined", hre.ethers.provider);
    const contractFactory: any = await ethers.getContractFactory(contractName);
    const contract = contractFactory.attach(contractAddress);
    console.log(`\nSetting the caller for the ${contractName} contract...`);

    try {
      await contract.setCaller(callerAddress);
    } catch (err) {
      console.log(err);
    }
  });
