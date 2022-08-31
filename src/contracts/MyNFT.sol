// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import './ERC721Connector.sol';

contract MyNFT is ERC721Connector {

    string [] public nfts; // Making an array of public string to store hyperlinks of image source

    mapping(string => bool) public _nftExists; // mapping them to check whether they exisit or not

    mapping(string => uint256) public _nftId;
    
    function mint(string memory _nft) public {

        require(!_nftExists[_nft],
        'Error - Token already exists');
        nfts.push(_nft);
        uint _id = nfts.length - 1;

        _mint(msg.sender, _id);
        _nftId[_nft] = _id;
        _nftExists[_nft] = true;

    }

    function getTokenID(string memory _nft) external view returns(uint256){ 
        require(_nftExists[_nft],
        'Error - Token does not exists');
        return _nftId[_nft];
    }

    function getAllTokens() external view returns(string[] memory ){
        return nfts;
    }

    constructor() ERC721Connector('MyTokens','Nilesh')
 {}

}


