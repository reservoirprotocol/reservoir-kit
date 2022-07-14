import React, { FC, useEffect, useState } from 'react'
import { Modal } from '../Modal'
import { TokenPrimitive } from '../TokenPrimitive'
import {
  useCollection,
  useTokenDetails,
  useEthConverter,
  useCoreSdk,
} from '../../hooks'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCopy } from '@fortawesome/free-solid-svg-icons'
import {
  Flex,
  Box,
  Text,
  Input,
  Anchor,
  Button,
  FormatEth,
} from '../../primitives'

import Popover from '../../primitives/Popover'
import { Signer, utils } from 'ethers'

import addFundsImage from 'data-url:../../../assets/transferFunds.png'
import { formatEther } from 'ethers/lib/utils'
import { getSignerDetails, SignerDetails } from '../../lib/signer'
// import { Progress } from './Progress'

type Props = Pick<Parameters<typeof Modal>['0'], 'trigger'> & {
  tokenId?: string
  collectionId?: string
  signer: Signer
} & (
    | {
        referrerFeeBps: number
        referrer: string
      }
    | {
        referrerFeeBps?: undefined
        referrer?: undefined
      }
  )

export enum BuyStep {
  Checkout,
  Confirming,
  Finalizing,
  AddFunds,
  Complete,
}

function titleForStep(step: BuyStep, available: boolean) {
  if (!available) {
    return 'Selected item is no longer Available'
  }

  switch (step) {
    case BuyStep.AddFunds:
      return 'Add Funds'
    default:
      return 'Complete Checkout'
  }
}

type TokenLineItemProps = {
  token: NonNullable<
    NonNullable<ReturnType<typeof useTokenDetails>>['tokens']
  >['0']
  collection: ReturnType<typeof useCollection>
}

const TokenLineItem: FC<TokenLineItemProps> = ({ token, collection }) => {
  const tokenDetails = token.token
  const marketData = token.market
  const usdPrice = useEthConverter(marketData?.floorAsk?.price || 0, 'USD') || 0

  if (!tokenDetails || !marketData?.floorAsk?.price) {
    return null
  }
  const name = tokenDetails?.name || `#${tokenDetails.tokenId}`
  const img = tokenDetails.image
    ? tokenDetails.image
    : (collection?.metadata?.imageUrl as string)
  const srcImg = marketData?.floorAsk?.source
    ? (marketData?.floorAsk?.source['icon'] as string)
    : ''
  const royalty: number | undefined = collection?.royalties?.bps || undefined

  return (
    <TokenPrimitive
      img={img}
      name={name}
      price={marketData.floorAsk.price}
      usdPrice={usdPrice}
      collection={collection?.name || ''}
      royalty={royalty}
      source={srcImg}
    />
  )
}

