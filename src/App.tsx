import React, { useState, useEffect } from 'react'
import { useWeb3 } from '@3rdweb/hooks'
import { ThirdwebSDK } from '@3rdweb/sdk'
import './App.css'

const sdk = new ThirdwebSDK('rinkeby')

const bundleDropModule = sdk.getBundleDropModule(
  '0x795CF1E2EB44c2F972c7FB5c15294B46903C3950',
)

function App() {
  const { connectWallet, address, provider } = useWeb3()

  const signer = provider ? provider.getSigner() : undefined

  if (!signer) {
    console.log('Signer unavailable, read-only')
  }

  useEffect(() => {
    if (signer) {
      sdk.setProviderOrSigner(signer)
    }
  }, [signer])

  if (address) {
    console.log('Connected address', address)
  }

  const [hasClaimedNFT, setHasClaimedNFT] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)

  useEffect(() => {
    if (!address) {
      return
    }

    const checkClaimedNFT = async () => {
      try {
        const balance = await bundleDropModule.balanceOf(address, '0')
        if (balance.gt(0)) {
          setHasClaimedNFT(true)
          console.log('User %s has a membership NFT', address)
        } else {
          setHasClaimedNFT(false)
          console.log('User %s does not have a membership NFT', address)
        }
      } catch (error) {
        setHasClaimedNFT(false)
        console.error('Error checking for NFT', error)
      }
    }
    checkClaimedNFT()
  }, [address])

  const mint = async () => {
    try {
      setIsClaiming(true)
      console.log('Minting')
      await bundleDropModule.claim('0', 1)
      setHasClaimedNFT(true)
      console.log('Mint successful', `https://testnets.opensea.io/assets/${bundleDropModule.address}/0`)
    } catch (err) {
      console.error(err)
    } finally {
      setIsClaiming(false)
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <div className="logo-pixel-cherry"></div>
        <p>
          Welcome to CandyDAO
        </p>
        {!address && (
          <button onClick={() => connectWallet('injected')} className="nes-btn">Connect</button>
        )}
        {address && !hasClaimedNFT && (
          <button onClick={() => mint()} className="nes-btn" disabled={isClaiming}>Mint</button>
        )}
        {address && hasClaimedNFT && (
          <p>CandyDAO Member</p>
        )}
      </header>
    </div>
  )
}

export default App
