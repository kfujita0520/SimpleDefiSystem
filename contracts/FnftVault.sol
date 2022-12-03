// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./FnftToken.sol";
import "./interfaces/IEnglishAuction.sol";
import "./interfaces/IStakingRewards.sol";
import "./interfaces/IWETH.sol";


contract FnftVault is Ownable, ERC721Holder {
    using SafeMath for uint256;

    IERC721 public nft;
    uint256 public tokenId;
    FnftToken public fNftToken;
    IEnglishAuction public auction;
    IStakingRewards public staking;
    IWETH public weth;

    bool public initialized = false;
    bool public configured = false;

    uint256 reservePrice = 10**17; //0.1 ETH
    uint256 minIncrement = 10**16; //0.01 ETH
    uint256 SECONDS_IN_A_HOUR = 3600;
    uint256 SECONDS_IN_A_DAY = 86400;

    constructor() {}

    function fractionateNFT(address _nft, uint256 _tokenId, string memory tokenName, string memory tokenSymbol, address[] memory addresses, uint[] memory amounts) external onlyOwner {
        require(!initialized, "already fractionated");
        nft = IERC721(_nft);
        tokenId = _tokenId;
        //fNftToken = new FnftToken("F-NFT Token", "FNT");
        fNftToken = new FnftToken(tokenName, tokenSymbol);

        nft.safeTransferFrom(msg.sender, address(this), tokenId);
        nft.approve(address(fNftToken), tokenId);

        fNftToken.fractionate(_nft, tokenId, addresses, amounts);
        initialized = true;

    }

    function configure(address _auction, address _staking, address _weth) external {
        require(initialized, "should fractionate first");
        auction = IEnglishAuction(_auction);
        staking = IStakingRewards(_staking);
        weth = IWETH(_weth);
        configured = true;
    }

    /**
     * @notice This will be executed daily. mint 1% of initialSupply amount and auctioned off for 12 hours period
     */
    function mintTokenForAuction() external onlyOwner {
        require(configured, "related contracts are not configured yet");
        uint256 mintAmount = fNftToken.initialSupply().div(100);
        fNftToken.mint(address(this), mintAmount);
        fNftToken.approve(address(auction), mintAmount);
        auction.start(address(fNftToken), mintAmount, reservePrice, minIncrement, SECONDS_IN_A_HOUR*12);
    }

    /**
     * @notice This will be executed daily. distribute 95% of auction earning while 5% will be hold by dev.
     */
    function distributeEarning() external payable onlyOwner {
        require(configured, "related contracts are not configured yet");
        auction.end();
        uint256 earning = auction.withdrawWETH();
        uint256 rewardAmount = earning.mul(95).div(100);//distribute 95 % of earning. 5% will remain for dev's income.
        weth.approve(address(staking), rewardAmount);
        staking.claimRewardAmount(rewardAmount, SECONDS_IN_A_DAY);

    }

    /********************/
    /* Getter Functions */
    /********************/
    function getFnftToken() external view returns (address) {
        return address(fNftToken);
    }



}