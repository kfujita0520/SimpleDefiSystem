// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const {ethers} = require("hardhat");
const {moveTime} = require("./utils/move-time");
const {moveBlocks} = require("./utils/move-blocks");

let myNFT, NFTFractionalizer, rewardToken, stakeInfo, deployer, receiver1, receiver2, staker3;

const SECONDS_IN_A_HOUR = 3600
const SECONDS_IN_A_DAY = 86400
const SECONDS_IN_A_WEEK = 604800
const SECONDS_IN_A_YEAR = 31449600

async function main() {

    await initialSetup();

    await myNFT.safeMint(deployer.address, 1);
    await myNFT.approve(NFTFractionalizer.address, 1);


    let addresses = [deployer.address, receiver1.address, receiver2.address];
    let amounts = [1, 2, 3];
    await NFTFractionalizer.fractionate(myNFT.address, 1, addresses, amounts);

    console.log("Balance of deployer: ", (await NFTFractionalizer.balanceOf(deployer.address)).toString());
    console.log("Balance of receiver1: ", (await NFTFractionalizer.balanceOf(receiver1.address)).toString());
    console.log("Balance of receiver2: ", (await NFTFractionalizer.balanceOf(receiver2.address)).toString());


    console.log('Complete');

}

async function initialSetup(){
    [deployer, receiver1, receiver2, receiver3] = await ethers.getSigners();
    const MyNFTContract = await ethers.getContractFactory("MyNFT");
    myNFT = await MyNFTContract.deploy();
    await myNFT.deployed();
    console.log("myNFT deployed to:", myNFT.address);
    const NFTFractionalizerContract = await ethers.getContractFactory("FnftToken");
    NFTFractionalizer = await NFTFractionalizerContract.deploy("F-NFT Token", "FNT");
    await NFTFractionalizer.deployed();
    console.log("NFTFractionalizer deployed to:", NFTFractionalizer.address);

}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
