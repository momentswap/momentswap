const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

// npx hardhat test ./test/SpaceFNS.js --network hardhat
describe("SpaceFNS contract", function () {
  async function deployTokenFixture() {
    const SpaceFNS = await ethers.getContractFactory("SpaceFNS");
    const [owner, addr2, addr3] = await ethers.getSigners();
    const hardhatSpaceFNS = await SpaceFNS.deploy();
    await hardhatSpaceFNS.deployed();

    const TestSpaceFNS = await ethers.getContractFactory("TestSpaceFNS");
    const hardhatTestSpaceFNS = await TestSpaceFNS.deploy();
    await hardhatTestSpaceFNS.deployed();

    return { SpaceFNS, hardhatSpaceFNS, hardhatTestSpaceFNS, owner, addr2, addr3 };
  }

  describe("Deployment", function () {
    it("setCaller", async function () {
      const { hardhatSpaceFNS, hardhatTestSpaceFNS, addr2, addr3 } = await loadFixture(deployTokenFixture);

      await hardhatSpaceFNS.setCaller(hardhatTestSpaceFNS.address);
    });

    it("mintSpaceDomain", async function () {
      const { hardhatSpaceFNS, hardhatTestSpaceFNS, addr2, addr3 } = await loadFixture(deployTokenFixture);
      await hardhatSpaceFNS.setCaller(hardhatTestSpaceFNS.address);
      await expect(
        hardhatTestSpaceFNS.connect(addr3).TestMintSpaceDomain(hardhatSpaceFNS.address, 2, 0, "arb", 3000000),
      )
        .to.emit(hardhatSpaceFNS, "MintSpaceDomain")
        .withArgs(addr3.address, 0, "arb", 3000000);

      await expect(
        hardhatTestSpaceFNS.connect(addr2).TestMintSpaceDomain(hardhatSpaceFNS.address, 1, 0, "eth", 2000000),
      )
        .to.emit(hardhatSpaceFNS, "MintSpaceDomain")
        .withArgs(addr2.address, 0, "eth", 2000000);

      const spaceId = await hardhatSpaceFNS.getSpaceIdByDomainName("eth");
      console.log(spaceId);
      expect(await hardhatSpaceFNS.getApproved(spaceId)).to.equal(addr2.address);

      // const SpaceDomain = await hardhatSpaceFNS.getSpaceDomainByID(spaceId)
      // console.log(SpaceDomain)

      await expect(
        hardhatTestSpaceFNS.connect(addr2).TestMintSpaceDomain(hardhatSpaceFNS.address, 1, 1, "arbitrum", 2000000),
      )
        .to.emit(hardhatSpaceFNS, "MintSpaceDomain")
        .withArgs(addr2.address, 1, "arbitrum.eth", 2000000);

      // const SpaceDomain2 = await hardhatSpaceFNS.getSpaceDomainByID(2)
      // console.log(SpaceDomain2)
    });

    it("updateSubDomainName", async function () {
      const { hardhatSpaceFNS, hardhatTestSpaceFNS, addr2, addr3 } = await loadFixture(deployTokenFixture);

      await hardhatSpaceFNS.setCaller(hardhatTestSpaceFNS.address);

      await expect(
        hardhatTestSpaceFNS.connect(addr3).TestMintSpaceDomain(hardhatSpaceFNS.address, 2, 0, "arb", 3000000),
      )
        .to.emit(hardhatSpaceFNS, "MintSpaceDomain")
        .withArgs(addr3.address, 0, "arb", 3000000);

      await expect(
        hardhatTestSpaceFNS.connect(addr2).TestMintSpaceDomain(hardhatSpaceFNS.address, 1, 0, "eth", 2000000),
      )
        .to.emit(hardhatSpaceFNS, "MintSpaceDomain")
        .withArgs(addr2.address, 0, "eth", 2000000);

      await expect(
        hardhatTestSpaceFNS.connect(addr2).TestMintSpaceDomain(hardhatSpaceFNS.address, 1, 1, "arbitrum", 2000000),
      )
        .to.emit(hardhatSpaceFNS, "MintSpaceDomain")
        .withArgs(addr2.address, 1, "arbitrum.eth", 2000000);

      await expect(hardhatTestSpaceFNS.connect(addr2).TestUpdateSubDomainName(hardhatSpaceFNS.address, 2, "polygon"))
        .to.emit(hardhatSpaceFNS, "UpdataDomainName")
        .withArgs(2, "polygon.eth");

      // const SpaceDomain = await hardhatSpaceFNS.getSpaceDomainByID(2)
      // console.log(SpaceDomain)
    });

    it("updateExpireSeconds", async function () {
      const { hardhatSpaceFNS, hardhatTestSpaceFNS, addr2, addr3 } = await loadFixture(deployTokenFixture);

      await hardhatSpaceFNS.setCaller(hardhatTestSpaceFNS.address);

      await expect(
        hardhatTestSpaceFNS.connect(addr3).TestMintSpaceDomain(hardhatSpaceFNS.address, 2, 0, "arb", 3000000),
      )
        .to.emit(hardhatSpaceFNS, "MintSpaceDomain")
        .withArgs(addr3.address, 0, "arb", 3000000);

      await expect(
        hardhatTestSpaceFNS.connect(addr2).TestMintSpaceDomain(hardhatSpaceFNS.address, 1, 0, "eth", 2000000),
      )
        .to.emit(hardhatSpaceFNS, "MintSpaceDomain")
        .withArgs(addr2.address, 0, "eth", 2000000);

      await expect(
        hardhatTestSpaceFNS.connect(addr2).TestMintSpaceDomain(hardhatSpaceFNS.address, 1, 1, "arbitrum", 2000000),
      )
        .to.emit(hardhatSpaceFNS, "MintSpaceDomain")
        .withArgs(addr2.address, 1, "arbitrum.eth", 2000000);

      // const oldSpaceDomain = await hardhatSpaceFNS.getSpaceDomainByID(2)
      // console.log(oldSpaceDomain)
      await expect(hardhatTestSpaceFNS.connect(addr2).TestUpdateExpireSeconds(hardhatSpaceFNS.address, 2, 3000000, 1))
        .to.emit(hardhatSpaceFNS, "UpdataExpriceTime")
        .withArgs(addr2.address, 2, 3000000);
      // const newSpaceDomain = await hardhatSpaceFNS.getSpaceDomainByID(2)
      // console.log(newSpaceDomain)
    });

    it("approve", async function () {
      const { hardhatSpaceFNS, hardhatTestSpaceFNS, addr2, addr3 } = await loadFixture(deployTokenFixture);

      await hardhatSpaceFNS.setCaller(hardhatTestSpaceFNS.address);

      await expect(
        hardhatTestSpaceFNS.connect(addr3).TestMintSpaceDomain(hardhatSpaceFNS.address, 2, 0, "arb", 3000000),
      )
        .to.emit(hardhatSpaceFNS, "MintSpaceDomain")
        .withArgs(addr3.address, 0, "arb", 3000000);

      await expect(
        hardhatTestSpaceFNS.connect(addr2).TestMintSpaceDomain(hardhatSpaceFNS.address, 1, 0, "eth", 2000000),
      )
        .to.emit(hardhatSpaceFNS, "MintSpaceDomain")
        .withArgs(addr2.address, 0, "eth", 2000000);

      await expect(
        hardhatTestSpaceFNS.connect(addr2).TestMintSpaceDomain(hardhatSpaceFNS.address, 1, 1, "arbitrum", 2000000),
      )
        .to.emit(hardhatSpaceFNS, "MintSpaceDomain")
        .withArgs(addr2.address, 1, "arbitrum.eth", 2000000);

      await expect(hardhatSpaceFNS.connect(addr2).approve(addr3.address, 2))
        .to.emit(hardhatSpaceFNS, "Approved")
        .to.withArgs(addr2.address, addr3.address, 2);

      // await expect(hardhatTestSpaceFNS.connect(addr3).TestUpdateExpireSeconds(hardhatSpaceFNS.address,2, 3000000, 1))
      //     .to.emit(hardhatSpaceFNS, "UpdataExpriceTime")
      //     .withArgs(addr2.address, 2, 3000000);
      await expect(hardhatTestSpaceFNS.connect(addr3).TestUpdateSubDomainName(hardhatSpaceFNS.address, 2, "polygon"))
        .to.emit(hardhatSpaceFNS, "UpdataDomainName")
        .withArgs(2, "polygon.eth");
      // const SpaceDomain = await hardhatSpaceFNS.getSpaceDomainByID(2)
      // console.log(SpaceDomain)

      expect(await hardhatSpaceFNS.getApproved(2)).to.equal(addr3.address);
    });

    it("rentSpace", async function () {
      const { hardhatSpaceFNS, hardhatTestSpaceFNS, addr2, addr3 } = await loadFixture(deployTokenFixture);

      await hardhatSpaceFNS.setCaller(hardhatTestSpaceFNS.address);

      await expect(
        hardhatTestSpaceFNS.connect(addr3).TestMintSpaceDomain(hardhatSpaceFNS.address, 2, 0, "arb", 3000000),
      )
        .to.emit(hardhatSpaceFNS, "MintSpaceDomain")
        .withArgs(addr3.address, 0, "arb", 3000000);

      await expect(
        hardhatTestSpaceFNS.connect(addr2).TestMintSpaceDomain(hardhatSpaceFNS.address, 1, 0, "eth", 2000000),
      )
        .to.emit(hardhatSpaceFNS, "MintSpaceDomain")
        .withArgs(addr2.address, 0, "eth", 2000000);

      await expect(
        hardhatTestSpaceFNS.connect(addr2).TestMintSpaceDomain(hardhatSpaceFNS.address, 1, 1, "arbitrum", 2000000),
      )
        .to.emit(hardhatSpaceFNS, "MintSpaceDomain")
        .withArgs(addr2.address, 1, "arbitrum.eth", 2000000);

      await expect(hardhatSpaceFNS.connect(addr2).rentSpace(2, 2, addr3.address))
        .to.emit(hardhatSpaceFNS, "Approved")
        .to.withArgs(addr2.address, addr3.address, 2);

      // const SpaceDomain = await hardhatSpaceFNS.getSpaceDomainByID(2);
      // console.log(SpaceDomain);

      await expect(hardhatTestSpaceFNS.connect(addr3).TestUpdateSubDomainName(hardhatSpaceFNS.address, 2, "polygon"))
        .to.emit(hardhatSpaceFNS, "UpdataDomainName")
        .withArgs(2, "polygon.eth");
      // const SpaceDomain2 = await hardhatSpaceFNS.getSpaceDomainByID(2);
      // console.log(SpaceDomain2);
      expect(await hardhatSpaceFNS.getApproved(2)).to.equal(addr3.address);
    });

    it("returnSpace", async function () {
      const { hardhatSpaceFNS, hardhatTestSpaceFNS, addr2, addr3 } = await loadFixture(deployTokenFixture);

      await hardhatSpaceFNS.setCaller(hardhatTestSpaceFNS.address);

      await expect(
        hardhatTestSpaceFNS.connect(addr3).TestMintSpaceDomain(hardhatSpaceFNS.address, 2, 0, "arb", 3000000),
      )
        .to.emit(hardhatSpaceFNS, "MintSpaceDomain")
        .withArgs(addr3.address, 0, "arb", 3000000);

      await expect(
        hardhatTestSpaceFNS.connect(addr2).TestMintSpaceDomain(hardhatSpaceFNS.address, 1, 0, "eth", 2000000),
      )
        .to.emit(hardhatSpaceFNS, "MintSpaceDomain")
        .withArgs(addr2.address, 0, "eth", 2000000);

      await expect(hardhatTestSpaceFNS.connect(addr2).TestMintSpaceDomain(hardhatSpaceFNS.address, 1, 1, "arbitrum", 1))
        .to.emit(hardhatSpaceFNS, "MintSpaceDomain")
        .withArgs(addr2.address, 1, "arbitrum.eth", 1);

      await expect(hardhatSpaceFNS.connect(addr2).rentSpace(2, 2, addr3.address))
        .to.emit(hardhatSpaceFNS, "Approved")
        .to.withArgs(addr2.address, addr3.address, 2);
      // const SpaceDomain = await hardhatSpaceFNS.getSpaceDomainByID(2);
      // console.log(SpaceDomain);
      expect(await hardhatSpaceFNS.getApproved(2)).to.equal(addr3.address);

      await hardhatTestSpaceFNS.connect(addr2).TestReturnSpace(hardhatSpaceFNS.address, 1, 2);
      const newSpaceDomain = await hardhatSpaceFNS.getSpaceDomainByID(2);
      // console.log(newSpaceDomain);
      // expect(await hardhatSpaceFNS.getApproved(2)).to.equal(addr2.address);
    });
  });
});
