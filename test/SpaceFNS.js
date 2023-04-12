const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { time } = require("console");

describe("SpaceFNS contract", function () {
    async function deployTokenFixture() {
        const SpaceFNS = await ethers.getContractFactory("SpaceFNS");
        const [owner, addr2, addr3] = await ethers.getSigners();
        const hardhatSpaceFNS = await SpaceFNS.deploy();
        await hardhatSpaceFNS.deployed();
        return { SpaceFNS, hardhatSpaceFNS, owner, addr2, addr3 };
    }

    describe("Deployment", function () {
        it("mintSpaceDomain", async function () {
            const { hardhatSpaceFNS, addr2, addr3  } = await loadFixture(deployTokenFixture);

            await expect(hardhatSpaceFNS.connect(addr3).mintSpaceDomain(2, 0, "arb", 3000000))
                .to.emit(hardhatSpaceFNS, "MintSpaceDomain")
                .withArgs(addr3.address, 0, "arb", 3000000);

            await expect(hardhatSpaceFNS.connect(addr2).mintSpaceDomain(1, 0, "eth", 2000000))
                .to.emit(hardhatSpaceFNS, "MintSpaceDomain")
                .withArgs(addr2.address, 0, "eth", 2000000);

            const spaceId = await hardhatSpaceFNS.getSpaceIdByDomainName("eth");
            // console.log(spaceId)
            expect(await hardhatSpaceFNS.getApproved(spaceId)).to.equal(addr2.address);
            
            // const SpaceDomain = await hardhatSpaceFNS.getSpaceDomainByID(spaceId)
            // console.log(SpaceDomain)
            
            await expect(hardhatSpaceFNS.connect(addr2).mintSpaceDomain(1, 1, "arbitrum", 2000000))
                .to.emit(hardhatSpaceFNS, "MintSpaceDomain")
                .withArgs(addr2.address, 1, "arbitrum.eth", 2000000);

            // const SpaceDomain = await hardhatSpaceFNS.getSpaceDomainByID(2)
            // console.log(SpaceDomain)
        });
        
        it("updateSubDomainName", async function () {
            const { hardhatSpaceFNS, addr2, addr3  } = await loadFixture(deployTokenFixture);
            await expect(hardhatSpaceFNS.connect(addr3).mintSpaceDomain(2, 0, "arb", 3000000))
                .to.emit(hardhatSpaceFNS, "MintSpaceDomain")
                .withArgs(addr3.address, 0, "arb", 3000000);

            await expect(hardhatSpaceFNS.connect(addr2).mintSpaceDomain(1, 0, "eth", 2000000))
                .to.emit(hardhatSpaceFNS, "MintSpaceDomain")
                .withArgs(addr2.address, 0, "eth", 2000000);
            
            await expect(hardhatSpaceFNS.connect(addr2).mintSpaceDomain(1, 1, "arbitrum", 2000000))
                .to.emit(hardhatSpaceFNS, "MintSpaceDomain")
                .withArgs(addr2.address, 1, "arbitrum.eth", 2000000);
            
            await expect(hardhatSpaceFNS.connect(addr2).updateSubDomainName(2, "eth", "arbitrum", "polygon"))
                .to.emit(hardhatSpaceFNS, "UpdataDomainName")
                .withArgs(2, "polygon.eth");

            // const SpaceDomain = await hardhatSpaceFNS.getSpaceDomainByID(2)
            // console.log(SpaceDomain)
            
        });
        
        it("updateExpireSeconds", async function () {
            const { hardhatSpaceFNS, addr2, addr3  } = await loadFixture(deployTokenFixture);
            await expect(hardhatSpaceFNS.connect(addr3).mintSpaceDomain(2, 0, "arb", 3000000))
                .to.emit(hardhatSpaceFNS, "MintSpaceDomain")
                .withArgs(addr3.address, 0, "arb", 3000000);

            await expect(hardhatSpaceFNS.connect(addr2).mintSpaceDomain(1, 0, "eth", 2000000))
                .to.emit(hardhatSpaceFNS, "MintSpaceDomain")
                .withArgs(addr2.address, 0, "eth", 2000000);
            
            await expect(hardhatSpaceFNS.connect(addr2).mintSpaceDomain(1, 1, "arbitrum", 2000000))
                .to.emit(hardhatSpaceFNS, "MintSpaceDomain")
                .withArgs(addr2.address, 1, "arbitrum.eth", 2000000);
            
            // const oldSpaceDomain = await hardhatSpaceFNS.getSpaceDomainByID(2)
            // console.log(oldSpaceDomain)
            await expect(hardhatSpaceFNS.connect(addr2).updateExpireSeconds(2, 3000000, 1))
                .to.emit(hardhatSpaceFNS, "UpdataExpriceTime")
                .withArgs(addr2.address, 2, 3000000);
            // const newSpaceDomain = await hardhatSpaceFNS.getSpaceDomainByID(2)
            // console.log(newSpaceDomain)
        });
        
        it("approve", async function () {
            const { hardhatSpaceFNS, addr2, addr3  } = await loadFixture(deployTokenFixture);
            await expect(hardhatSpaceFNS.connect(addr3).mintSpaceDomain(2, 0, "arb", 3000000))
                .to.emit(hardhatSpaceFNS, "MintSpaceDomain")
                .withArgs(addr3.address, 0, "arb", 3000000);

            await expect(hardhatSpaceFNS.connect(addr2).mintSpaceDomain(1, 0, "eth", 2000000))
                .to.emit(hardhatSpaceFNS, "MintSpaceDomain")
                .withArgs(addr2.address, 0, "eth", 2000000);
            
            await expect(hardhatSpaceFNS.connect(addr2).mintSpaceDomain(1, 1, "arbitrum", 2000000))
                .to.emit(hardhatSpaceFNS, "MintSpaceDomain")
                .withArgs(addr2.address, 1, "arbitrum.eth", 2000000);
            
            await expect(hardhatSpaceFNS.connect(addr2).approve(addr3.address, 2))
                .to.emit(hardhatSpaceFNS, "Approved")
                .to.withArgs(addr2.address, addr3.address, 2);


            expect(await hardhatSpaceFNS.getApproved(2)).to.equal(addr3.address);
        });

        it("rentSpace", async function () {
            const { hardhatSpaceFNS, addr2, addr3  } = await loadFixture(deployTokenFixture);
            await expect(hardhatSpaceFNS.connect(addr3).mintSpaceDomain(2, 0, "arb", 3000000))
                .to.emit(hardhatSpaceFNS, "MintSpaceDomain")
                .withArgs(addr3.address, 0, "arb", 3000000);

            await expect(hardhatSpaceFNS.connect(addr2).mintSpaceDomain(1, 0, "eth", 2000000))
                .to.emit(hardhatSpaceFNS, "MintSpaceDomain")
                .withArgs(addr2.address, 0, "eth", 2000000);
            
            await expect(hardhatSpaceFNS.connect(addr2).mintSpaceDomain(1, 1, "arbitrum", 2000000))
                .to.emit(hardhatSpaceFNS, "MintSpaceDomain")
                .withArgs(addr2.address, 1, "arbitrum.eth", 2000000);
            
            await expect(hardhatSpaceFNS.connect(addr2).rentSpace(2, 2, addr3.address))
                .to.emit(hardhatSpaceFNS, "Approved")
                .to.withArgs(addr2.address, addr3.address, 2);
            // const SpaceDomain = await hardhatSpaceFNS.getSpaceDomainByID(2);
            // console.log(SpaceDomain);
            expect(await hardhatSpaceFNS.getApproved(2)).to.equal(addr3.address);

        });

        it("returnSpace", async function () {
            const { hardhatSpaceFNS, addr2, addr3  } = await loadFixture(deployTokenFixture);
            await expect(hardhatSpaceFNS.connect(addr3).mintSpaceDomain(2, 0, "arb", 3000000))
                .to.emit(hardhatSpaceFNS, "MintSpaceDomain")
                .withArgs(addr3.address, 0, "arb", 3000000);

            await expect(hardhatSpaceFNS.connect(addr2).mintSpaceDomain(1, 0, "eth", 2000000))
                .to.emit(hardhatSpaceFNS, "MintSpaceDomain")
                .withArgs(addr2.address, 0, "eth", 2000000);
            
            await expect(hardhatSpaceFNS.connect(addr2).mintSpaceDomain(1, 1, "arbitrum", 1))
                .to.emit(hardhatSpaceFNS, "MintSpaceDomain")
                .withArgs(addr2.address, 1, "arbitrum.eth", 1);
            
            await expect(hardhatSpaceFNS.connect(addr2).rentSpace(2, 2, addr3.address))
                .to.emit(hardhatSpaceFNS, "Approved")
                .to.withArgs(addr2.address, addr3.address, 2);
            // const SpaceDomain = await hardhatSpaceFNS.getSpaceDomainByID(2);
            // console.log(SpaceDomain);
            expect(await hardhatSpaceFNS.getApproved(2)).to.equal(addr3.address);
            

            await hardhatSpaceFNS.connect(addr2).returnSpace(1, 2);
            // const newSpaceDomain = await hardhatSpaceFNS.getSpaceDomainByID(2);
            // console.log(newSpaceDomain);
            expect(await hardhatSpaceFNS.getApproved(2)).to.equal(addr2.address);
        });
    
    });

});
