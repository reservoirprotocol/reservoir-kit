import React, { FC } from 'react'
import { Flex, Button } from '../../primitives'
import PseudoInput from '../../primitives/PseudoInput'
import { styled } from '../../../stitches.config'

type Props = {
  max: number
  min: number
  quantity: number
  increment: () => void
  decrement: () => void
  setQuantity: () => void
}

const QuantityInput = styled('input', {
  border: 0,
  background: 'none',
  fontSize: 16,
  color: '$textColor',
})

const QuantitySelector: FC<Props> = ({
  max,
  min,
  quantity,
  increment,
  decrement,
  setQuantity,
}) => {
  return (
    <PseudoInput
      css={{
        gap: '$1',
        direction: 'column',
        display: 'flex',
        p: 0,
      }}
    >
      <Button color="ghost">-</Button>
      <QuantityInput />
      <Button color="ghost">+</Button>
    </PseudoInput>
  )
}

export default QuantitySelector
