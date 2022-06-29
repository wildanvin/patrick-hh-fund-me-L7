require('dotenv').config()

require('@nomiclabs/hardhat-etherscan')
require('@nomiclabs/hardhat-waffle')
require('hardhat-gas-reporter')
require('solidity-coverage')
require('hardhat-deploy')

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  //solidity: '0.8.4',
  solidity: {
    compilers: [{ version: '0.8.8' }, { version: '0.6.6' }],
  },
  defaultNetwork: 'hardhat',

  networks: {
    rinkeby: {
      url: process.env.RINKEBY_RPC_URL || '',
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      blockConfirmations: 6,
      chainId: 4,
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: true,
    currency: 'USD',
    outputFile: 'gas-report.txt',
    noColors: true,
    //coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
}
