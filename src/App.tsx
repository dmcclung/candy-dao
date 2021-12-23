import React, { useState, useEffect, useMemo } from 'react'
import { useWeb3 } from '@3rdweb/hooks'
import { ThirdwebSDK, Proposal } from '@3rdweb/sdk'
import { ethers } from 'ethers'
import './App.css'

const sdk = new ThirdwebSDK('rinkeby')

const bundleDropModule = sdk.getBundleDropModule(
  '0x795CF1E2EB44c2F972c7FB5c15294B46903C3950'
)

const tokenModule = sdk.getTokenModule(
  '0xAc1F8587CC41C50905E1F0fF4FF63b0b33de26fa'
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

  // Holds the amount of token each member has in state.
  const [memberTokenAmounts, setMemberTokenAmounts] = useState<Record<string, ethers.BigNumber>>({})
  // The array holding all of our members addresses.
  const [memberAddresses, setMemberAddresses] = useState<string[]>([])

  // This useEffect grabs all our the addresses of our members holding our NFT.
  useEffect(() => {
    if (!hasClaimedNFT) {
      return
    }

    const getMemberAddresses = async () => {
      try {
        const addresses: string[] = await bundleDropModule.getAllClaimerAddresses('0')
        console.log('Members addresses', addresses)
        setMemberAddresses(addresses)
      } catch (err) {
        console.error('Get member addresses', err)
      }
    }

    getMemberAddresses()
  }, [hasClaimedNFT])

  useEffect(() => {
    if (!hasClaimedNFT) {
      return
    }

    const getHolderBalances = async () => {
      try {
        const amounts = await tokenModule.getAllHolderBalances()
        console.log('Amounts', amounts)
        setMemberTokenAmounts(amounts)
      } catch (err) {
        console.error('Get token balances', err)
      }
    }

    getHolderBalances()
  }, [hasClaimedNFT])

  // Now, we combine the memberAddresses and memberTokenAmounts into a single array
  const memberList = useMemo(() => {
    return memberAddresses.map((addr) => {
      return {
        addr,
        tokenAmount: ethers.utils.formatUnits(
          memberTokenAmounts[addr] || 0,
          18,
        ),
      }
    })
  }, [memberAddresses, memberTokenAmounts])

  const shortenAddress = (addr: string) => {
    return addr.substring(0, 6) + '...' + addr.substring(addr.length - 4)
  }

  const voteModule = sdk.getVoteModule('0xC03439ACf9aC6f16733d54c6B07dC5fD57C8dfD1')
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [isVoting, setIsVoting] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)

  // Retreive all our existing proposals from the contract.
  useEffect(() => {
    if (!hasClaimedNFT) {
      return
    }
    // A simple call to voteModule.getAll() to grab the proposals.
    const getAllProposals = async () => {
      const allProposals = await voteModule.getAll()
      setProposals(allProposals)
    }

    getAllProposals()
  }, [hasClaimedNFT, voteModule])

  // We also need to check if the user already voted.
  useEffect(() => {
    if (!hasClaimedNFT) {
      return
    }

    // If we haven't finished retreieving the proposals from the useEffect above
    // then we can't check if the user voted yet!
    if (!proposals.length) {
      return
    }

    // Check if the user has already voted on the first proposal.
    const checkVoted = async () => {
      setHasVoted(await voteModule.hasVoted(proposals[0].proposalId, address))
    }
    checkVoted()
  }, [hasClaimedNFT, proposals, address, voteModule])

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
          <div>
            <h2>Member List</h2>
            <table className="card">
              <thead>
                <tr>
                  <th>Address</th>
                  <th>Token Amount</th>
                </tr>
              </thead>
              <tbody>
                {memberList.map((member) => {
                  return (
                    <tr key={member.addr}>
                      <td>{shortenAddress(member.addr)}</td>
                      <td>{member.tokenAmount}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <div>
              <h2>Active Proposals</h2>
              <form onSubmit={async (e) => {
                  e.preventDefault()
                  e.stopPropagation()

                  setIsVoting(true)

                  const votes = proposals.map((proposal) => {
                    const voteResult = {
                      proposalId: proposal.proposalId,
                      vote: 2,
                    }
                    proposal.votes.forEach((vote) => {
                      const elem = document.getElementById(
                        proposal.proposalId + '-' + vote.type
                      ) as HTMLInputElement

                      if (elem && elem.checked) {
                        voteResult.vote = vote.type
                        return
                      }
                    })
                    return voteResult
                  })

                  try {
                    const delegation = await tokenModule.getDelegationOf(address)
                    if (delegation === ethers.constants.AddressZero) {
                      await tokenModule.delegateTo(address)
                    }

                    try {
                      await Promise.all(
                        votes.map(async (vote) => {
                          // before voting we first need to check whether the proposal is open for voting
                          // we first need to get the latest state of the proposal
                          const proposal = await voteModule.get(vote.proposalId)
                          // then we check if the proposal is open for voting (state === 1 means it is open)
                          if (proposal.state === 1) {
                            // if it is open for voting, we'll vote on it
                            return voteModule.vote(vote.proposalId, vote.vote)
                          }
                          // if the proposal is not open for voting we just return nothing, letting us continue
                          return
                        })
                      )
                      try {
                        // if any of the propsals are ready to be executed we'll need to execute them
                        // a proposal is ready to be executed if it is in state 4
                        await Promise.all(
                          votes.map(async (vote) => {
                            // we'll first get the latest state of the proposal again, since we may have just voted before
                            const proposal = await voteModule.get(
                              vote.proposalId
                            )

                            if (proposal.state === 4) {
                              return voteModule.execute(vote.proposalId)
                            }
                          })
                        )
                        // if we get here that means we successfully voted, so let's set the "hasVoted" state to true
                        setHasVoted(true)
                        // and log out a success message
                        console.log('successfully voted')
                      } catch (err) {
                        console.error('failed to execute votes', err)
                      }
                    } catch (err) {
                      console.error('failed to vote', err)
                    }
                  } catch (err) {
                    console.error('failed to delegate tokens')
                  } finally {
                    // in *either* case we need to set the isVoting state to false to enable the button again
                    setIsVoting(false)
                  }
                }}
              >
                {proposals.map((proposal, index) => (
                  <div key={proposal.proposalId} className="card">
                    <h5>{proposal.description}</h5>
                    <div>
                      {proposal.votes.map((vote) => (
                        <div key={vote.type}>
                          <input
                            type="radio"
                            id={proposal.proposalId + '-' + vote.type}
                            name={proposal.proposalId}
                            value={vote.type}
                            defaultChecked={vote.type === 2}
                          />
                          <label htmlFor={proposal.proposalId + '-' + vote.type}>
                            {vote.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <button disabled={isVoting || hasVoted} type="submit">
                  {isVoting
                    ? 'Voting...'
                    : hasVoted
                      ? 'You Already Voted'
                      : 'Submit Votes'}
                </button>
                <small>
                  This will trigger multiple transactions that you will need to
                  sign.
                </small>
              </form>
            </div>
          </div>
        )}
      </header>
    </div>
  )
}

export default App
