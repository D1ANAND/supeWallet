// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyNFT is ERC721URIStorage, Ownable {
    string constant TOKEN_URI = "https://dweb.link/ipfs/QmZUjdPLcG1mW1MwuFPurB2LSMUNHj1d9JREnMGxmFTd8y";
    uint256 internal tokenId;

    constructor() ERC721("MyNFT", "MNFT") Ownable(msg.sender) {} 
    
    function mint(address to) public onlyOwner {
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, TOKEN_URI);
        unchecked {
            tokenId++;
        }
    }
}