// function deployFunc() {
//   console.log("Hi");
// }
// module.exports.default = deployFunc;

const { networkConfig, developmentChains } = require('../helper-hardhat-config')
const { network } = require('hardhat')
const { verify } = require('../utils/verify')

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = network.config.chainId

  let ethUsdPriceFeedAddress

  //In this if is where the magic happens. It deploys the mock contract if you are in dev mode or selects the address of the oracle in the testnet. Pretty cool
  if (developmentChains.includes(network.name)) {
    const ethUsdAggregator = await deployments.get('MockV3Aggregator')
    ethUsdPriceFeedAddress = ethUsdAggregator.address
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId]['ethUsdPriceFeed']
  }
  //for local networks we will use a mock contract
  const args = [ethUsdPriceFeedAddress]
  const fundMe = await deploy('FundMe', {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  })

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(fundMe.address, args)
  }

  log('----------------------------------------------------')
}
module.exports.tags = ['all', 'fundme']
