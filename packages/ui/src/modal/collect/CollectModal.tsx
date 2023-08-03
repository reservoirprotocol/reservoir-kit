import React, { Dispatch, ReactElement, SetStateAction, useEffect } from 'react'
import { useFallbackState } from '../../hooks'
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

type CollectCallbackData = {
  collectionId?: string
  maker?: string
  contentMode?: CollectModalContentMode
  stepData: CollectModalStepData | null
}

export const CollectModalCopy = {
  mintTitle: 'Mint',
  mintCtaClose: 'Close',
  mintCtaBuy: 'Mint',
  mintCtaBuyDisabled: 'Mint',
  mintCtaInsufficientFunds: 'Add Funds to Purchase',
  mintCtaAwaitingApproval: 'Waiting for approval...',
  mintCtaAwaitingValidation: 'Waiting to be validated...',
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
  feesOnTopBps?: string[] | null
  feesOnTopUsd?: string[] | null
  normalizeRoyalties?: boolean
  copyOverrides?: Partial<typeof CollectModalCopy>
  onCollectComplete?: (data: CollectCallbackData) => void
  onCollectError?: (error: Error, data: CollectCallbackData) => void
  onClose?: (data: CollectCallbackData, currentStep: CollectStep) => void
}

export function CollectModal({
  mode,
  openState,
  trigger,
  collectionId,
  tokenId,
  feesOnTopBps,
  feesOnTopUsd,
  normalizeRoyalties,
  copyOverrides,
  onCollectComplete,
  onCollectError,
  onClose,
}: Props): ReactElement {
  const copy: typeof CollectModalCopy = {
    ...CollectModalCopy,
    ...copyOverrides,
  }
  const [open, setOpen] = useFallbackState(
    openState ? openState[0] : false,
    openState
  )

  return (
    <CollectModalRenderer
      open={open}
      mode={mode}
      collectionId={collectionId}
      tokenId={tokenId}
      feesOnTopBps={feesOnTopBps}
      feesOnTopUsd={feesOnTopUsd}
      normalizeRoyalties={normalizeRoyalties}
    >
      {(props) => {
        const {
          contentMode,
          loading,
          collectStep,
          address,
          stepData,
          transactionError,
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
                copy={copy}
                open={open}
                setOpen={setOpen}
              />
            ) : null}

            {!loading && contentMode === 'mint' ? (
              <MintContent
                {...props}
                copy={copy}
                open={open}
                setOpen={setOpen}
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
