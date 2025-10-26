const hre = require("hardhat");

async function main() {
  const ReportRegistry = await hre.ethers.getContractFactory("ReportRegistry");
  const reportRegistry = await ReportRegistry.deploy();

  await reportRegistry.waitForDeployment();

  const address = await reportRegistry.getAddress();
  console.log(`ReportRegistry deployed to ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});