import React, { FC, useEffect, useState } from 'react'
import { Modal } from './Modal'
import { TokenPrimitive } from './TokenPrimitive'

type Props = Pick<Parameters<typeof Modal>['0'], 'trigger'>

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
    case BuyStep.InsufficientBalance:
      return 'Complete Checkout'
    case BuyStep.Initial:
      return 'Complete Checkout'
    case BuyStep.AddFunds:
      return 'Add Funds'
    case BuyStep.Unavailable:
      return 'Selected item is no longer available'
    default:
      return 'Complete Checkout'
  }
}

export const BuyModal: FC<Props> = ({ trigger }) => {
  const [currentStep, setCurrentStep] = useState<BuyStep>(BuyStep.Initial)
  const [title, setTitle] = useState(titleForStep(BuyStep.Initial))

  useEffect(() => {}, [])

  useEffect(() => {
    setTitle(titleForStep(currentStep))
  }, [currentStep])

  return (
    <Modal
      trigger={trigger}
      title={title}
      onOpenChange={(open) => {
        if (!open) {
          setCurrentStep(BuyStep.Initial)
        }
      }}
    >
      <TokenPrimitive
        img="https://lh3.googleusercontent.com/PzJGhIVImcDq79IJZmgAYgGXTX78jIM1dTdXqLmyD-FWDFrg-CIjzWbiPiAZHEdssS_XiwOj9silSxnvuYtX9GKNxMP28coj7v_Q=w533"
        name="#9854"
        price={24.3458982734}
        usdPrice={44000}
        collection="MoonBirds"
        royalty={10}
        source="https://lh3.googleusercontent.com/PzJGhIVImcDq79IJZmgAYgGXTX78jIM1dTdXqLmyD-FWDFrg-CIjzWbiPiAZHEdssS_XiwOj9silSxnvuYtX9GKNxMP28coj7v_Q=w533"
      />
    </Modal>
  )
}
