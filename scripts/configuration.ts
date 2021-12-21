import dotenv from 'dotenv'
dotenv.config()

if (!process.env.PRIVATE_KEY || process.env.PRIVATE_KEY === '') {
  console.error('Private key not found')
  process.exit(1)
}

if (!process.env.ALCHEMY_API_URL || process.env.ALCHEMY_API_URL === '') {
  console.error('Alchemy API URL not found')
  process.exit(1)
}

if (!process.env.WALLET_ADDRESS || process.env.WALLET_ADDRESS === '') {
  console.error('Wallet address not found')
  process.exit(1)
}

if (!process.env.APP_ADDRESS || process.env.APP_ADDRESS === '') {
  console.error('App address not found')
  process.exit(1)
}

if (!process.env.TOKEN_ADDRESS || process.env.TOKEN_ADDRESS === '') {
  console.error('Token address not found')
  process.exit(1)
}

const configuration = {
  privateKey: process.env.PRIVATE_KEY,
  network: process.env.ALCHEMY_API_URL,
  walletAddress: process.env.WALLET_ADDRESS,
  appAddress: process.env.APP_ADDRESS,
  tokenAddress: process.env.TOKEN_ADDRESS
}

export default configuration