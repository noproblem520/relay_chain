// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract sideChain {
    string[][5] TEArray;
    string[][5] TVArray;

    function uploadTE(string[] calldata TEAry) public returns (bool) {
        for (uint256 i = 0; i < 5; i++) {
            TEArray[i].push(TEAry[i]);
        }
        return true;
    }

    function uploadTV(string[] calldata TVAry) public returns (bool) {
        for (uint256 i = 0; i < 5; i++) {
            TVArray[i].push(TVAry[i]);
        }
        return true;
    }

    function retrieveTE(uint256 node) public view returns (string[] memory) {
        return TEArray[node];
    }

    function retrieveTV(uint256 node) public view returns (string[] memory) {
        return TVArray[node];
    }
}
