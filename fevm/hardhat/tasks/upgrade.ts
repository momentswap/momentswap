import { task } from "hardhat/config";
import { upgradeAccount, upgradeMoment, upgradeSpaceFNS, upgradeSpaceMarket } from "./upgrades";

task("upgrade:SpaceMarket", "Deploy `SpaceMarket` contract")
  .addParam<string>("spacemarket", "The proxy contract address for the `SpaceMarket` contract")
  .setAction(async ({ spacemarket }, hre) => {
    await hre.run("compile");
    console.log("\nNetwork:", hre.network.name);
    await upgradeSpaceMarket(hre, spacemarket);
    console.log("\n✅ Upgrade completed.");
  });

task("upgrade:SpaceFNS", "Deploy `SpaceFNS` contract")
  .addParam<string>("spacefns", "The proxy contract address for the `SpaceFNS` contract")
  .setAction(async ({ spacefns }, hre) => {
    await hre.run("compile");
    console.log("\nNetwork:", hre.network.name);
    await upgradeSpaceFNS(hre, spacefns);
    console.log("\n✅ Upgrade completed.");
  });

task("upgrade:Moment", "Deploy `Moment` contract")
  .addParam<string>("moment", "The proxy contract address for the `Moment` contract")
  .setAction(async ({ moment }, hre) => {
    await hre.run("compile");
    console.log("\nNetwork:", hre.network.name);
    await upgradeMoment(hre, moment);
    console.log("\n✅ Upgrade completed.");
  });

task("upgrade:Account", "Deploy Account contract")
  .addParam<string>("account", "The proxy contract address for the `Account` contract")
  .setAction(async ({ account }, hre) => {
    await hre.run("compile");
    console.log("\nNetwork:", hre.network.name);
    await upgradeAccount(hre, account);
    console.log("\n✅ Upgrade completed.");
  });

task("upgrade:all", "Deploy the entire contract cluster")
  .addParam<string>("account", "The proxy contract address for the `Account` contract")
  .addParam<string>("moment", "The proxy contract address for the `Moment` contract")
  .addParam<string>("spacefns", "The proxy contract address for the `SpaceFNS` contract")
  .addParam<string>("spacemarket", "The proxy contract address for the `SpaceMarket` contract")
  .setAction(async ({ account, moment, spacefns, spacemarket }, hre) => {
    await hre.run("compile");

    console.log("\nNetwork:", hre.network.name);
    await upgradeMoment(hre, moment);
    await upgradeSpaceFNS(hre, spacefns);
    await upgradeAccount(hre, account);
    await upgradeSpaceMarket(hre, spacemarket);

    console.log("\n✅ Upgrade completed.");
  });
