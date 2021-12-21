import sdk from './getSdk'
import configuration from './configuration'

const { appAddress } = configuration

const app = sdk.getAppModule(appAddress);

(async () => {
  try {
    const tokenModule = await app.deployTokenModule({
      // What's your token's name? Ex. "Ethereum"
      name: 'CandyDAO Governance Token',
      // What's your token's symbol? Ex. "ETH"
      symbol: 'CANDY',
    })
    console.log(
      '✅ Successfully deployed token module, address',
      tokenModule.address,
    )
  } catch (error) {
    console.error('Failed to deploy token module', error)
  }
})()