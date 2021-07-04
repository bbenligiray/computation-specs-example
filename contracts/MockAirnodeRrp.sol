//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract MockAirnodeRrp {
  event RequestCreated(bytes parameters);

  function makeRequest(bytes calldata parameters) external {
    emit RequestCreated(parameters);
  }
}
