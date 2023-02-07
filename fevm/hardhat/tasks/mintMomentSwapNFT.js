task(
  "mint-momentSwapNFT",
  "Calls the NFT contract to mint a new NFT."
)
.addParam("contract", "The Moment Swap contract address")
.addParam("owner", "The Owner to mint")
.addParam("ipfsuri", "The IPFS URI of the asset")
.setAction(async (taskArgs) => {
    //store taskargs as useable variables
    const contractAddr = taskArgs.contract
    const owner = taskArgs.owner
    const ipfsURI  = taskArgs.ipfsuri

    //create a new wallet instance
    const wallet = new ethers.Wallet(network.config.accounts[0], ethers.provider)

    //create a MomentSwap contract factory
    const momentSwap  = await ethers.getContractFactory("MomentSwapFRC721", wallet)
    //create a MomentSwapFRC721 contract instance 
    //this is what you will call to interact with the deployed contract
    const momentSwapContract = await momentSwap.attach(contractAddr)

    console.log("Minting Moment Swap for:", owner)

    //send transaction to call the mintMomentSwapNFT() method
    const transaction = await momentSwapContract.mintMomentSwapNFT(owner, ipfsURI)
    const receipt = await transaction.wait()
    console.log("Finished minting:", owner)
})
