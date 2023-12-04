import React, {
  ComponentPropsWithoutRef,
  Dispatch,
  ReactElement,
  SetStateAction,
  useEffect,
} from 'react'
import { useFallbackState, useReservoirClient } from '../../hooks'
import { Modal } from '../Modal'
import {
  CollectModalRenderer,
  CollectModalStepData,
  CollectModalMode,
  CollectStep,
  CollectModalContentMode,
} from './CollectModalRenderer'
import { MintContent } from './mint/MintContent'
import { SweepContent } from './sweep/SweepContent'
import { Flex, Text } from '../../primitives'
import { ReservoirWallet } from '@reservoir0x/reservoir-sdk'
import { WalletClient } from 'viem'
import { Dialog } from '../../primitives/Dialog'

export type CollectCallbackData = {
  collectionId?: string
  maker?: string
  contentMode?: CollectModalContentMode
  stepData: CollectModalStepData | null
}

export const CollectModalCopy = {
  ctaConnect: 'Connect',
  mintTitle: 'Mint',
  mintCtaClose: 'Close',
  mintCtaBuy: 'Mint',
  mintCtaBuyDisabled: 'Mint',
  mintCtaInsufficientFunds: 'Add Funds to Purchase',
  mintCtaAwaitingApproval: 'Waiting for approval...',
  mintCtaAwaitingValidation: 'Waiting to be validated...',
  mintCtaGoToToken: '',
  sweepTitle: 'Buy',
  sweepCtaClose: 'Close',
  sweepCtaBuy: 'Buy',
  sweepCtaBuyDisabled: 'Select Items to Buy',
  sweepCtaInsufficientFunds: 'Add Funds to Purchase',
  sweepCtaAwaitingApproval: 'Waiting for approval...',
  sweepCtaAwaitingValidation: 'Waiting to be validated...',
}

type Props = Pick<Parameters<typeof Modal>['0'], 'trigger'> & {
  mode?: CollectModalMode
  openState?: [boolean, Dispatch<SetStateAction<boolean>>]
  collectionId?: string
  tokenId?: string
  defaultQuantity?: number
  onConnectWallet: () => void
  feesOnTopBps?: string[] | null
  feesOnTopUsd?: string[] | null
  chainId?: number
  normalizeRoyalties?: boolean
  copyOverrides?: Partial<typeof CollectModalCopy>
  walletClient?: ReservoirWallet | WalletClient
  usePermit?: boolean
  onCollectComplete?: (data: CollectCallbackData) => void
  onCollectError?: (error: Error, data: CollectCallbackData) => void
  onClose?: (data: CollectCallbackData, currentStep: CollectStep) => void
  onGoToToken?: (data: CollectCallbackData) => any
  onPointerDownOutside?: ComponentPropsWithoutRef<
    typeof Dialog
  >['onPointerDownOutside']
}

export function CollectModal({
  mode,
  openState,
  trigger,
  collectionId,
  tokenId,
  chainId,
  feesOnTopBps,
  feesOnTopUsd,
  normalizeRoyalties,
  copyOverrides,
  walletClient,
  usePermit,
  defaultQuantity,
  onCollectComplete,
  onCollectError,
  onClose,
  onConnectWallet,
  onGoToToken,
  onPointerDownOutside,
}: Props): ReactElement {
  const copy: typeof CollectModalCopy = {
    ...CollectModalCopy,
    ...copyOverrides,
  }
  const [open, setOpen] = useFallbackState(
    openState ? openState[0] : false,
    openState
  )

  const client = useReservoirClient()

  const currentChain = client?.currentChain()

  const modalChain = chainId
    ? client?.chains.find(({ id }) => id === chainId) || currentChain
    : currentChain

  return (
    <CollectModalRenderer
      onConnectWallet={onConnectWallet}
      chainId={modalChain?.id}
      defaultQuantity={defaultQuantity}
      open={open}
      mode={mode}
      collectionId={collectionId}
      tokenId={tokenId}
      feesOnTopBps={feesOnTopBps}
      feesOnTopUsd={feesOnTopUsd}
      normalizeRoyalties={normalizeRoyalties}
      walletClient={walletClient}
      usePermit={usePermit}
    >
      {(props) => {
        const {
          contentMode,
          loading,
          collectStep,
          address,
          stepData,
          transactionError,
          collectTokens,
        } = props
        useEffect(() => {
          if (collectStep === CollectStep.Complete && onCollectComplete) {
            const data: CollectCallbackData = {
              collectionId: collectionId,
              maker: address,
              stepData,
              contentMode,
            }

            onCollectComplete(data)
          }
        }, [collectStep])

        useEffect(() => {
          if (transactionError && onCollectError) {
            const data: CollectCallbackData = {
              collectionId: collectionId,
              maker: address,
              stepData,
              contentMode,
            }
            onCollectError(transactionError, data)
          }
        }, [transactionError])

        return (
          <Modal
            trigger={trigger}
            title={contentMode === 'mint' ? copy.mintTitle : copy.sweepTitle}
            open={open}
            loading={loading}
            onPointerDownOutside={(e) => {
              const dismissableLayers = Array.from(
                document.querySelectorAll('div[data-radix-dismissable]')
              )
              const clickedDismissableLayer = dismissableLayers.some((el) =>
                e.target ? el.contains(e.target as Node) : false
              )

              if (!clickedDismissableLayer && dismissableLayers.length > 0) {
                e.preventDefault()
              }
              if (onPointerDownOutside) {
                onPointerDownOutside(e)
              }
            }}
            onOpenChange={(open) => {
              if (!open && onClose) {
                const data: CollectCallbackData = {
                  collectionId: collectionId,
                  maker: address,
                  stepData,
                  contentMode,
                }
                onClose(data, collectStep)
              }
              setOpen(open)
            }}
          >
            {!loading && contentMode === 'sweep' ? (
              <SweepContent
                {...props}
                chainId={modalChain?.id}
                collectTokens={collectTokens}
                copy={copy}
                open={open}
                setOpen={setOpen}
              />
            ) : null}

            {!loading && contentMode === 'mint' ? (
              <MintContent
                {...props}
                chainId={modalChain?.id}
                collectTokens={collectTokens}
                copy={copy}
                open={open}
                setOpen={setOpen}
                onGoToToken={onGoToToken}
              />
            ) : null}

            {!loading && contentMode === undefined ? (
              <Flex
                direction="column"
                align="center"
                css={{ py: '$6', px: '$4', gap: '$3' }}
              >
                <Text style="h6" css={{ textAlign: 'center' }}>
                  No available items were found for this collection.
                </Text>
              </Flex>
            ) : null}
          </Modal>
        )
      }}
    </CollectModalRenderer>
  )
}

CollectModal.Custom = CollectModalRenderer
