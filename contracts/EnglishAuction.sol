// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./interfaces/IEnglishAuction.sol";
import "./interfaces/IWETH.sol";

contract EnglishAuction is ReentrancyGuard, IEnglishAuction {
    using SafeMath for uint256;

    address seller;

    IERC20 public token;
    uint256 public amount;
    uint256 public reservePrice;
    uint256 public minIncrement;
    uint256 public timeoutPeriod;

    bool public started;
    uint256 public auctionEnd;

    address highBidder;
    mapping(address => uint256) public bidBalance;

    IWETH public weth;


    constructor (address _seller, address _weth)
    {
        seller = _seller;
        weth = IWETH(_weth);
    }


    function start(address _token, uint256 _amount, uint256 _reservePrice, uint256 _minIncrement, uint256 _timeoutPeriod) external override {
        require(!started, "started");
        require(msg.sender == seller, "not seller");

        token = IERC20(_token);
        amount = _amount;
        reservePrice = _reservePrice;
        minIncrement = _minIncrement;
        token.transferFrom(msg.sender, address(this), amount);
        started = true;
        timeoutPeriod = _timeoutPeriod;
        auctionEnd = block.timestamp + _timeoutPeriod;

        emit Start();
    }

    function withdraw() external nonReentrant override {
        require(msg.sender != highBidder, "highest bidder cannot cancel the bid");

        uint256 bidAmount = bidBalance[msg.sender];
        bidBalance[msg.sender] = 0;
        payable(msg.sender).transfer(bidAmount);

        emit Withdraw(msg.sender, bidAmount);
    }

    function withdrawWETH() external nonReentrant override returns (uint256) {
        require(msg.sender != highBidder, "highest bidder cannot cancel the bid");

        uint256 bidAmount = bidBalance[msg.sender];
        bidBalance[msg.sender] = 0;
        weth.deposit{value: bidAmount}();
        weth.transfer(msg.sender, bidAmount);

        emit Withdraw(msg.sender, bidAmount);
        return bidAmount;
    }


    function bid(uint256 price) external payable override{
        require(started, "auction is not started");
        require(block.timestamp < auctionEnd, "auction period is ended");
        require(price >= reservePrice, "bidding price must be more than reserve price");
        if(highBidder!=address(0)){
            require(price >= bidBalance[highBidder].add(minIncrement), "incremented bidding price is less than minimum increment amount");
        }
        bidBalance[msg.sender] = bidBalance[msg.sender].add(msg.value);
        require(bidBalance[msg.sender] == price, "bidding price and sent ether amount is different");

        highBidder = msg.sender;

        emit Bid(highBidder, price);
    }

    function end() external override {
        require(block.timestamp >= auctionEnd, "Auction is still in progress");
        emit End(highBidder, bidBalance[highBidder]);

        uint256 t = token.balanceOf(address(this));

        if (highBidder == address(0)) {
            require(token.transfer(seller, t));
        } else {
            // transfer tokens to high bidder
            require(token.transfer(highBidder, t));

            // transfer ether balance to seller
            bidBalance[seller] = bidBalance[seller].add(bidBalance[highBidder]);
            bidBalance[highBidder] = 0;

            highBidder = address(0);
        }
        started = false;

    }
}