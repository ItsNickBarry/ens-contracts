// import '@nomicfoundation/hardhat-verify'
import HardhatToolboxViem from '@nomicfoundation/hardhat-toolbox-viem'
// import 'hardhat-gas-reporter'
// import 'solidity-coverage'
// import './tasks/hardhat-deploy-viem.js'

import dotenv from 'dotenv'
import HardhatAbiExporter from '@solidstate/hardhat-abi-exporter'
import HardhatContractSizer from '@solidstate/hardhat-contract-sizer'
// import 'hardhat-deploy'
import type { HardhatUserConfig } from 'hardhat/config'

// import('@ensdomains/hardhat-chai-matchers-viem')

// hardhat actions
import taskEsmFix from './tasks/esm_fix.js'

// Load environment variables from .env file. Suppress warnings using silent
// if this file is missing. dotenv will never modify any environment variables
// that have already been set.
// https://github.com/motdotla/dotenv
dotenv.config({ debug: false })

let real_accounts = undefined
if (process.env.DEPLOYER_KEY) {
  real_accounts = [
    process.env.DEPLOYER_KEY,
    process.env.OWNER_KEY || process.env.DEPLOYER_KEY,
  ]
}

// circular dependency shared with actions
export const archivedDeploymentPath = './deployments/archive'

const config = {
  plugins: [HardhatToolboxViem, HardhatAbiExporter, HardhatContractSizer],
  tasks: [taskEsmFix],
  networks: {
    hardhat: {
      type: 'edr',
      // saveDeployments: false,
      // tags: ['test', 'legacy', 'use_root'],
      allowUnlimitedContractSize: false,
      forking: {
        url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
        enabled: !!process.env.FORKING_ENABLED,
      },
    },
    localhost: {
      type: 'http',
      url: 'http://127.0.0.1:8545/',
      saveDeployments: false,
      tags: ['test', 'legacy', 'use_root'],
    },
    rinkeby: {
      type: 'http',
      url: `https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`,
      tags: ['test', 'legacy', 'use_root'],
      chainId: 4,
      accounts: real_accounts,
    },
    ropsten: {
      type: 'http',
      url: `https://ropsten.infura.io/v3/${process.env.INFURA_API_KEY}`,
      tags: ['test', 'legacy', 'use_root'],
      chainId: 3,
      accounts: real_accounts,
    },
    goerli: {
      type: 'http',
      url: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
      tags: ['test', 'legacy', 'use_root'],
      chainId: 5,
      accounts: real_accounts,
    },
    sepolia: {
      type: 'http',
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
      tags: ['test', 'legacy', 'use_root'],
      chainId: 11155111,
      accounts: real_accounts,
    },
    holesky: {
      type: 'http',
      url: `https://holesky.gateway.tenderly.co`,
      tags: ['test', 'legacy', 'use_root'],
      chainId: 17000,
      accounts: real_accounts,
    },
    mainnet: {
      type: 'http',
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      tags: ['legacy', 'use_root'],
      chainId: 1,
      accounts: real_accounts,
    },
  },
  // mocha: {},
  solidity: {
    compilers: [
      {
        version: '0.8.17',
        settings: {
          optimizer: {
            enabled: true,
            runs: 1200,
          },
        },
      },
      // for DummyOldResolver contract
      {
        version: '0.4.11',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  abiExporter: {
    path: './build/contracts',
    runOnCompile: true,
    clear: true,
    flat: true,
    except: [
      'Controllable$',
      'INameWrapper$',
      'SHA1$',
      'Ownable$',
      'NameResolver$',
      'TestBytesUtils$',
      'legacy/*',
    ],
    spacing: 2,
    pretty: true,
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    owner: {
      default: 1,
      1: '0xFe89cc7aBB2C4183683ab71653C4cdc9B02D44b7',
    },
  },
  external: {
    contracts: [
      {
        artifacts: [archivedDeploymentPath],
      },
    ],
  },
} satisfies HardhatUserConfig

export default config
