// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const {moveTime} = require("./utils/move-time");
const {moveBlocks} = require("./utils/move-blocks");

let EnglishAuction, WETH, stakeToken, deployer, bidder1, bidder2, bidder3;

const SECONDS_IN_A_HOUR = 3600
const SECONDS_IN_A_DAY = 86400
const SECONDS_IN_A_WEEK = 604800
const SECONDS_IN_A_YEAR = 31449600

async function main() {

    await initialSetup();
    let tokenAmount = hre.ethers.utils.parseEther("1");
    let reservePrice = hre.ethers.utils.parseEther("0.1");
    let minIncrement = hre.ethers.utils.parseEther("0.01");

    await stakeToken.approve(EnglishAuction.address, tokenAmount);
    await EnglishAuction.start(stakeToken.address, tokenAmount, reservePrice, minIncrement, SECONDS_IN_A_DAY);

    await EnglishAuction.connect(bidder1).bid(hre.ethers.utils.parseEther("0.1"), {value: hre.ethers.utils.parseEther("0.1")});
    await EnglishAuction.connect(bidder2).bid(hre.ethers.utils.parseEther("0.15"), {value: hre.ethers.utils.parseEther("0.15")});
    await EnglishAuction.connect(bidder1).bid(hre.ethers.utils.parseEther("0.2"), {value: hre.ethers.utils.parseEther("0.1")});


    await moveTime(SECONDS_IN_A_DAY);
    await moveBlocks(1);

    console.log("ETH balance of bidder2:", (await bidder2.getBalance()).toString());
    await EnglishAuction.connect(bidder2).withdraw();
    console.log("ETH balance of bidder2:", (await bidder2.getBalance()).toString());

    //await EnglishAuction.connect(bidder2).bid(hre.ethers.utils.parseEther("0.22"), {value: hre.ethers.utils.parseEther("0.1")});
    //await EnglishAuction.connect(bidder1).withdraw();

    console.log("stake token of bidder1: ", (await stakeToken.balanceOf(bidder1.address)).toString());
    await EnglishAuction.end();
    console.log("stake token of bidder1: ", (await stakeToken.balanceOf(bidder1.address)).toString());

    console.log("ETH balance of seller:", (await deployer.getBalance()).toString());
    console.log("WETH balance of seller:", (await WETH.balanceOf(deployer.address)).toString());
    await EnglishAuction.withdrawWETH();
    console.log("ETH balance of seller:", (await deployer.getBalance()).toString());
    console.log("WETH balance of seller:", (await WETH.balanceOf(deployer.address)).toString());


    console.log('Complete');

}

async function initialSetup(){
    [deployer, bidder1, bidder2, bidder3] = await hre.ethers.getSigners();
    const stakeTokenContract = await hre.ethers.getContractFactory("StakeToken");
    stakeToken = await stakeTokenContract.deploy();
    await stakeToken.deployed();
    console.log("stakeToken deployed to:", stakeToken.address);

    const WETHContract = await hre.ethers.getContractFactory("WETH9");
    WETH = await WETHContract.deploy();
    await WETH.deployed();
    console.log("WETH deployed to:", WETH.address);


    const EnglishAuctionContract = await hre.ethers.getContractFactory("EnglishAuction");
    EnglishAuction = await EnglishAuctionContract.deploy(deployer.address, WETH.address);
    await EnglishAuction.deployed();
    console.log("EnglishAuction deployed to:", EnglishAuction.address);



}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
