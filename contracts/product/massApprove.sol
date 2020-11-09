// SPDX-License-Identifier: Apache License, Version 2.0
pragma solidity 0.6.10;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract massApprove {

    function approveList (address[] memory tokens, uint256[] calldata values, address approveTo) public returns(uint256 res) {
        require(address(approveTo) != address(0), "need correct address");
        require(tokens.length > 0, "tokens length must be > 0!");
        require(tokens.length == values.length, "tokens and values must be the same length!");
        
        for (uint256 index = 0; index < tokens.length; index++) {
            ERC20(tokens[index]).approve(approveTo, values[index]);
            res = res + 1;
        }        
    }
}