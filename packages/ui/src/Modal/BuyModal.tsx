import React, { FC, useEffect, useState } from 'react'
import { Modal } from './Modal'
import { TokenPrimitive } from './TokenPrimitive'
import {
  useCollection,
  useTokenDetails,
  useEthConverter,
  useCoreSdk,
} from '../hooks'

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
} from '../primitives'

import Popover from '../primitives/Popover'
import { constants, Signer, utils } from 'ethers'

import addFundsImage from 'data-url:../../assets/transferFunds.png'
import { formatEther } from 'ethers/lib/utils'

type Props = Pick<Parameters<typeof Modal>['0'], 'trigger'> & {
  tokenId?: string
  collectionId?: string
  signer: Signer
} & (
    | {
        referrerFee: number
        referrer: string
      }
    | {
        referrerFee?: undefined
        referrer?: undefined
      }
  )

enum BuyStep {
  Initial,
  Confirmation,
  Finalizing,
  InsufficientBalance,
  AddFunds,
  Error,
  Unavailable,
  Complete,
}

function titleForStep(step: BuyStep) {
  switch (step) {
    case BuyStep.AddFunds:
      return 'Add Funds'
    case BuyStep.Unavailable:
      return 'Selected item is no longer available'
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
    : tokenDetails.collection?.image
  const srcImg = marketData?.floorAsk?.source
    ? (marketData?.floorAsk?.source['icon'] as string)
    : ''
  let royalty: number | undefined = collection?.royalties?.bps || 0

  if (royalty && royalty <= 0) {
    royalty = undefined
  }

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
  referrerFee,
  signer,
}) => {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [totalPrice, setTotalPrice] = useState(constants.Zero)
  const [currentStep, setCurrentStep] = useState<BuyStep>(BuyStep.Initial)
  const title = titleForStep(currentStep)
  const [tokenQuery, setTokenQuery] =
    useState<Parameters<typeof useTokenDetails>['0']>()
  const [collectionQuery, setCollectionQuery] =
    useState<Parameters<typeof useCollection>['0']>()

  const tokenDetails = useTokenDetails(tokenQuery)
  const collection = useCollection(collectionQuery)
  const feeUsd = referrerFee ? useEthConverter(referrerFee, 'USD') : 0
  const address: string = '0x9E9EF0B615d4aF21C01121273498Ad5DEB5A3785'

  const totalUsd = useEthConverter(
    +utils.formatEther(totalPrice.toString()),
    'USD'
  )
  const sdk = useCoreSdk()

  useEffect(() => {
    if (open && tokenId && collectionId) {
      setTokenQuery({
        tokens: [`${collectionId}:${tokenId}`],
      })
      setCollectionQuery({ id: collectionId })
    }
  }, [open, collectionId, tokenId])

  useEffect(() => {
    if (
      tokenDetails?.tokens &&
      tokenDetails?.tokens[0].market?.floorAsk?.price
    ) {
      let price = utils.parseEther(
        `${tokenDetails?.tokens[0].market.floorAsk.price}`
      )

      if (referrerFee) {
        price = price.add(utils.parseEther(`${referrerFee}`))
      }
      setTotalPrice(price)
    }
  }, [tokenDetails, referrerFee])

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content)
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
        currentStep == BuyStep.AddFunds
          ? () => {
              setCurrentStep(BuyStep.Initial)
            }
          : null
      }
      onOpenChange={(open) => {
        if (!open) {
          setCurrentStep(BuyStep.Initial)
        }
        setOpen(open)
      }}
    >
      {currentStep === BuyStep.Initial && tokenDetails?.tokens && (
        <Flex css={{ backgroundColor: '$slate3' }} direction="column">
          <TokenLineItem
            token={tokenDetails.tokens['0']}
            collection={collection}
          />
          {referrerFee && (
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
                <Text style="subtitle2" css={{ color: '$slate11', pr: '$4' }}>
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
            <Text style="subtitle2" css={{ color: '$slate11', mr: '$4' }}>
              {totalUsd}
            </Text>
          </Flex>
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
                  expectedPrice: Number(formatEther(totalPrice)),
                  signer,
                  tokens: [
                    {
                      tokenId: tokenId,
                      contract: collectionId,
                    },
                  ],
                  onProgress: (steps) => {
                    console.log(steps)
                  },
                  options: {
                    referrer: referrer,
                    referrerFeeBps: referrerFee,
                  },
                })
                .catch((error) => {
                  if (error?.message.includes('ETH balance')) {
                    setCurrentStep(BuyStep.InsufficientBalance)
                    return
                  }
                  console.log(error)
                })
            }}
            css={{ m: '$4' }}
            color="primary"
            corners="rounded"
          >
            Checkout
          </Button>
        </Flex>
      )}

      {currentStep === BuyStep.InsufficientBalance && (
        <div>Insufficient Balance</div>
      )}

      {currentStep === BuyStep.AddFunds && tokenDetails?.tokens && (
        <Flex css={{ backgroundColor: '$slate3' }} direction="column">
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
                      href="https://coinbase.com"
                      target="_blank"
                      color="primary"
                    >
                      Coinbase
                    </Anchor>
                    ,{' '}
                    <Anchor
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
                <Text as="span" css={{ color: '$indigo11' }}>
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

                  background: '$slate6',
                }}
              >
                <Text style={'body1'}>Copied Address!</Text>
              </Flex>
              <Input
                readOnly
                onClick={() => copyToClipboard(address)}
                value={address}
                css={{
                  color: '$slate11',
                  background: '$slate5',
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
                  color: '$slate11',
                }}
              >
                <FontAwesomeIcon icon={faCopy} width={16} height={16} />
              </Box>
            </Box>
          </Flex>
          <Button
            css={{ m: '$4' }}
            color="primary"
            corners="rounded"
            onClick={() => copyToClipboard(address)}
          >
            Copy Wallet Address
          </Button>
        </Flex>
      )}
    </Modal>
  )
}
