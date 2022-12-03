// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const {moveTime} = require("./utils/move-time");
const {moveBlocks} = require("./utils/move-blocks");

let stakingReward, rewardToken, stakeToken, stakeInfo, deployer, staker1, staker2, staker3;

const SECONDS_IN_A_HOUR = 3600
const SECONDS_IN_A_DAY = 86400
const SECONDS_IN_A_WEEK = 604800
const SECONDS_IN_A_YEAR = 31449600

async function main() {

    await initialSetup();



    //await soloStakingGeneralProgress();

    await performClaimReward();


    console.log('Complete');

}

async function initialSetup(){
    [deployer, staker1, staker2, staker3] = await hre.ethers.getSigners();
    const rewardTokenContract = await hre.ethers.getContractFactory("RewardToken");
    rewardToken = await rewardTokenContract.deploy();
    await rewardToken.deployed();
    console.log("rewardToken deployed to:", rewardToken.address);
    console.log("balance of rewardToken on deployer:", (await rewardToken.balanceOf(deployer.address)).toString());
    const stakeTokenContract = await hre.ethers.getContractFactory("StakeToken");
    stakeToken = await stakeTokenContract.deploy();
    await stakeToken.deployed();
    console.log("stakeToken deployed to:", stakeToken.address);

    const stakingRewardContract = await hre.ethers.getContractFactory("StakingRewards");
    stakingReward = await stakingRewardContract.deploy(deployer.address, rewardToken.address);
    await stakingReward.deployed();
    console.log("stakeReward deployed to:", stakingReward.address);

    await stakingReward.initializeStakingToken(stakeToken.address);



    //move reward token to staking contract
    //await rewardToken.transfer(stakingReward.address, hre.ethers.utils.parseEther("100000"));
    //move stake token to stakers
    await stakeToken.transfer(staker1.address, hre.ethers.utils.parseEther("100000"));
    await stakeToken.transfer(staker2.address, hre.ethers.utils.parseEther("100000"));
    //await stakeTokenA.transfer(staker3.address, hre.ethers.utils.parseEther("100000"));
}



async function performClaimReward(){
    console.log(stakeInfo);

    let amount100 = hre.ethers.utils.parseEther("100");

    await stakeToken.connect(staker1).approve(stakingReward.address, amount100);
    await stakingReward.connect(staker1).stake(amount100);

    console.log('Status of Staking: Initial');
    await printGlobalStatus(stakingReward);

    //Fund reward to Staking contract through Factory contract
    await rewardToken.approve(stakingReward.address, 8640000);
    await stakingReward.claimRewardAmount(8640000, SECONDS_IN_A_DAY);

    console.log('------------------------');
    console.log('Status of Staking: after Reward notification');
    await printGlobalStatus(stakingReward);
    await moveTime(SECONDS_IN_A_HOUR*12);
    await moveBlocks(1);

    console.log('------------------------');
    console.log('Status of Staking: after 12 hour staking');
    await printGlobalStatus(stakingReward);

}


async function soloStakingGeneralProgress(){
    console.log('Status of Staking: Initial');
    await printGlobalStatus(stakingReward);

    let amount100 = hre.ethers.utils.parseEther("100");
    await stakeToken.connect(staker1).approve(stakingReward.address, amount100);
    await stakingReward.connect(staker1).stake(amount100);

    await rewardToken.approve(stakingReward.address, amount100);
    await stakingReward.claimRewardAmount(amount100, SECONDS_IN_A_DAY);

    console.log('------------------------');
    console.log('Status of Staking: after Reward notification');
    await printGlobalStatus(stakingReward);

    await moveTime(SECONDS_IN_A_HOUR);
    await moveBlocks(1);

    console.log('------------------------');
    console.log('Status of Staking: after 1 hour staking');
    await printGlobalStatus(stakingReward);
    console.log("Status of Staker1");
    await printStakerStatus(staker1);

    await moveTime(SECONDS_IN_A_DAY);
    await moveBlocks(1);

    console.log('------------------------');
    console.log('Status of Staking: after 1 day and 1 hour staking');
    await printGlobalStatus(stakingReward);
    console.log("Status of Staker1");
    await printStakerStatus(staker1);

    await stakingReward.connect(staker1).quit();
    console.log('------------------------');
    console.log('Status of Staking: after quit staking');
    await printGlobalStatus(stakingReward);
    console.log("Status of Staker1");
    await printStakerStatus(staker1);
    console.log('reward balance of staker1: ', (await rewardToken.balanceOf(staker1.address)).toString());
}


async function printGlobalStatus(staking){
    let reward = await staking.rewardPerToken();
    console.log("Reward Per Token: ", reward.toString());
    let supplyBal = await staking.totalSupply();
    console.log("Total Supply Balance: ", hre.ethers.utils.formatEther(supplyBal));
    let lastUpdateTime = await staking.lastUpdateTime();
    console.log("last update time: ", lastUpdateTime.toString());
    let periodFinishTime = await staking.periodFinish();
    console.log("period finish time: ", periodFinishTime.toString());
    let rewardRate = await staking.rewardRate();
    console.log("rewardRate: ", rewardRate.toString());
    let rewardBalance = await rewardToken.balanceOf(staking.address);
    console.log("total reward balance: ", rewardBalance.toString());
}

async function printStakerStatus(staker){
    let earned = await stakingReward.earned(staker.address);//this should be the same as claimable amount
    console.log("Claimable Amount for this staker: ", earned.toString());
    let balance = await stakingReward.balanceOf(staker.address);
    console.log("Balance of staker: ", hre.ethers.utils.formatEther(balance));
    let paidRewardPerToken = await stakingReward.userRewardPerTokenPaid(staker.address);
    console.log("Paid Reward Amount Per Token for this staker: ", paidRewardPerToken.toString());
    let rewardUser = await stakingReward.rewards(staker.address);
    console.log("Reward Amount for this staker: ", rewardUser.toString());


}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
