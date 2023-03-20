const { expect } = require("chai");
import {ethers} from 'hardhat';


describe("MomentSwapContract", function () {
  let deployer:any, user:any,user2:any
  let SpaceFNS:any
  let FNSMarket:any

  beforeEach(async () => {
    [deployer, user, user2] = await ethers.getSigners()
    

    const spaceFNS = await ethers.getContractFactory("SpaceFNS")
    SpaceFNS = await spaceFNS.deploy()

    const market = await ethers.getContractFactory("RentMarket")
    FNSMarket = await market.deploy()
  })
  describe("SpaceFNS",async()=>{
    beforeEach(async()=>{
      await SpaceFNS.deployed();
      await SpaceFNS.register("giao")
      await SpaceFNS.mintChildDomain("giao","child")
    })
      
    it("allChildFNSDomain",async()=>{ 
      SpaceFNS.allChildFNSDomain(1).then((e:any)=>expect(e[1]).to.equal("child.giao"))
    })

    it("updateChildDomain",async()=>{ 
        SpaceFNS.allChildFNSDomain(1).then((e:any)=>expect(e[1]).to.equal("child.giao"))
        const updatedDomain = await SpaceFNS.updateChildDomain("giao","child","hallo")
        await updatedDomain.wait()
        const oneOfAllDomain = await SpaceFNS.allChildFNSDomain(1)
        expect(oneOfAllDomain[1]).to.equal("hallo.giao")
    })

    it("allChildFNSDomain",async()=>{ 
        const a = await SpaceFNS.allChildFNSDomain(1) 
        const updatedDomain = await SpaceFNS.updateChildDomain("giao","child","hallo")
        await updatedDomain.wait()
        const ChildDomainLeaseTerm = await SpaceFNS.getChildDomainLeaseTerm(deployer.address)
        expect(ChildDomainLeaseTerm[1].length>0).to.equal(true)
    })

  })
  describe("FNSMarket",async()=>{
    beforeEach(async()=>{
      await SpaceFNS.deployed();
      await FNSMarket.deployed();
      await SpaceFNS.register("giao")
      await SpaceFNS.mintChildDomain("giao","child")
      await SpaceFNS.approve(FNSMarket.address,1)

    })
    it("listItem",async()=>{ 
      const addr = await FNSMarket.listItem(SpaceFNS.address,1,2,2)
      expect(addr['from']).to.equal(deployer.address)
    })
    it("updateListing",async()=>{ 
      await FNSMarket.listItem(SpaceFNS.address,1,2,2)
      const updateList = await FNSMarket.updateListing(SpaceFNS.address,1,22,22)
      expect(JSON.parse((await updateList.wait()).events[0].args['price'])).to.be.equal(22)
    })
    it("cancelListing",async()=>{ 
      await FNSMarket.listItem(SpaceFNS.address,1,2,2)
      const temp = await FNSMarket.cancelListing(SpaceFNS.address,1)
      expect((await temp.wait()).events[0].event).to.equal("ItemCanceled");
      
    })
    it("lendItem",async()=>{ 
    const listedItem = await FNSMarket.listItem(SpaceFNS.address,1,2,2,{gasLimit:30000000})
     await listedItem.wait();
      const addr1 = await FNSMarket.connect(user)
      const temp = await addr1.lendItem(SpaceFNS.address,1,{value:20,gasLimit:30000000})
      await temp.wait();
      expect((await SpaceFNS.getLeasedDomainLeaseTerm(user.address))[1][0]==="child.giao").to.equal(true)
    })

    it("getListing",async()=>{ 
      const listedItem = await FNSMarket.listItem(SpaceFNS.address,1,2,2,{gasLimit:30000000})
      await listedItem.wait();
      const addr = await FNSMarket.getListing(SpaceFNS.address,1)
      expect(addr['owner']).not.to.be.equal(ethers.constants.AddressZero)
    })

    it("withdrawProceeds",async()=>{ 
      const l = await FNSMarket.listItem(SpaceFNS.address,1,2,2,{gasLimit:30000000})
      await l.wait();
      const addr1 = await FNSMarket.connect(user)
      const temp = await addr1.lendItem(SpaceFNS.address,1,{value:20,gasLimit:30000000})
      await temp.wait();
      const addr2 = await FNSMarket.withdrawProceeds({gasLimit:30000000})

      await addr2.wait();
      expect((await addr2.wait()).events[0].args['statusInfo']).to.equal("success withdrawProceedsInfo");
    })
  
  })
})