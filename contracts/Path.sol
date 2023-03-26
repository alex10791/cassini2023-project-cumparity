// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract Path {

    address public owner;
    address public holder;
    uint256 public createdAt;
    uint256 public updateAt;
    bytes public location;
    address public pendingNewHolder;
    bytes32 public otp;
    address public logger;
    

    event TransferInitiated(
        address owner,
        address currentHolder,
        address newHolder,
        uint256 timestamp
    );
    event TransferAccepted(
        address owner,
        address currentHolder,
        address newHolder,
        uint256 timestamp
    );
    event LogLocation(
        bytes32 lon,
        bytes32 lat,
        uint256 timestamp
    );
    event LogTemparature(
        bytes32 temperature,
        uint256 timestamp
    );
    event LogHumidity(
        bytes32 humidity,
        uint256 timestamp
    );

    constructor(address _owner, bytes32 _otp, address _logger) {
        owner = _owner;
        holder = _owner;
        createdAt = block.timestamp;
        updateAt = createdAt;
        otp = _otp;
        logger = _logger;
    }

    function initiateTransition(address _newHolder) public {
        require(msg.sender == holder, "Not current holder");
        pendingNewHolder = _newHolder;
        emit TransferInitiated(
            owner,
            holder,
            pendingNewHolder,
            block.timestamp
        );
    }

    function acceptTransition(bytes32 _otp) public {
        require(msg.sender == pendingNewHolder, "Not pending holder");
        require(otp == nextOtp(_otp), "OTP mismatch");
        address oldHolder = holder;
        otp = _otp;
        holder = pendingNewHolder;
        pendingNewHolder = address(0);
        updateAt = block.timestamp;
        emit TransferAccepted(
            owner,
            oldHolder,
            holder,
            block.timestamp
        );
    }

    function recordLocation(bytes32 _lon, bytes32 _lat) public {
        require(msg.sender == logger, "Only logger can call this function");
        emit LogLocation(_lon, _lat, block.timestamp);
    }

    function recordTemperature(bytes32 _temperature) public {
        require(msg.sender == logger, "Only logger can call this function");
        emit LogTemparature(_temperature, block.timestamp);
    }

    function recordHumidity(bytes32 _humidity) public {
        require(msg.sender == logger, "Only logger can call this function");
        emit LogHumidity(_humidity, block.timestamp);
    }

    function nextOtp(bytes32 _otp) public pure returns(bytes32) {
        return keccak256(abi.encodePacked(_otp));
    }

}
