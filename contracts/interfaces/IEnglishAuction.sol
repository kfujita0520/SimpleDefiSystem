// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IEnglishAuction {
    event Start();
    event End(address winner, uint amount);
    event Bid(address highBidder, uint256 highBid);
    event Withdraw(address bidder, uint amount);


    function start(address _token, uint256 _amount, uint256 _reservePrice, uint256 _minIncrement, uint256 _timeoutPeriod) external;
    function withdraw() external;
    function withdrawWETH() external returns (uint256);
    function bid(uint256 price) external payable;
    function end() external;
}