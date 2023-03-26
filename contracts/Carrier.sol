// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./Path.sol";

contract Carrier is AccessControl {
    string public name;
    bytes32 public constant SIGNER_ROLE = keccak256("SIGNER_ROLE");

    constructor(address _owner, string memory _name) {
        name = _name;
        _setupRole(DEFAULT_ADMIN_ROLE, _owner);
    }

    function transferValuable(address _pathAddress, address _newHolder)
        public
        onlyRole(SIGNER_ROLE)
    {
        Path path = Path(_pathAddress);
        path.initiateTransition(_newHolder);
    }

    function acceptValuable(address _pathAddress, bytes32 _otp) public onlyRole(SIGNER_ROLE) {
        Path path = Path(_pathAddress);
        path.acceptTransition(_otp);
    }
}
