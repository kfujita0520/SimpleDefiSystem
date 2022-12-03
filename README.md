# Simple Defi System
This system will achive following use case. 
1) Issue ERC20 tokens by locking a NFT. Initial token will be given to specified owners.
2) Token holder can stake their token to Staking contract (with no lockup). Rewards will come from Auction below.
3) Above token will be minted every day with 1% of the initial total supply. 
4) These newly minted ERC-20 tokens will be immediately auctioned off for ETH. 
5) The earnings will be distributed to the stakers in proportion to their stakes. Devs should have a reward fee of 5% on the auction

## 1: NFT fractionalization Contract
Offer following features:
- Lock an NFT
- Issue initial shares as ERC-20 tokens to various addresses as defined by the contract owner.

## 2: Staking Contract
Offer a simple staking program for the ERC-20 tokens. Rewards will come from Auction.

## 3: Auction Contract
Offer English auction with starting bid as 0.1 ETH.

## 4: Vault Contract
Offer focal point of this defi system to triger following jobs.
- Fractionalize NFT
- Daily token mint
- Auction off newly minted token
- Distribute reward comes from Auction.

