import { ethers } from 'ethers'
import sdk from './getSdk'
import configuration from './configuration'

const { tokenAddress } = configuration

const tokenModule = sdk.getTokenModule(
  tokenAddress,
);

(async () => {
  try {
    const amount = 1000000
    const amountWith18Decimals = ethers.utils.parseUnits(amount.toString(), 18)
    await tokenModule.mint(amountWith18Decimals)

    const totalSupply = await tokenModule.totalSupply()
    console.log(
      '✅ Total supply of $CANDY',
      ethers.utils.formatUnits(totalSupply, 18)
    )
  } catch (error) {
    console.error('Failed to set total supply', error)
  }
})()