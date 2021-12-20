import { ThirdwebSDK } from '@3rdweb/sdk'
import { readFileSync } from 'fs'
import { ethers } from 'ethers'
import configuration from './configuration'

const { privateKey, network, walletAddress } = configuration

const sdk = new ThirdwebSDK(
  new ethers.Wallet(
    privateKey,
    ethers.getDefaultProvider(network),
  ),
);

(async () => {
  try {
    const apps = await sdk.getApps()
    console.log('Your app address is:', apps[0].address)
    const app = sdk.getAppModule(apps[0].address)
    const bundleDropModule = await app.deployBundleDropModule({
      // The collection's name, ex. CryptoPunks
      name: 'CandyDAO Membership',
      // A description for the collection.
      description: 'A DAO for on-chain candy sales powered by MIM.',
      // The image for the collection that will show up on OpenSea.
      image: readFileSync('scripts/assets/cherry.png'),
      // We need to pass in the address of the person who will be receiving the proceeds from sales of nfts in the module.
      // We're planning on not charging people for the drop, so we'll pass in the 0x0 address
      // you can set this to your own wallet address if you want to charge for the drop.
      primarySaleRecipientAddress: walletAddress,
    })

    console.log(
      '✅ Successfully deployed bundleDrop module, address:',
      bundleDropModule.address,
    )
    console.log(
      '✅ bundleDrop metadata:',
      await bundleDropModule.getMetadata(),
    )

    try {
      await bundleDropModule.createBatch([
        {
          name: 'CandyDAO Cherry',
          description: 'CandyDAO members-only NFT',
          image: readFileSync('scripts/assets/cherry.png'),
        },
      ])
      console.log('✅ Successfully created a new NFT in the drop!')
    } catch (error) {
      console.error('failed to create the new NFT', error)
    }

    try {
      const claimConditionFactory = bundleDropModule.getClaimConditionFactory()
      claimConditionFactory.newClaimPhase({
        startTime: new Date(),
        maxQuantity: 50_000,
        maxQuantityPerTransaction: 1,
      })

      await bundleDropModule.setClaimCondition(0, claimConditionFactory)
      console.log('✅ Sucessfully set claim condition!')
    } catch (error) {
      console.error('Failed to set claim condition', error)
    }

  } catch (error) {
    console.log('failed to deploy bundleDrop module', error)
  }
})()