import React from 'react'
import { useWeb3 } from '@3rdweb/hooks'
import './App.css'

function App() {
  const { connectWallet, address } = useWeb3()

  if (address) {
    console.log('Connected address', address)
  }

  return (
    <div className="App">
      <header className="App-header">
        <div className="logo-pixel-cherry"></div>
        <p>
          Welcome to CandyDAO
        </p>
        {!address && (
          <button onClick={() => connectWallet('injected')}>Connect</button>
        )}
        {address && (
          <h1>connected</h1>
        )}
      </header>
    </div>
  )
}

export default App
