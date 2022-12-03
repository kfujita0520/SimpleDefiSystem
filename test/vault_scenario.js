// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const {moveTime} = require("./utils/move-time");
const {moveBlocks} = require("./utils/move-blocks");

let FnftVault, EnglishAuction, myNFT, WETH, FnftToken, stakingReward, deployer, tokenId, bidder1, receiver2, staker3;

const SECONDS_IN_A_HOUR = 3600
const SECONDS_IN_A_DAY = 86400
const SECONDS_IN_A_WEEK = 604800
const SECONDS_IN_A_YEAR = 31449600

async function main() {

    await contractDeploy();
    await initialSetup();


    await FnftVault.mintTokenForAuction();
    await EnglishAuction.connect(bidder1).bid(hre.ethers.utils.parseEther("1"), {value: hre.ethers.utils.parseEther("1")});

    await moveTime(SECONDS_IN_A_HOUR * 13);
    await moveBlocks(1);

    console.log("WETH balance of vault:", (await WETH.balanceOf(FnftVault.address)).toString());
    console.log("WETH balance of staking:", (await WETH.balanceOf(stakingReward.address)).toString());
    await FnftVault.distributeEarning();
    console.log("WETH balance of vault:", (await WETH.balanceOf(FnftVault.address)).toString());
    console.log("WETH balance of staking:", (await WETH.balanceOf(stakingReward.address)).toString());

    console.log('Complete');

}

async function contractDeploy(){


    [deployer, bidder1, staker2, staker3] = await hre.ethers.getSigners();

    const FnftVaultContract = await hre.ethers.getContractFactory("FnftVault");
    FnftVault = await FnftVaultContract.deploy();
    await FnftVault.deployed();
    console.log("FnftVault deployed to:", FnftVault.address);

    const WETHContract = await hre.ethers.getContractFactory("WETH9");
    WETH = await WETHContract.deploy();
    await WETH.deployed();
    console.log("WETH deployed to:", WETH.address);

    const EnglishAuctionContract = await hre.ethers.getContractFactory("EnglishAuction");
    EnglishAuction = await EnglishAuctionContract.deploy(FnftVault.address, WETH.address);
    await EnglishAuction.deployed();
    console.log("EnglishAuction deployed to:", EnglishAuction.address);

    const stakingRewardContract = await hre.ethers.getContractFactory("StakingRewards");
    stakingReward = await stakingRewardContract.deploy(FnftVault.address, WETH.address);
    await stakingReward.deployed();
    console.log("stakeReward deployed to:", stakingReward.address);


}

async function initialSetup(){

    const MyNFTContract = await hre.ethers.getContractFactory("MyNFT");
    myNFT = await MyNFTContract.deploy();
    await myNFT.deployed();
    console.log("myNFT deployed to:", myNFT.address);

    tokenId = 1;
    await myNFT.safeMint(deployer.address, tokenId);
    await myNFT.approve(FnftVault.address, tokenId);
    await FnftVault.fractionateNFT(myNFT.address, tokenId, "F-NFT Token", "FNT", [deployer.address], [hre.ethers.utils.parseEther("100")]);

    let fNftTokenAddr = await FnftVault.getFnftToken();
    console.log("FnftToken deployed to:", fNftTokenAddr);
    FnftToken = await hre.ethers.getContractAt("FnftToken", fNftTokenAddr);

    await stakingReward.initializeStakingToken(fNftTokenAddr);

    await FnftVault.configure(EnglishAuction.address, stakingReward.address, WETH.address);


}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
