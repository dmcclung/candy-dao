import { ethers } from 'ethers'
import sdk from './getSdk'
import configuration from './configuration'

const { appAddress, tokenAddress } = configuration

// This is the address to our ERC-1155 membership NFT contract.
const bundleDropModule = sdk.getBundleDropModule(appAddress)

// This is the address to our ERC-20 token contract.
const tokenModule = sdk.getTokenModule(tokenAddress);

(async () => {
  try {
    // Grab all the addresses of people who own our membership NFT, which has
    // a tokenId of 0.
    const walletAddresses = await bundleDropModule.getAllClaimerAddresses('0')

    if (walletAddresses.length === 0) {
      console.log(
        'No NFTs have been claimed',
      )
      process.exit(0)
    }

    // Loop through the array of addresses.
    const airdropTargets = walletAddresses.map((address) => {
      // Pick a random # between 1000 and 10000.
      const randomAmount = Math.floor(Math.random() * (10000 - 1000 + 1) + 1000)
      console.log('✅ Going to airdrop', randomAmount, 'tokens to', address)

      const airdropTarget = {
        address,
        amount: ethers.utils.parseUnits(randomAmount.toString(), 18),
      }

      return airdropTarget
    })

    console.log('🌈 Starting airdrop...')
    await tokenModule.transferBatch(airdropTargets)
    console.log('✅ Success')
  } catch (err) {
    console.error('Error airdrop', err)
  }
})()