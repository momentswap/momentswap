import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import hre, { upgrades } from "hardhat";
import { Account, SpaceFNS, SpaceMarket } from "../typechain-types";
import { calcGasFee, zeroAddress } from "./utils";

describe("SpaceMarket contract", function () {
  let account: Account;
  let spaceFNS: SpaceFNS;
  let spaceMarket: SpaceMarket;
  let wallets: SignerWithAddress[];

  async function fixture() {
    await hre.run("compile");

    const accountFactory = await hre.ethers.getContractFactory("Account");
    const spaceFNSFactory = await hre.ethers.getContractFactory("SpaceFNS");
    const spaceMarketFactory = await hre.ethers.getContractFactory("SpaceMarket");

    spaceMarket = <SpaceMarket>await upgrades.deployProxy(spaceMarketFactory, []);
    spaceFNS = <SpaceFNS>await upgrades.deployProxy(spaceFNSFactory, []);
    account = <Account>await upgrades.deployProxy(accountFactory, [zeroAddress, spaceFNS.address]);

    wallets = await hre.ethers.getSigners();
  }

  beforeEach(async () => {
    await loadFixture(fixture);
    await spaceFNS.setCaller(account.address);

    await account.createAccount("foo", "ipfs://bafkreiep4swwvvpwhyskpz2zzxbgom6o7yrccyu4bxpizhjfyvigwfqynu");
    await account
      .connect(wallets[1])
      .createAccount("bar", "ipfs://bafkreiep4swwvvpwhyskpz2zzxbgom6o7yrccyu4bxpizhjfyvigwfqynu");
    await account.createSubSpaceDomain(1, "sub1", 1000); // space id: 3
    await account.createSubSpaceDomain(1, "sub2", 1000); // space id: 4
    await account.createSubSpaceDomain(1, "sub3", 1000); // space id: 5
  });

  it("Should revert if not appoved for listing space", async function () {
    await expect(spaceMarket.listSpace(account.address, 3, 1000, 50)).to.revertedWithCustomError(
      spaceMarket,
      "NotAppovedToMarket",
    );
  });

  it("Should revert if non-owner to list space", async function () {
    await account.approve(spaceMarket.address, 3);
    await expect(spaceMarket.connect(wallets[1]).listSpace(account.address, 3, 1000, 50)).to.revertedWithCustomError(
      spaceMarket,
      "NotCreator",
    );
  });

  it("Should allow listing space", async function () {
    await account.approve(spaceMarket.address, 3);
    await spaceMarket.listSpace(account.address, 3, 3000, 50);

    expect(await spaceMarket.getItemPrice(account.address, 3)).to.equal(BigNumber.from(50));
    expect((await spaceMarket.batchGetItemPrice(account.address, [3]))[0]).to.equal(BigNumber.from(50));
    expect((await spaceFNS.getSpaceDomainByID(3))[2]).to.equal(BigNumber.from(3000));
  });

  it("Should revert if duplicate space on shelves", async function () {
    await account.approve(spaceMarket.address, 3);
    await spaceMarket.listSpace(account.address, 3, 1000, 50);

    await expect(spaceMarket.listSpace(account.address, 3, 1000, 50)).to.revertedWithCustomError(
      spaceMarket,
      "AlreadyListed",
    );
  });

  it("Should allow updating listed space", async function () {
    await account.approve(spaceMarket.address, 3);
    await spaceMarket.listSpace(account.address, 3, 1000, 50);

    await spaceMarket.updateListedSpace(account.address, 3, 3000, 100);
    expect(await spaceMarket.getItemPrice(account.address, 3)).to.equal(BigNumber.from(100));
    expect((await spaceMarket.batchGetItemPrice(account.address, [3]))[0]).to.equal(BigNumber.from(100));
    expect((await spaceFNS.getSpaceDomainByID(3))[2]).to.equal(BigNumber.from(3000));
  });

  it("Should revert if the space price is zero", async function () {
    await account.approve(spaceMarket.address, 3);
    await expect(spaceMarket.listSpace(account.address, 3, 1000, 0)).to.revertedWithCustomError(
      spaceMarket,
      "PriceMustBeAboveZero",
    );
    await spaceMarket.listSpace(account.address, 3, 1000, 100);
    await expect(spaceMarket.updateListedSpace(account.address, 3, 1000, 0)).to.revertedWithCustomError(
      spaceMarket,
      "PriceMustBeAboveZero",
    );
  });

  it("Should revert if insufficient rental fees", async function () {
    await account.approve(spaceMarket.address, 3);
    await spaceMarket.listSpace(account.address, 3, 1000, 50);

    await expect(spaceMarket.rentSpace(account.address, 3, 2, { value: 49 })).to.revertedWithCustomError(
      spaceMarket,
      "PriceNotMet",
    );
  });

  it("Should allow renting space", async function () {
    await account.approve(spaceMarket.address, 3);
    await spaceMarket.listSpace(account.address, 3, 1000, 50);
    await spaceMarket.rentSpace(account.address, 3, 2, { value: 50 });
    expect(await spaceMarket.connect(wallets[1]).getItemPrice(account.address, 3)).to.equal(BigNumber.from(0));
    expect(await spaceFNS.getSpaceDomainUserId(2)).to.equal(BigNumber.from(2));
    expect((await account.batchGetAccountData([2]))[0][3][0]).to.equal(BigNumber.from(3));
    expect((await account.connect(wallets[1]).getRentedSpaceIds([2]))[0]).to.equal(BigNumber.from(3));
  });

  it("Should allow setting fee rate", async function () {
    expect(await spaceMarket.getFeeRate()).to.equal(500);
    await spaceMarket.setFeeRate(1000);
    expect(await spaceMarket.getFeeRate()).to.equal(1000);
  });

  it("Should revert setting fee rate", async function () {
    expect(spaceMarket.connect(wallets[1]).setFeeRate(1000)).to.revertedWithCustomError(spaceMarket, "NotBeneficiary");
  });

  it("Should allow setting beneficiary", async function () {
    expect(await spaceMarket.getBeneficiary()).to.equal(wallets[0].address);
    await spaceMarket.setBeneficiary(wallets[1].address);
    expect(await spaceMarket.getBeneficiary()).to.equal(wallets[1].address);
  });

  it("Should revert setting beneficiary", async function () {
    await expect(spaceMarket.connect(wallets[1]).setBeneficiary(wallets[1].address)).to.revertedWithCustomError(
      spaceMarket,
      "NotBeneficiary",
    );
  });

  it("Should allow withdraw income", async function () {
    const amount = BigNumber.from(100);
    const feeRate = await spaceMarket.getFeeRate();
    const txFee = amount.mul(feeRate).div(10000);
    const netFee = amount.sub(txFee);

    await account.approve(spaceMarket.address, 3);
    await spaceMarket.listSpace(account.address, 3, 1000, amount);
    await spaceMarket.connect(wallets[1]).rentSpace(account.address, 3, 2, { value: amount });

    const balance1 = await wallets[0].getBalance();
    const tx1 = await spaceMarket.withdrawRentalIncome();
    expect(await wallets[0].getBalance()).to.equal(balance1.add(netFee).sub(await calcGasFee(tx1)));

    const balance2 = await wallets[0].getBalance();
    const tx2 = await spaceMarket.withdrawTransactionFee();
    expect(await wallets[0].getBalance()).to.equal(balance2.add(txFee).sub(await calcGasFee(tx2)));
  });
});
