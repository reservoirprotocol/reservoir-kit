import CollectButtonRenderer, {
  Collection,
  MintStages,
  Token,
} from './CollectButtonRenderer'
import { Button, Loader } from '../../primitives'
import React, { ComponentPropsWithoutRef, ReactElement, useMemo } from 'react'
import { SWRInfiniteConfiguration } from 'swr/infinite'
import { SweepModal } from '../../modal/sweep/SweepModal'
import { CSS } from '@stitches/react'
import { MintModal } from '../../modal/mint/MintModal'
import FormatCrypto from '../../primitives/FormatCrypto'

type Props = {
  contract?: string
  collectionId?: string
  token?: string
  onConnectWallet: () => void
  optionalMintModalProps?: Omit<
    ComponentPropsWithoutRef<typeof MintModal>,
    | 'trigger'
    | 'chainId'
    | 'contract'
    | 'collectionId'
    | 'token'
    | 'onConnectWallet'
  >
  optionalSweepModalProps?: Omit<
    ComponentPropsWithoutRef<typeof SweepModal>,
    | 'trigger'
    | 'chainId'
    | 'contract'
    | 'collectionId'
    | 'token'
    | 'onConnectWallet'
  >
  customTriggerRenderer?: (
    loading: boolean,
    publicMintData?: MintStages[0],
    mintData?: MintStages,
    collection?: Collection,
    tokenData?: Token
  ) => ReactElement
  triggerCss?: CSS
  swrOptions?: SWRInfiniteConfiguration
  chainId?: number
}

export function CollectButton({
  token,
  contract,
  collectionId,
  onConnectWallet,
  optionalMintModalProps,
  optionalSweepModalProps,
  customTriggerRenderer,
  triggerCss,
  swrOptions,
  chainId,
}: Props): ReactElement {
  return (
    <CollectButtonRenderer
      token={token}
      contract={contract}
      collectionId={collectionId}
      swrOptions={swrOptions}
      chainId={chainId}
    >
      {({ loading, tokenData, publicMintData, mintStages, collection }) => {
        const mintPriceDecimal = publicMintData?.price?.amount?.decimal
        const mintCurrency =
          publicMintData?.price?.currency?.symbol?.toUpperCase()

        const mintPrice =
          typeof mintPriceDecimal === 'number' &&
          mintPriceDecimal !== null &&
          mintPriceDecimal !== undefined
            ? mintPriceDecimal === 0
              ? 'Free'
              : `${mintPriceDecimal} ${mintCurrency}`
            : undefined

        const sweepPriceData = tokenData
          ? tokenData?.market?.floorAsk?.price
          : collection?.floorAsk?.price

        const sweepSymbol = sweepPriceData?.currency?.symbol
        const sweepPriceRaw = sweepPriceData?.amount?.raw

        const trigger = useMemo(() => {
          if (customTriggerRenderer) {
            return customTriggerRenderer(
              loading,
              publicMintData,
              mintStages,
              collection,
              tokenData
            )
          } else if (loading) {
            return (
              <Button css={{ ...triggerCss }}>
                <Loader />
              </Button>
            )
          } else if (publicMintData && mintPrice) {
            return <Button css={{ ...triggerCss }}>Mint {mintPrice}</Button>
          } else if (sweepPriceRaw) {
            return (
              <Button css={{ ...triggerCss }}>
                Collect{' '}
                <FormatCrypto
                  amount={sweepPriceRaw}
                  decimals={sweepPriceData?.currency?.decimals}
                  maximumFractionDigits={4}
                  textStyle="h6"
                  css={{ color: '$buttonTextColor' }}
                />
                {sweepSymbol}
              </Button>
            )
          } else {
            return null
          }
        }, [
          customTriggerRenderer,
          loading,
          tokenData,
          publicMintData,
          mintStages,
          collection,
        ])

        if (publicMintData && mintPrice) {
          return (
            <MintModal
              trigger={trigger}
              chainId={chainId}
              collectionId={collectionId}
              contract={contract}
              token={token}
              onConnectWallet={onConnectWallet}
              {...optionalMintModalProps}
            />
          )
        } else if (sweepPriceRaw) {
          return (
            <SweepModal
              trigger={trigger}
              chainId={chainId}
              collectionId={collectionId}
              contract={contract}
              token={token}
              onConnectWallet={onConnectWallet}
              {...optionalSweepModalProps}
            />
          )
        } else {
          return trigger
        }
      }}
    </CollectButtonRenderer>
  )
}

CollectButton.Custom = CollectButtonRenderer
