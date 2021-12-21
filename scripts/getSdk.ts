import { ThirdwebSDK } from '@3rdweb/sdk'
import { ethers } from 'ethers'
import configuration from './configuration'

const { privateKey, network } = configuration

const sdk = new ThirdwebSDK(
  new ethers.Wallet(
    privateKey,
    ethers.getDefaultProvider(network),
  ),
)

export default sdk