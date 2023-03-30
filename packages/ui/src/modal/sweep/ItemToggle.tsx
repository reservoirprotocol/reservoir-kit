import React, { FC } from 'react'
import { useChainCurrency } from '../../hooks'
import { ToggleGroup, ToggleGroupButton } from '../../primitives'

type Props = {
  isItemsToggled: boolean
  setIsItemsToggled: React.Dispatch<React.SetStateAction<boolean>>
  currency: ReturnType<typeof useChainCurrency>
}

export const ItemToggle: FC<Props> = ({
  isItemsToggled,
  setIsItemsToggled,
  currency,
}) => {
  return (
    <ToggleGroup
      type="single"
      value={isItemsToggled ? 'items' : 'currency'}
      onValueChange={(value) => {
        if (value === 'items') {
          setIsItemsToggled(true)
        } else {
          setIsItemsToggled(false)
        }
      }}
      css={{
        width: 'min-content',
        borderRadius: 8,
        height: 44,
        boxSizing: 'border-box',
      }}
    >
      <ToggleGroupButton value="items" css={{ borderRadius: 8 }}>
        Items
      </ToggleGroupButton>
      <ToggleGroupButton value="currency" css={{ borderRadius: 8 }}>
        {currency.symbol.toUpperCase()}
      </ToggleGroupButton>
    </ToggleGroup>
  )
}
