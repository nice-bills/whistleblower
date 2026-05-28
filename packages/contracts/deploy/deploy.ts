import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployment = await deploy("ConfidentialWhistleblower", {
    from: deployer,
    log: true,
  });

  console.log("ConfidentialWhistleblower:", deployment.address);
};

export default func;
func.id = "deploy_confidential_whistleblower";
func.tags = ["ConfidentialWhistleblower"];
