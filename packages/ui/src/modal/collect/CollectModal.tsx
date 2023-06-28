import React, { Dispatch, ReactElement, SetStateAction, useEffect } from 'react'
import { useFallbackState } from '../../hooks'
import { Modal } from '../Modal'
import {
  CollectModalRenderer,
  CollectModalStepData,
  CollectMode,
  CollectStep,
} from './CollectModalRenderer'
import { MintContent } from './mint/MintContent'

type CollectCallbackData = {
  collectionId?: string
  maker?: string
  stepData: CollectModalStepData | null
}

export const CollectModalCopy = {
  mintTitle: 'Buy',
  mintCtaClose: 'Close',
  mintCtaBuy: 'Buy',
  mintCtaBuyDisabled: 'Select Items to Buy',
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
  mode?: CollectMode
  openState?: [boolean, Dispatch<SetStateAction<boolean>>]
  collectionId?: string
  feesOnTopBps?: string[] | null
  feesOnTopFixed?: string[] | null
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
  feesOnTopBps,
  feesOnTopFixed,
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
      feesOnTopBps={feesOnTopBps}
      feesOnTopFixed={feesOnTopFixed}
      normalizeRoyalties={normalizeRoyalties}
    >
      {(props) => {
        const {
          mode,
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
            }
            onCollectError(transactionError, data)
          }
        }, [transactionError])

        return (
          <Modal
            trigger={trigger}
            title={mode === 'mint' ? copy.mintTitle : copy.sweepTitle}
            open={open}
            loading={loading}
            onOpenChange={(open) => {
              if (!open && onClose) {
                const data: CollectCallbackData = {
                  collectionId: collectionId,
                  maker: address,
                  stepData,
                }
                onClose(data, collectStep)
              }
              setOpen(open)
            }}
          >
            {mode === 'sweep'}

            {mode === 'mint' ? (
              <MintContent
                {...props}
                copy={copy}
                open={open}
                setOpen={setOpen}
              />
            ) : null}
          </Modal>
        )
      }}
    </CollectModalRenderer>
  )
}

CollectModal.Custom = CollectModalRenderer
