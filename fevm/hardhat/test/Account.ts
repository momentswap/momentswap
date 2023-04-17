import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { deployAccount, deployMoment, deploySpaceFNS } from "../tasks/deployments";
import { Account, Moment, SpaceFNS } from "../typechain-types";

describe("Account", function () {
  let account: Account;
  let moment: Moment;
  let spaceFNS: SpaceFNS;

  async function fixture() {
    await hre.run("compile");

    const momentAddress = await deployMoment(hre);
    const spaceFnsAddress = await deploySpaceFNS(hre);
    const accountAddress = await deployAccount(hre, momentAddress, spaceFnsAddress);

    moment = (await hre.ethers.getContractFactory("Moment")).attach(momentAddress);
    spaceFNS = (await hre.ethers.getContractFactory("SpaceFNS")).attach(spaceFnsAddress);
    account = (await hre.ethers.getContractFactory("Account")).attach(accountAddress);
  }

  beforeEach(async () => {
    await loadFixture(fixture);
  });

  it("Should set the contract caller for Moment", async function () {
    await moment.setCaller(account.address);
    expect(await moment.caller()).to.equal(account.address);
  });

  it("Should set the contract caller for SpaceFNS", async function () {
    await spaceFNS.setCaller(account.address);
    expect(await spaceFNS.caller()).to.equal(account.address);
  });

  //TODO: Improve test case
});
