import React, { FC, useMemo } from 'react'
import { useTokens } from '../../hooks'
import { Dropdown, DropdownMenuItem } from '../../primitives/Dropdown'
import { Button, Flex, FormatCryptoCurrency, Text } from '../../primitives'
import { faEllipsis } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { Currency } from '../../types/Currency'

type FloorDropdownProps = {
  token?: NonNullable<NonNullable<ReturnType<typeof useTokens>>['data']>[0]
  defaultCurrency?: Currency
  setPrice: React.Dispatch<React.SetStateAction<string>>
  setCurrency: (currency: Currency) => void
}

const FloorDropdown: FC<FloorDropdownProps> = ({
  token,
  defaultCurrency,
  setPrice,
  setCurrency,
}) => {
  const highestTraitFloor = useMemo(() => {
    // @TODO: do we want to have a max size of attributes?
    if (token?.token?.attributes && token?.token?.attributes?.length < 200) {
      return Math.max(
        ...token.token.attributes.map((attr: any) =>
          Number(attr.floorAskPrice)
        ),
        0
      )
    }
  }, [token?.token?.attributes])

  if (highestTraitFloor && defaultCurrency)
    return (
      <Dropdown
        trigger={
          <Button
            color="secondary"
            size="none"
            css={{ height: 44, px: '$4', borderRadius: 8 }}
          >
            <Flex css={{ color: '$neutralText' }}>
              <FontAwesomeIcon icon={faEllipsis} />
            </Flex>
          </Button>
        }
      >
        {highestTraitFloor ? (
          <DropdownMenuItem
            onClick={() => {
              setPrice(highestTraitFloor.toString())
              setCurrency(defaultCurrency)
            }}
          >
            <Flex justify="between" align="center">
              <Text style="subtitle1">Highest Trait</Text>
              <FormatCryptoCurrency amount={highestTraitFloor} textStyle="h6" />
            </Flex>
          </DropdownMenuItem>
        ) : null}
      </Dropdown>
    )

  return null
}

export default FloorDropdown
