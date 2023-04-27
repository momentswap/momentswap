import { task } from "hardhat/config";
import { deployAccount, deployMoment, deploySpaceFNS, deploySpaceMarket } from "./deployments";

task("deploy:SpaceMarket", "Deploy `SpaceMarket` contract").setAction(async (_, hre) => {
  await hre.run("compile");
  console.log("\nNetwork:", hre.network.name);
  await deploySpaceMarket(hre);
  console.log("\n✅ Deployment completed.");
});

task("deploy:SpaceFNS", "Deploy `SpaceFNS` contract").setAction(async (_, hre) => {
  await hre.run("compile");
  console.log("\nNetwork:", hre.network.name);
  await deploySpaceFNS(hre);
  console.log("\n✅ Deployment completed.");
});

task("deploy:Moment", "Deploy `Moment` contract").setAction(async (_, hre) => {
  await hre.run("compile");
  console.log("\nNetwork:", hre.network.name);
  await deployMoment(hre);
  console.log("\n✅ Deployment completed.");
});

task("deploy:Account", "Deploy `Account` contract")
  .addParam<string>("moment", "Address of `Moment` contract")
  .addParam<string>("spacefns", "Address of `SpaceFNS` contract")
  .setAction(async ({ moment, spacefns }, hre) => {
    await hre.run("compile");
    console.log("\nNetwork:", hre.network.name);
    await deployAccount(hre, moment, spacefns);
    console.log("\n✅ Deployment completed.");
  });

task("deploy:all", "Deploy the entire contract cluster").setAction(async (_, hre) => {
  await hre.run("compile");

  console.log("\nNetwork:", hre.network.name);

  await deploySpaceMarket(hre);
  const momentAddress = await deployMoment(hre);
  const spaceFnsAddress = await deploySpaceFNS(hre);
  const accountAddress = await deployAccount(hre, momentAddress, spaceFnsAddress);

  await hre.run("setCaller", {
    contractName: "Moment",
    contractAddress: momentAddress,
    callerAddress: accountAddress,
  });

  await hre.run("setCaller", {
    contractName: "SpaceFNS",
    contractAddress: spaceFnsAddress,
    callerAddress: accountAddress,
  });

  console.log("\n✅ Deployment completed.");
});
