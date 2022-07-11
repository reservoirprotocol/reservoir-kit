import { useTokenDetails } from '../hooks/useTokenDetails'
import React, { FC, useEffect, useState } from 'react'
import { Modal } from './Modal'
import { TokenPrimitive } from './TokenPrimitive'
import { useEthConverter } from '../hooks/useETHConverter'
import { useCollection } from '../hooks/useCollection'
import { Flex } from '../primitives/Flex'
import { Text } from '../primitives/Text'
import FormatEth from '../primitives/FormatEth'
import { constants, utils } from 'ethers'
import Button from '../primitives/Button'

type Props = Pick<Parameters<typeof Modal>['0'], 'trigger'> & {
  tokenId?: string
  collectionId?: string
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

  if (royalty <= 0) {
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
}) => {
  const [open, setOpen] = useState(false)
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

  const totalUsd = useEthConverter(
    +utils.formatEther(totalPrice.toString()),
    'USD'
  )

  useEffect(() => {
    if (open && currentStep === BuyStep.Initial && tokenId && collectionId) {
      setTokenQuery({
        tokens: [`${collectionId}:${tokenId}`],
      })
      setCollectionQuery({ id: collectionId })
    }
  }, [currentStep, collectionId, tokenId, open])

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

  return (
    <Modal
      trigger={trigger}
      title={title}
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
              <Flex align="center" justify="between" css={{ pt: 16, px: 16 }}>
                <Text style="subtitle2">Referral Fee</Text>
                <FormatEth amount={referrerFee} />
              </Flex>
              <Flex justify="end">
                <Text style="subtitle2" css={{ color: '$slate11', pr: 16 }}>
                  {feeUsd}
                </Text>
              </Flex>
            </>
          )}
          <Flex align="center" justify="between" css={{ pt: 16, px: 16 }}>
            <Text style="h6">Total</Text>
            <FormatEth textStyle="h6" amount={totalPrice} />
          </Flex>
          <Flex justify="end">
            <Text style="subtitle2" css={{ color: '$slate11', pr: 16 }}>
              {totalUsd}
            </Text>
          </Flex>
          <Button css={{ m: 16 }} color="primary" corners="rounded">
            Checkout
          </Button>
        </Flex>
      )}
    </Modal>
  )
}
