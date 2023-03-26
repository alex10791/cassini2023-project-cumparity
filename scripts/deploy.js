const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {

    const [
        owner,
        service1Owner,
        service1Signer1,
        service1Signer2,
        service2Owner,
        service2Signer1,
        service3Owner,
        service3Signer1,
        requester,
    ] = await ethers.getSigners();

    const RequestFactory = await ethers.getContractFactory("RequestFactory");
    const GovService = await ethers.getContractFactory("GovService");
    const Request = await ethers.getContractFactory("Request");

    // deploy request factory
    requestFactory = await RequestFactory.deploy();
    console.log("Request Factory: " + requestFactory.address);

    // deploy government services
    service1 = await GovService.deploy(service1Owner.address, "Service1");
    console.log("Service1: " + service1.address);
    service2 = await GovService.deploy(service2Owner.address, "Service2");
    console.log("Service2: " + service2.address);
    service3 = await GovService.deploy(service3Owner.address, "Service3");
    console.log("Service3: " + service3.address);

    // add signers to government services
    tx = await service1.connect(service1Owner).grantRole(await service1.SIGNER_ROLE(), service1Signer1.address);
    await tx.wait();
    await service1.connect(service1Owner).grantRole(await service1.SIGNER_ROLE(), service1Signer2.address);
    await tx.wait();
    await service2.connect(service2Owner).grantRole(await service2.SIGNER_ROLE(), service2Signer1.address);
    await tx.wait();
    await service3.connect(service3Owner).grantRole(await service3.SIGNER_ROLE(), service3Signer1.address);
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
