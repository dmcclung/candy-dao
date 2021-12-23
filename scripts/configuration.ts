import dotenv from 'dotenv'
dotenv.config()

type Configuration = {
  privateKey: string,
  network: string,
  walletAddress: string,
  appAddress: string,
  tokenAddress: string,
  voteAddress: string,
}

const configuration: Configuration = {
  privateKey: process.env.PRIVATE_KEY || '',
  network: process.env.ALCHEMY_API_URL || '',
  walletAddress: process.env.WALLET_ADDRESS || '',
  appAddress: process.env.APP_ADDRESS || '',
  tokenAddress: process.env.TOKEN_ADDRESS || '',
  voteAddress: process.env.VOTE_ADDRESS || ''
}

export default configuration