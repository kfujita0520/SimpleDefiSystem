// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";

contract FnftToken is ERC20, Ownable, ERC721Holder {
    IERC721 public nft;
    uint256 public tokenId;
    uint256 public initialSupply = 0;
    bool public initialized = false;


    constructor(string memory name, string memory symbol) ERC20(name, symbol) {}

    function fractionate(address _nft, uint256 _tokenId, address[] memory addresses, uint[] memory amounts) external onlyOwner {
        require(!initialized, "Contract has already fractionated for given NFT");
        require(addresses.length == amounts.length, "given argument is wrong");
        nft = IERC721(_nft);
        tokenId = _tokenId;
        nft.safeTransferFrom(msg.sender, address(this), _tokenId);
        for(uint i=0; i< addresses.length; i++){
            require(amounts[i] > 0, "Amount needs to be more than 0");
            initialSupply += amounts[i];
            _mint(addresses[i], amounts[i]);
        }
        initialized = true;

    }

    function mint(address to, uint256 amount) external onlyOwner {
        require(initialized, "FnftToken is not initialized yet");
        _mint(to, amount);
    }

    //If all token is burned, the nft will be unlocked.
    function redeem() external {
        _burn(msg.sender, totalSupply());
        nft.transferFrom(address(this), msg.sender, tokenId);
        initialized = false;
    }
}