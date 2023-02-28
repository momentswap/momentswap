task("get-momentSwapNFT", "Calls the Moment Swap NFT contract to read the NFT collection of owner.")
  .addParam("contract", "The address of the Moment Swap NFT contract")
  .addParam("owner", "The address of the account you want the NFT for")
  .setAction(async (taskArgs) => {
    //store taskargs as useable variables
    const contractAddr = taskArgs.contract;
    const owner = taskArgs.owner;
    const networkId = network.name;
    console.log("Reading Moment NFT owned by", owner);

    //create a new wallet instance
    const wallet = new ethers.Wallet(network.config.accounts[0], ethers.provider);

    //create a MomentSwapNFT contract factory
    const MomentSwapNFT = await ethers.getContractFactory("MomentSwapFRC721", wallet);
    //Create a MomentSwapNFT contract instance
    //This is what we will call to interact with the contract
    const MomentSwapNFTContract = await MomentSwapNFT.attach(contractAddr);

    //Call the method getNFTCollectionByOwner
    let result = await MomentSwapNFTContract.getNFTCollectionByOwner(owner);
    console.log("The moment NFT of Moment NFT  owned by", owner, "is", result);
  });
