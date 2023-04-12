const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("SpaceMarket contract", function () {
    async function deployTokenFixture() {
        const SpaceMarket = await ethers.getContractFactory("SpaceMarket");
        const [owner, addr2, addr3] = await ethers.getSigners();
        const hardhatSpaceMarket = await SpaceMarket.deploy();
        await hardhatSpaceMarket.deployed();

        const SpaceFNS = await ethers.getContractFactory("SpaceFNS");
        const hardhatSpaceFNS = await SpaceFNS.deploy();
        await hardhatSpaceFNS.deployed();
        return { SpaceMarket, hardhatSpaceMarket, SpaceFNS, hardhatSpaceFNS, owner, addr2, addr3 };
    }

    describe("Deployment", function () {
        it("setBeneficiary", async function () {
            const { hardhatSpaceMarket, hardhatSpaceFNS, owner, addr2 } = await loadFixture(deployTokenFixture);
            await hardhatSpaceMarket.setBeneficiary(addr2.address);
            // console.log(owner.address)
        });

        it("getBeneficiary", async function () {
            const { hardhatSpaceMarket, addr2 } = await loadFixture(deployTokenFixture);
            const Beneficiary =  await hardhatSpaceMarket.getBeneficiary();
            // console.log(Beneficiary);
            await hardhatSpaceMarket.setBeneficiary(addr2.address)
            const newBeneficiary =  await hardhatSpaceMarket.getBeneficiary();
            // console.log(newBeneficiary);
        });
        
        it("getFeeRate", async function () {
            const { hardhatSpaceMarket } = await loadFixture(deployTokenFixture);
            const FeeRate =  await hardhatSpaceMarket.getFeeRate();
            // console.log(FeeRate);
        });
        
        it("setFeeRate", async function () {
            const { hardhatSpaceMarket } = await loadFixture(deployTokenFixture);
            await hardhatSpaceMarket.setFeeRate(1000);
            // const FeeRate =  await hardhatSpaceMarket.getFeeRate();
            // console.log(FeeRate);
        });

        it("listSpace", async function () {
            const { hardhatSpaceMarket, hardhatSpaceFNS, addr2, addr3 } = await loadFixture(deployTokenFixture);
            
            await expect(hardhatSpaceFNS.connect(addr3).mintSpaceDomain(3, 0, "arb", 3000000))
                .to.emit(hardhatSpaceFNS, "MintSpaceDomain")
                .withArgs(addr3.address, 0, "arb", 3000000);

            await expect(hardhatSpaceFNS.connect(addr2).mintSpaceDomain(2, 0, "eth", 2000000))
                .to.emit(hardhatSpaceFNS, "MintSpaceDomain")
                .withArgs(addr2.address, 0, "eth", 2000000);
            
            await expect(hardhatSpaceFNS.connect(addr2).mintSpaceDomain(2, 1, "arbitrum", 1))
                .to.emit(hardhatSpaceFNS, "MintSpaceDomain")
                .withArgs(addr2.address, 1, "arbitrum.eth", 1);
            
            await expect(hardhatSpaceFNS.connect(addr2).approve(hardhatSpaceMarket.address, 2))
                .to.emit(hardhatSpaceFNS, "Approved")
                .to.withArgs(addr2.address, hardhatSpaceMarket.address, 2);
            // console.log(hardhatSpaceMarket.address);
            // const add =  await hardhatSpaceFNS.getApproved(2);
            // console.log(add)
            await expect(hardhatSpaceMarket.connect(addr2).listSpace(hardhatSpaceFNS.address, 2, 100, 2))
                .to.emit(hardhatSpaceMarket, "List")
                .withArgs(addr2.address, hardhatSpaceFNS.address, 2, 100);
            
            // const item =  await hardhatSpaceMarket.GetItemBySpaceID(hardhatSpaceFNS.address, 2);
            // console.log(addr2.address ,item)
        });

        it("cancelListSpace", async function () {
            const { hardhatSpaceMarket, hardhatSpaceFNS, addr2, addr3 } = await loadFixture(deployTokenFixture);
            
            await expect(hardhatSpaceFNS.connect(addr3).mintSpaceDomain(3, 0, "arb", 3000000))
                .to.emit(hardhatSpaceFNS, "MintSpaceDomain")
                .withArgs(addr3.address, 0, "arb", 3000000);

            await expect(hardhatSpaceFNS.connect(addr2).mintSpaceDomain(2, 0, "eth", 2000000))
                .to.emit(hardhatSpaceFNS, "MintSpaceDomain")
                .withArgs(addr2.address, 0, "eth", 2000000);
            
            await expect(hardhatSpaceFNS.connect(addr2).mintSpaceDomain(2, 1, "arbitrum", 1))
                .to.emit(hardhatSpaceFNS, "MintSpaceDomain")
                .withArgs(addr2.address, 1, "arbitrum.eth", 1);
            
            await expect(hardhatSpaceFNS.connect(addr2).approve(hardhatSpaceMarket.address, 2))
                .to.emit(hardhatSpaceFNS, "Approved")
                .to.withArgs(addr2.address, hardhatSpaceMarket.address, 2);

            await expect(hardhatSpaceMarket.connect(addr2).listSpace(hardhatSpaceFNS.address, 2, 100, 2))
                .to.emit(hardhatSpaceMarket, "List")
                .withArgs(addr2.address, hardhatSpaceFNS.address, 2, 100);

            await expect(hardhatSpaceMarket.connect(addr2).cancelListSpace(hardhatSpaceFNS.address, 2, 2))
                .to.emit(hardhatSpaceMarket, "Revoke")
                .withArgs(addr2.address,hardhatSpaceFNS.address, 2 );
        
        });

        it("updateListedSpace", async function () {
            const { hardhatSpaceMarket, hardhatSpaceFNS, addr2, addr3 } = await loadFixture(deployTokenFixture);
            
            await expect(hardhatSpaceFNS.connect(addr3).mintSpaceDomain(3, 0, "arb", 3000000))
                .to.emit(hardhatSpaceFNS, "MintSpaceDomain")
                .withArgs(addr3.address, 0, "arb", 3000000);

            await expect(hardhatSpaceFNS.connect(addr2).mintSpaceDomain(2, 0, "eth", 2000000))
                .to.emit(hardhatSpaceFNS, "MintSpaceDomain")
                .withArgs(addr2.address, 0, "eth", 2000000);
            
            await expect(hardhatSpaceFNS.connect(addr2).mintSpaceDomain(2, 1, "arbitrum", 1))
                .to.emit(hardhatSpaceFNS, "MintSpaceDomain")
                .withArgs(addr2.address, 1, "arbitrum.eth", 1);
            
            await expect(hardhatSpaceFNS.connect(addr2).approve(hardhatSpaceMarket.address, 2))
                .to.emit(hardhatSpaceFNS, "Approved")
                .to.withArgs(addr2.address, hardhatSpaceMarket.address, 2);

            await expect(hardhatSpaceMarket.connect(addr2).listSpace(hardhatSpaceFNS.address, 2, 100, 2))
                .to.emit(hardhatSpaceMarket, "List")
                .withArgs(addr2.address, hardhatSpaceFNS.address, 2, 100);

            await expect(hardhatSpaceMarket.connect(addr2).updateListedSpace(hardhatSpaceFNS.address, 2, 200, 2))
                .to.emit(hardhatSpaceMarket, "Update")
                .withArgs(addr2.address,hardhatSpaceFNS.address, 2, 200);
            // const item =  await hardhatSpaceMarket.GetItemBySpaceID(hardhatSpaceFNS.address, 2);
            // console.log(item.price)
        
        });

        it("rentSpace", async function () {
            const { hardhatSpaceMarket, hardhatSpaceFNS, addr2, addr3 } = await loadFixture(deployTokenFixture);
            
            await expect(hardhatSpaceFNS.connect(addr3).mintSpaceDomain(3, 0, "arb", 3000000))
                .to.emit(hardhatSpaceFNS, "MintSpaceDomain")
                .withArgs(addr3.address, 0, "arb", 3000000);

            await expect(hardhatSpaceFNS.connect(addr2).mintSpaceDomain(2, 0, "eth", 2000000))
                .to.emit(hardhatSpaceFNS, "MintSpaceDomain")
                .withArgs(addr2.address, 0, "eth", 2000000);
            
            await expect(hardhatSpaceFNS.connect(addr2).mintSpaceDomain(2, 1, "arbitrum", 1))
                .to.emit(hardhatSpaceFNS, "MintSpaceDomain")
                .withArgs(addr2.address, 1, "arbitrum.eth", 1);
            
            await expect(hardhatSpaceFNS.connect(addr2).approve(hardhatSpaceMarket.address, 2))
                .to.emit(hardhatSpaceFNS, "Approved")
                .to.withArgs(addr2.address, hardhatSpaceMarket.address, 2);

            await expect(hardhatSpaceMarket.connect(addr2).listSpace(hardhatSpaceFNS.address, 2, 100, 2))
                .to.emit(hardhatSpaceMarket, "List")
                .withArgs(addr2.address, hardhatSpaceFNS.address, 2, 100);

            await expect(hardhatSpaceMarket.connect(addr3).rentSpace(hardhatSpaceFNS.address, 2, 3, {value: 100}))
                .to.emit(hardhatSpaceMarket, "Rent")
                .withArgs(addr3.address,hardhatSpaceFNS.address, 2, 100);
            // const free =  await  hardhatSpaceMarket.getTotalTransactionFee()
            // console.log(free)

            // const ownerFree =  await  hardhatSpaceMarket.getProceeds(addr2.address)
            // console.log(ownerFree)
            // console.log("addr2:", addr2.address)
            // console.log("addr3:", addr3.address)

            // const addr =  await hardhatSpaceFNS.getApproved(2);
            // console.log("addr:",addr)
        });

        it("withdrawTransactionFee", async function () {
            const { hardhatSpaceMarket, hardhatSpaceFNS, addr2, addr3 } = await loadFixture(deployTokenFixture);
            
            await expect(hardhatSpaceFNS.connect(addr3).mintSpaceDomain(3, 0, "arb", 3000000))
                .to.emit(hardhatSpaceFNS, "MintSpaceDomain")
                .withArgs(addr3.address, 0, "arb", 3000000);

            await expect(hardhatSpaceFNS.connect(addr2).mintSpaceDomain(2, 0, "eth", 2000000))
                .to.emit(hardhatSpaceFNS, "MintSpaceDomain")
                .withArgs(addr2.address, 0, "eth", 2000000);
            
            await expect(hardhatSpaceFNS.connect(addr2).mintSpaceDomain(2, 1, "arbitrum", 1))
                .to.emit(hardhatSpaceFNS, "MintSpaceDomain")
                .withArgs(addr2.address, 1, "arbitrum.eth", 1);
            
            await expect(hardhatSpaceFNS.connect(addr2).approve(hardhatSpaceMarket.address, 2))
                .to.emit(hardhatSpaceFNS, "Approved")
                .to.withArgs(addr2.address, hardhatSpaceMarket.address, 2);

            await expect(hardhatSpaceMarket.connect(addr2).listSpace(hardhatSpaceFNS.address, 2, 100, 2))
                .to.emit(hardhatSpaceMarket, "List")
                .withArgs(addr2.address, hardhatSpaceFNS.address, 2, 100);

            await expect(hardhatSpaceMarket.connect(addr3).rentSpace(hardhatSpaceFNS.address, 2, 3, {value: 100}))
                .to.emit(hardhatSpaceMarket, "Rent")
                .withArgs(addr3.address,hardhatSpaceFNS.address, 2, 100);
            // const free =  await  hardhatSpaceMarket.getTotalTransactionFee()
            // console.log(free)
            await hardhatSpaceMarket.withdrawTransactionFee()
            // const free2 =  await  hardhatSpaceMarket.getTotalTransactionFee()
            // console.log(free2)
        });
        
        it("withdrawRentalIncome", async function () {
            const { hardhatSpaceMarket, hardhatSpaceFNS, addr2, addr3 } = await loadFixture(deployTokenFixture);
            
            await expect(hardhatSpaceFNS.connect(addr3).mintSpaceDomain(3, 0, "arb", 3000000))
                .to.emit(hardhatSpaceFNS, "MintSpaceDomain")
                .withArgs(addr3.address, 0, "arb", 3000000);

            await expect(hardhatSpaceFNS.connect(addr2).mintSpaceDomain(2, 0, "eth", 2000000))
                .to.emit(hardhatSpaceFNS, "MintSpaceDomain")
                .withArgs(addr2.address, 0, "eth", 2000000);
            
            await expect(hardhatSpaceFNS.connect(addr2).mintSpaceDomain(2, 1, "arbitrum", 1))
                .to.emit(hardhatSpaceFNS, "MintSpaceDomain")
                .withArgs(addr2.address, 1, "arbitrum.eth", 1);
            
            await expect(hardhatSpaceFNS.connect(addr2).approve(hardhatSpaceMarket.address, 2))
                .to.emit(hardhatSpaceFNS, "Approved")
                .to.withArgs(addr2.address, hardhatSpaceMarket.address, 2);

            await expect(hardhatSpaceMarket.connect(addr2).listSpace(hardhatSpaceFNS.address, 2, 100, 2))
                .to.emit(hardhatSpaceMarket, "List")
                .withArgs(addr2.address, hardhatSpaceFNS.address, 2, 100);

            await expect(hardhatSpaceMarket.connect(addr3).rentSpace(hardhatSpaceFNS.address, 2, 3, {value: 100}))
                .to.emit(hardhatSpaceMarket, "Rent")
                .withArgs(addr3.address,hardhatSpaceFNS.address, 2, 100);
            // const ownerFree =  await  hardhatSpaceMarket.getProceeds(addr2.address)
            // console.log(ownerFree)

            await hardhatSpaceMarket.connect(addr2).withdrawRentalIncome()
            // const ownerFree2 =  await  hardhatSpaceMarket.getProceeds(addr2.address)
            // console.log(ownerFree2)
           
        });
    });

});