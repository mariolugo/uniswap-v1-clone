import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { verify } from "../utils/verify";
import { run } from "hardhat";

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Deploys a contract named "YourContract" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network goerli`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` which will fill DEPLOYER_PRIVATE_KEY
    with a random private key in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const tokenContract = await deploy("Token", {
    from: deployer,
    // Contract constructor arguments

    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  const exchangeContract = await deploy("Exchange", {
    from: deployer,
    // Contract constructor arguments
    args: [tokenContract.address],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  // Wait for 30 seconds to let Etherscan catch up on contract deployments
  // await sleep(30 * 1000);

  await run("verify:verify", {
    address: tokenContract.address,
    constructorArguments: [],
    contract: "contracts/Token.sol:Token",
  });

  await hre.run("verify:verify", {
    address: exchangeContract.address,
    constructorArguments: [tokenContract.address],
  });

  // Get the deployed contract
  // const yourContract = await hre.ethers.getContract("YourContract", deployer);
};

export default deployYourContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployYourContract.tags = ["Token", "Exchange"];
