task("deploy", "Space FNS Use Case")
  .setAction(async () => {
    // Create main wallet
    const wallet = new ethers.Wallet(network.config.accounts[0], ethers.provider);

    // Deploy SpaceFNS contract
    const spaceFNSFactory = await ethers.getContractFactory("SpaceFNS", wallet);
    console.log("🎠 SpaceFNS deploying....");
    const spaceFNSContract = await spaceFNSFactory.deploy();
    await spaceFNSContract.deployed();
    console.log("🏵️ SpaceFNS deployed to ", spaceFNSContract.address);

    // Deploy SpaceMarket contract
    const spaceMarketFactory = await ethers.getContractFactory("RentMarket", wallet);
    console.log("🎠 RentMarket deploying....");
    const spaceMarketContract = await spaceMarketFactory.deploy();
    await spaceMarketContract.deployed();
    console.log("🏵️ RentMarket deployed to ", spaceMarketContract.address);
  });

task("listItem", "Space FNS Use Case")
  .addParam("fnscontract", "Address of SpaceFNS contract")
  .addParam("marketcontract", "Address of RentMarket contract")
  .setAction(async ({fnscontract, marketcontract}) => {
    // Create main wallet
    const walletA = new ethers.Wallet(network.config.accounts[0], ethers.provider);
    //Create SpaceFNS contract instance A
    const spaceFNSFactoryA = await ethers.getContractFactory("SpaceFNS", walletA);
    const spaceFNSContractA = spaceFNSFactoryA.attach(fnscontract);
    // Create RentMarket contract instance A
    const spaceMarketFactoryA = await ethers.getContractFactory("RentMarket", walletA);
    const  spaceMarketContractA = await spaceMarketFactoryA.attach(marketcontract);

    const mainDomainName = "mainspace"
    const childDomainName = "space1"

    console.log(`🎠 spaceFNSContractA.register(${mainDomainName})`);
    const registerResult = await spaceFNSContractA.registr(mainDomainName)
    console.log("🏵️ ", registerResult);
    console.log(`🎠 spaceFNSContractA.allChildFNSDomain(1)`);
    const allChildFNSDomainResult = await spaceFNSContractA.allChildFNSDomain(1);
    console.log("🏵️ ", allChildFNSDomainResult);

    console.log(`🎠 spaceFNSContractA.getChildDomainId(${childDomainName}.${mainDomainName})`);
    const getChildDomainIdResult = await spaceFNSContractA.getChildDomainId(`${childDomainName}.${mainDomainName}`);
    console.log("🏵️ ", getChildDomainIdResult);

    console.log(`🎠 spaceFNSContractA.mintChildDomain(${mainDomainName}, ${childDomainName})`);
    const mintChildDomainResult = await spaceFNSContractA.mintChildDomain(mainDomainName, childDomainName);
    console.log("🏵️ ", mintChildDomainResult);

    console.log(`🎠 spaceFNSContractA.approve(${marketcontract}, 1)`);
    const approveResult = await spaceFNSContractA.approve(marketcontract, 1);
    console.log("🏵️ ", approveResult);

    console.log(`🎠 spaceMarketContractA.listItem(${fnscontract}, 1, 1, 978278400`);
    const listItemResult = await spaceMarketContractA.listItem(fnscontract, 1, 1, 978278400);
    console.log("🏵️ ", listItemResult);
  });

task("lendItem", "Space FNS Use Case")
  .addParam("fnscontract", "Address of SpaceFNS contract")
  .addParam("marketcontract", "Address of RentMarket contract")
  .setAction(async ({fnscontract, marketcontract}) => {
    // Create main wallet
    const walletA = new ethers.Wallet(network.config.accounts[0], ethers.provider);
    //Create SpaceFNS contract instance A
    const spaceFNSFactoryA = await ethers.getContractFactory("SpaceFNS", walletA);
    const spaceFNSContractA = spaceFNSFactoryA.attach(fnscontract);
    // Create RentMarket contract instance A
    const spaceMarketFactoryA = await ethers.getContractFactory("RentMarket", walletA);
    const  spaceMarketContractA = await spaceMarketFactoryA.attach(marketcontract);

    // Create test wallet
    const walletB = new ethers.Wallet("0xd5f021220a901173d4f48faf5a1ac5d9e19bc74c6aaf8f3f4e46d530fba1bab0", ethers.provider)
    // Create SpaceFNS contract instance B
    const spaceFNSFactoryB = await ethers.getContractFactory("SpaceFNS", walletB);
    const spaceFNSContractB = await spaceFNSFactoryB.attach(fnscontract);
    // Create RentMarket contract instance B
    const spaceMarketFactoryB = await ethers.getContractFactory("RentMarket", walletB);
    const spaceMarketContractB = await spaceMarketFactoryB.attach(marketcontract);

    console.log(`🎠 spaceMarketContractB.getListing(${fnscontract}, 1)`);
    const getListingResult = await spaceMarketContractB.getListing(fnscontract, 1);
    console.log("🏵️ ", getListingResult);

    console.log(`🎠 spaceMarketContractB.lendItem(${fnscontract}, 1)`);
    const lendItemResult = await spaceMarketContractB.lendItem(fnscontract, 1, {value: 1});
    console.log("🏵️ ", lendItemResult);
  }
)