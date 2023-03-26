const hre = require("hardhat");
const { ethers } = require("hardhat");

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
        recipient
    ] = await ethers.getSigners();

    const PathFactory = await ethers.getContractFactory("PathFactory");
    const Carrier = await ethers.getContractFactory("Carrier");
    const Path = await ethers.getContractFactory("Path");

    // deploy path factory
    pathFactory = await PathFactory.deploy();
    console.log("Path Factory: " + pathFactory.address);

    // deploy government services
    carrier1 = await Carrier.deploy(carrier1Owner.address, "Carrier1");
    console.log("Carrier1: " + carrier1.address);
    carrier2 = await Carrier.deploy(carrier2Owner.address, "Carrier2");
    console.log("Carrier2: " + carrier2.address);
    carrier3 = await Carrier.deploy(carrier3Owner.address, "Carrier3");
    console.log("Carrier3: " + carrier3.address);

    // add signers to government services
    tx = await carrier1.connect(carrier1Owner).grantRole(await carrier1.SIGNER_ROLE(), carrier1Signer1.address);
    await tx.wait();
    await carrier1.connect(carrier1Owner).grantRole(await carrier1.SIGNER_ROLE(), carrier1Signer2.address);
    await tx.wait();
    await carrier2.connect(carrier2Owner).grantRole(await carrier2.SIGNER_ROLE(), carrier2Signer1.address);
    await tx.wait();
    await carrier3.connect(carrier3Owner).grantRole(await carrier3.SIGNER_ROLE(), carrier3Signer1.address);
    await tx.wait();

    console.log("Done");

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
