import { task } from "hardhat/config";
import { deployAccount, deployMoment, deploySpaceFNS, deploySpaceMarket } from "./deployments";

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
