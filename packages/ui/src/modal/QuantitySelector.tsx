import React, { CSSProperties, FC } from 'react'
import { Button } from '../primitives'
import PseudoInput from '../primitives/PseudoInput'
import { styled } from '../../stitches.config'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons'

type Props = {
  max: number
  min: number
  quantity: number
  setQuantity: (quantity: number) => void
  css?: CSSProperties
}

const QuantityButton = styled(Button, {
  color: '$neutralSolid',
  backgroundColor: 'transparent',
  '&:disabled': {
    backgroundColor: '$transparent',
    color: '$neutralBorderHover',
  },
  '&:disabled:hover': {
    backgroundColor: '$transparent',
    color: '$neutralBorderHover',
  },
  defaultVariants: {
    color: 'ghost',
  },
})

const QuantityInput = styled('input', {
  border: 0,
  background: 'none',
  fontSize: 16,
  maxWidth: 53,
  textAlign: 'center',
  color: '$neutralTextContrast',
})

const QuantitySelector: FC<Props> = ({
  max,
  min,
  quantity,
  setQuantity,
  css,
}) => {
  return (
    <PseudoInput
      css={{
        gap: '$1',
        direction: 'column',
        display: 'flex',
        alignItems: 'center',
        p: 0,
        ...css,
      }}
    >
      <QuantityButton
        css={{ px: 20 }}
        disabled={quantity <= min}
        onClick={() => {
          setQuantity(quantity - 1)
        }}
      >
        <FontAwesomeIcon
          icon={faMinus}
          width="16"
          height="16"
          style={{ height: 16 }}
        />
      </QuantityButton>
      <QuantityInput
        value={quantity == -1 ? '' : quantity}
        onChange={(e) => {
          if (e.target.value === '') {
            setQuantity(-1)
            return
          }

          const newQuantity = Number(e.target.value || 0)
          if (newQuantity && newQuantity >= min && newQuantity <= max) {
            setQuantity(newQuantity)
          } else {
            setQuantity(quantity)
          }
        }}
        onBlur={(e) => {
          if (e.target.value === '') {
            setQuantity(min)
          } else if (Number(e.target.value) > max) {
            setQuantity(max)
          }
        }}
      />
      <QuantityButton
        css={{ px: 20 }}
        disabled={quantity >= max}
        onClick={() => {
          setQuantity(quantity + 1)
        }}
      >
        <FontAwesomeIcon
          icon={faPlus}
          width="16"
          height="16"
          style={{ height: 16 }}
        />
      </QuantityButton>
    </PseudoInput>
  )
}

export default QuantitySelector
