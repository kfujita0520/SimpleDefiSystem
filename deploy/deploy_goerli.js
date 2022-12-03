// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

const weth = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6";
let FnftVault, EnglishAuction, stakingReward, deployer;

async function main() {

    [deployer] = await hre.ethers.getSigners();
    console.log('Deployer: ', deployer.address);

    const FnftVaultContract = await hre.ethers.getContractFactory("FnftVault");
    FnftVault = await FnftVaultContract.deploy();
    await FnftVault.deployed();
    console.log("FnftVault deployed to:", FnftVault.address);

    const EnglishAuctionContract = await hre.ethers.getContractFactory("EnglishAuction");
    EnglishAuction = await EnglishAuctionContract.deploy(FnftVault.address, weth);
    await EnglishAuction.deployed();
    console.log("EnglishAuction deployed to:", EnglishAuction.address);

    const stakingRewardContract = await hre.ethers.getContractFactory("StakingRewards");
    stakingReward = await stakingRewardContract.deploy(FnftVault.address, weth);
    await stakingReward.deployed();
    console.log("stakeReward deployed to:", stakingReward.address);


}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
