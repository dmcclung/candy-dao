import { ThirdwebSDK } from '@3rdweb/sdk'
import { ethers } from 'ethers'
import configuration from './configuration'

const { privateKey, network } = configuration

if (!privateKey || !network) {
  console.log('Missing')
  process.exit(1)
}

const sdk = new ThirdwebSDK(
  new ethers.Wallet(
    privateKey,
    ethers.getDefaultProvider(network),
  ),
)

export default sdk