export const BuyModal: FC<Props> = ({
  trigger,
  tokenId,
  collectionId,
  referrer,
  referrerFeeBps,
  signer,
}) => {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [totalPrice, setTotalPrice] = useState(0)
  const [referrerFee, setReferrerFee] = useState(0)
  const [buyStep, setBuyStep] = useState<BuyStep>(BuyStep.Checkout)
  const [_transactionError, setTransactionError] = useState<Error | null>()
  const [hasEnoughEth, setHasEnoughEth] = useState(true)
  const [tokenQuery, setTokenQuery] =
    useState<Parameters<typeof useTokenDetails>['0']>()
  const [collectionQuery, setCollectionQuery] =
    useState<Parameters<typeof useCollection>['0']>()

  const [signerDetails, setSignerDetails] = useState<SignerDetails>({})

  const tokenDetails = useTokenDetails(tokenQuery)
  const collection = useCollection(collectionQuery)
  const feeUsd = useEthConverter(referrerFee, 'USD')
  const totalUsd = useEthConverter(totalPrice, 'USD')

  const sdk = useCoreSdk()
  const isAvailable = tokenDetails?.tokens
    ? tokenDetails?.tokens[0].market?.floorAsk?.price != null
    : false
  const title = titleForStep(buyStep, isAvailable)
  // const transactionButtonText = TransactionStep.Confirming
  //   ? 'Waiting for Approval...'
  //   : 'Waiting for Transaction to be Validated'

  useEffect(() => {
    if (open && tokenId && collectionId) {
      setTokenQuery({
        tokens: [`${collectionId}:${tokenId}`],
      })
      setCollectionQuery({ id: collectionId })
    }
  }, [open, collectionId, tokenId])

  useEffect(() => {
    if (tokenDetails?.tokens) {
      if (tokenDetails?.tokens[0].market?.floorAsk?.price) {
        let floorPrice = tokenDetails?.tokens[0].market.floorAsk.price

        if (referrerFeeBps) {
          const fee = (referrerFeeBps / 10000) * floorPrice

          floorPrice = floorPrice + fee
          setReferrerFee(fee)
        }
        setTotalPrice(floorPrice)
      } else {
        setTotalPrice(0) //todo fetch last sold price
      }
    }
  }, [tokenDetails, referrerFeeBps])

  useEffect(() => {
    if (signer && open) {
      getSignerDetails(signer, { address: true, balance: true }).then(
        (details) => {
          setSignerDetails(details)
        }
      )
    }
  }, [open, signer])

  useEffect(() => {
    if (
      signerDetails.balance &&
      signerDetails.balance.lt(utils.parseEther(`${totalPrice}`))
    ) {
      setHasEnoughEth(false)
    }
  }, [totalPrice, signerDetails])

  const copyToClipboard = (content?: string | null) => {
    navigator.clipboard.writeText(content ? content : '')
    if (!copied) {
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
      }, 1000)
    }
  }

  return (
    <Modal
      trigger={trigger}
      title={title}
      onBack={
        buyStep == BuyStep.AddFunds
          ? () => {
              setBuyStep(BuyStep.Checkout)
            }
          : null
      }
      onOpenChange={(open) => {
        if (!open) {
          setBuyStep(BuyStep.Checkout)
        }
        setOpen(open)
      }}
      loading={!tokenDetails}
    >
      {buyStep === BuyStep.Checkout && tokenDetails?.tokens && (
        <Flex direction="column">
          <TokenLineItem
            token={tokenDetails.tokens['0']}
            collection={collection}
          />
          {referrerFeeBps && (
            <>
              <Flex
                align="center"
                justify="between"
                css={{ pt: '$4', px: '$4' }}
              >
                <Text style="subtitle2">Referral Fee</Text>
                <FormatEth amount={referrerFee} />
              </Flex>
              <Flex justify="end">
                <Text
                  style="subtitle2"
                  css={{ color: '$neutralText', pr: '$4' }}
                >
                  {feeUsd}
                </Text>
              </Flex>
            </>
          )}

          <Flex align="center" justify="between" css={{ pt: '$4', px: '$4' }}>
            <Text style="h6">Total</Text>
            <FormatEth textStyle="h6" amount={totalPrice} />
          </Flex>
          <Flex justify="end">
            <Text style="subtitle2" css={{ color: '$neutralText', mr: '$4' }}>
              {totalUsd}
            </Text>
          </Flex>

          {/* <Progress transactionStep={currentTransactionStep} /> */}
          {/* <Button disabled={true} css={{ width: '100%' }}>
                <Loader />
                {transactionButtonText}
              </Button> */}

          <Box css={{ p: '$4', width: '100%' }}>
            {hasEnoughEth ? (
              <Button
                onClick={() => {
                  if (!tokenId || !collectionId) {
                    throw 'Missing tokenId or collectionId'
                  }

                  if (!sdk) {
                    throw 'ReservoirSdk was not initialized'
                  }

                  sdk.actions
                    .buyToken({
                      expectedPrice: totalPrice,
                      signer,
                      tokens: [
                        {
                          tokenId: tokenId,
                          contract: collectionId,
                        },
                      ],
                      onProgress: (steps) => {
                        if (!steps) {
                          return
                        }

                        const currentStep = steps.find(
                          (step) => step.status === 'incomplete'
                        )

                        if (currentStep) {
                          if (currentStep.txHash) {
                            setBuyStep(BuyStep.Finalizing)
                          } else {
                            setBuyStep(BuyStep.Confirming)
                          }
                        } else if (
                          steps.every((step) => step.status === 'complete')
                        ) {
                          setBuyStep(BuyStep.Complete)
                        }
                      },
                      options: {
                        referrer: referrer,
                        referrerFeeBps: referrerFeeBps,
                      },
                    })
                    .catch((error) => {
                      if (error?.message.includes('ETH balance')) {
                        setHasEnoughEth(false)
                        getSignerDetails(signer, {
                          address: true,
                          balance: true,
                        }).then((details) => {
                          setSignerDetails(details)
                        })
                      } else {
                        const transactionError = new Error(
                          error?.message || '',
                          {
                            cause: error,
                          }
                        )
                        setTransactionError(transactionError)
                      }
                      setBuyStep(BuyStep.Checkout)
                      console.log(error)
                    })
                }}
                css={{ width: '100%' }}
                color="primary"
              >
                Checkout
              </Button>
            ) : (
              <Flex direction="column" align="center">
                <Flex align="center" css={{ mb: '$3' }}>
                  <Text css={{ mr: '$3', color: '$errorAccent' }} style="body2">
                    Insufficient Balance
                  </Text>

                  <FormatEth
                    amount={signerDetails?.balance}
                    textStyle="body2"
                  />
                </Flex>

                <Button
                  onClick={() => {
                    setBuyStep(BuyStep.AddFunds)
                  }}
                  css={{ width: '100%' }}
                >
                  Add Funds
                </Button>
              </Flex>
            )}
          </Box>
        </Flex>
      )}

      {buyStep === BuyStep.AddFunds && tokenDetails?.tokens && (
        <Flex direction="column">
          <Flex
            css={{
              p: '$4',
              py: '$5',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <img src={addFundsImage} style={{ height: 100, width: 100 }} />
            <Text style="subtitle1" css={{ my: 24 }}>
              Transfer funds from an{' '}
              <Popover
                content={
                  <Text style={'body2'}>
                    An exchange allows users to buy, sell and trade
                    cryptocurrencies. Popular exchanges include{' '}
                    <Anchor
                      css={{ fontSize: 12 }}
                      href="https://coinbase.com"
                      target="_blank"
                      color="primary"
                    >
                      Coinbase
                    </Anchor>
                    ,{' '}
                    <Anchor
                      css={{ fontSize: 12 }}
                      href="https://crypto.com"
                      target="_blank"
                      color="primary"
                    >
                      Crypto.com
                    </Anchor>{' '}
                    and many others.
                  </Text>
                }
              >
                <Text as="span" css={{ color: '$accentText' }}>
                  exchange{' '}
                </Text>
              </Popover>{' '}
              or another wallet to your wallet address below:
            </Text>
            <Box css={{ width: '100%', position: 'relative' }}>
              <Flex
                css={{
                  pointerEvents: 'none',
                  opacity: copied ? 1 : 0,
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 8,
                  transition: 'all 200ms ease-in-out',
                  pl: '$4',
                  alignItems: 'center',
                  zIndex: 3,
                  textAlign: 'left',
                  background: '$neutralBg',
                }}
              >
                <Text style={'body1'}>Copied Address!</Text>
              </Flex>
              <Input
                readOnly
                onClick={() => copyToClipboard(signerDetails?.address)}
                value={signerDetails?.address || ''}
                css={{
                  color: '$neutralText',
                  //background: '$gray5',
                  textAlign: 'left',
                }}
              />
              <Box
                css={{
                  position: 'absolute',
                  right: '$3',
                  top: '50%',
                  touchEvents: 'none',
                  transform: 'translateY(-50%)',
                  color: '$neutralText',
                }}
              >
                <FontAwesomeIcon icon={faCopy} width={16} height={16} />
              </Box>
            </Box>
          </Flex>
          <Button
            css={{ m: '$4' }}
            color="primary"
            onClick={() => copyToClipboard(signerDetails?.address)}
          >
            Copy Wallet Address
          </Button>
        </Flex>
      )}
    </Modal>
  )
}
