const hre = require("hardhat");
const { ethers } = require("hardhat");
const EthCrypto = require('eth-crypto');
const crypto = require('crypto');


async function printPathState(path) {
    console.log("Owner : " + await path.owner())
    console.log("Holder: " + await path.holder())
    console.log("CreatedAt: " + await path.createdAt())
    console.log("Location: " + await path.location())
    console.log("PendingNewHolder: " + await path.pendingNewHolder())
    console.log("OTP: " + await path.otp())
}


async function main() {

    const [
        owner,
        carrier1Owner,
        carrier1Signer1,
        carrier1Signer2,
        carrier2Owner,
        carrier2Signer1,
        carrier3Owner,
        carrier3Signer1,
        missionController,
        receiverOwner,
        receiverSigner1,
        logger
    ] = await ethers.getSigners();

    const PathFactory = await ethers.getContractFactory("PathFactory");
    const Carrier = await ethers.getContractFactory("Carrier");
    const Path = await ethers.getContractFactory("Path");

    // deploy path factory
    pathFactory = await PathFactory.deploy();
    console.log("Path Factory: " + pathFactory.address);

    // deploy carriers and receiver
    carrier1 = await Carrier.deploy(carrier1Owner.address, "Carrier1");
    console.log("Carrier1: " + carrier1.address);
    carrier2 = await Carrier.deploy(carrier2Owner.address, "Carrier2");
    console.log("Carrier2: " + carrier2.address);
    carrier3 = await Carrier.deploy(carrier3Owner.address, "Carrier3");
    console.log("Carrier3: " + carrier3.address);
    receiver = await Carrier.deploy(receiverOwner.address, "Receiver");
    console.log("Receiver: " + receiver.address);

    // add signers to carriers and receiver
    tx = await carrier1.connect(carrier1Owner).grantRole(await carrier1.SIGNER_ROLE(), carrier1Signer1.address);
    await tx.wait();
    await carrier1.connect(carrier1Owner).grantRole(await carrier1.SIGNER_ROLE(), carrier1Signer2.address);
    await tx.wait();
    await carrier2.connect(carrier2Owner).grantRole(await carrier2.SIGNER_ROLE(), carrier2Signer1.address);
    await tx.wait();
    await carrier3.connect(carrier3Owner).grantRole(await carrier3.SIGNER_ROLE(), carrier3Signer1.address);
    await tx.wait();
    await receiver.connect(receiverOwner).grantRole(await receiver.SIGNER_ROLE(), receiverSigner1.address);
    await tx.wait();

    console.log("System Setup And Running\n");



    console.log("Mission Controller decides the following path")
    console.log("Carrier1 delivers packet to carrier2 at location 33.0000000,32.0000000")
    console.log("Carrier2 delivers packet to carrier3 at location 33.2000000,32.2000000")
    console.log("Carrier3 delivers packet to receiver at location 33.4000000,32.4000000")

    carrier1_keys = EthCrypto.createIdentity();
    carrier2_keys = EthCrypto.createIdentity();
    carrier3_keys = EthCrypto.createIdentity();
    receiver_keys = EthCrypto.createIdentity();





    console.log("Adding onion layers")

    randomInput = crypto.randomBytes(32)
    otp = await pathFactory.nextOtp(randomInput)


    receiverMessage = {
        "password": "5up3r5tr0ngp@sw0rd!",
        otp: otp
    }

    encrypted = await EthCrypto.encryptWithPublicKey(
        receiver_keys.publicKey,
        JSON.stringify(receiverMessage)
    );

    otp = await pathFactory.nextOtp(otp)

    carrier3Message = {
        data: encrypted,
        location: {
            lon: "33.4000000",
            lat: "32.4000000",
        },
        otp: otp 
    }

    encrypted = await EthCrypto.encryptWithPublicKey(
        carrier3_keys.publicKey,
        JSON.stringify(carrier3Message)
    );

    otp = await pathFactory.nextOtp(otp)

    carrier2Message = {
        data: encrypted,
        location: {
            lon: "33.2000000",
            lat: "32.2000000",
        },
        otp: otp
    }

    encrypted = await EthCrypto.encryptWithPublicKey(
        carrier2_keys.publicKey,
        JSON.stringify(carrier2Message)
    );

    otp = await pathFactory.nextOtp(otp)

    carrier1Message = {
        data: encrypted,
        location: {
            lon: "33.0000000",
            lat: "32.0000000",
        },
        otp: otp
    }

    encrypted = await EthCrypto.encryptWithPublicKey(
        carrier1_keys.publicKey,
        JSON.stringify(carrier1Message)
    );

    console.log(encrypted)


    console.log("Final encrypted onion: ")
    console.log(encrypted)


    console.log("Mission Controller: " + missionController.address + " deploys new path")
    tx = await pathFactory.createPath(await pathFactory.nextOtp(otp), logger.address);
    receipt = await tx.wait();
    pathCreatedEvent = receipt.events[0].args
    console.log("Path created: " + pathCreatedEvent.pathAddress)

    pathAddress = pathCreatedEvent.pathAddress
    path = await Path.attach(pathAddress);


    console.log("Mission Begins")

    tx = await path.connect(logger).recordLocation(
        "0x000011112222333300001111222233330000111122223333000011112222AAAA",
        "0x000011112222333300001111222233330000111122223333000011112222BBBB",
    )
    receipt = await tx.wait()
    e = receipt.events[0].args
    console.log("Encrypted location: " + e.lon + " " + e.lat)


    tx = await path.connect(logger).recordTemperature(
        "0x000011112222333300001111222233330000111122223333000011112222CCCC",
    )
    receipt = await tx.wait()
    e = receipt.events[0].args
    console.log("Encrypted temperature: " + e.temperature)

    tx = await path.connect(logger).recordHumidity(
        "0x000011112222333300001111222233330000111122223333000011112222DDDD",
    )
    receipt = await tx.wait()
    e = receipt.events[0].args
    console.log("Encrypted humidity: " + e.humidity)
    


}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
