// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./Path.sol";

contract PathFactory {
    event PathCreated(address pathAddress);

    mapping(address => address) public paths;

    function createPath(bytes32 _otp, address _logger) public returns(address) {
        Path path = new Path(msg.sender, _otp, _logger);
        emit PathCreated(address(path));
        return address(path);
    }

    function nextOtp(bytes32 _otp) public pure returns(bytes32) {
        return keccak256(abi.encodePacked(_otp));
    }
}
