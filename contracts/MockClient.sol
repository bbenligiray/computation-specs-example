//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract MockClient {
  function fulfill(bytes calldata response) external view {
    // Since the owner of the client created the request, they should know in what
    // format the response will be in (a uint256 and a string)
    (uint256 response1, string memory response2) = abi.decode(response, (uint256,string));
    console.log("These are received and decoded at the client contract, ready to be used in business logic");
    console.log(response1);
    console.log(response2);
  }
}
