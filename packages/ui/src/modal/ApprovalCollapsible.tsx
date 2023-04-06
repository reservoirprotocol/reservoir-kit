import { faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { FC, useEffect, useState } from 'react'
import { Flex, Box, Text } from '../primitives'
import { CollapsibleContent, CollapsibleRoot } from '../primitives/Collapsible'
import * as CollapsiblePrimitive from '@radix-ui/react-collapsible'
import { Cart } from '../context/CartProvider'
import { TokenCheckout } from './TokenCheckout'
import { Path } from '../components/cart/CartCheckoutModal'

type Props = {
  item: NonNullable<
    NonNullable<
      NonNullable<NonNullable<Cart['transaction']>['steps']>[0]
    >['items']
  >[0]
  transaction: Cart['transaction']
  pathMap: Record<string, Path>
  usdPrice: number
  cartChain: Cart['chain']
  open?: boolean
}

export const ApprovalCollapsible: FC<Props> = ({
  item,
  transaction,
  pathMap,
  usdPrice,
  cartChain,
  open,
}) => {
  const [collapsibleOpen, setCollapsibleOpen] = useState(false)

  const isComplete = item && item?.status == 'complete'
  // @ts-ignore Todo: orderIds not a part of item object
  const itemCount = item.orderIds.length || 1

  function processOrders(orderIds: string[]) {
    let totalPrice = 0
    let images: string[] = []

    orderIds.forEach((orderId: string) => {
      const path = pathMap[orderId]

      console.log(path)

      if (path) {
        totalPrice += path.quote || 0
        let imageRedirect = `${cartChain?.baseApiUrl}/redirect/tokens/${path.contract}:${path.tokenId}/image/v1`
        images.push(imageRedirect)
      }
    })

    images = images.slice(0, 2)

    return { totalPrice, images }
  }

  // @ts-ignore Todo: fix
  const { totalPrice, images } = processOrders(item.orderIds)

  useEffect(() => {
    if (open !== undefined && open !== collapsibleOpen) {
      setCollapsibleOpen(open)
    }
  }, [open])

  useEffect(() => {
    if (isComplete) {
      setCollapsibleOpen(false)
    }
  }, [isComplete])

  return (
    <CollapsibleRoot
      onOpenChange={(open) => {
        setCollapsibleOpen(open)
      }}
      open={collapsibleOpen}
      css={{ backgroundColor: '$gray3' }}
    >
      <CollapsiblePrimitive.Trigger asChild>
        <Flex justify="between" css={{ p: '$4' }}>
          <Flex align="center" css={{ gap: '$3' }}>
            <Box
              css={{
                width: 18,
                height: 18,
                backgroundColor: isComplete ? '$green6' : '$accentSolid',
                borderColor: isComplete ? '$green9' : '$accentLine',
                borderStyle: 'solid',
                borderWidth: 4,
                borderRadius: 999,
              }}
            />
            <Text
              style="subtitle2"
              css={{ color: isComplete ? '$neutralText' : '$textColor' }}
            >
              Approve transaction
            </Text>
          </Flex>
          <Box
            css={{
              color: '$neutralSolid',
              transform: collapsibleOpen ? 'rotate(180deg)' : 'rotate(0)',
              transition: '.3s',
            }}
          >
            <FontAwesomeIcon icon={faChevronDown} />
          </Box>
        </Flex>
      </CollapsiblePrimitive.Trigger>
      <CollapsibleContent>
        <Flex
          justify="between"
          align="center"
          css={{
            px: '$4',
            pb: '$2',
          }}
        >
          <TokenCheckout
            usdPrice={usdPrice}
            itemCount={itemCount}
            totalPrice={totalPrice}
            images={images}
            size={0}
          />
        </Flex>
      </CollapsibleContent>
    </CollapsibleRoot>
  )
}
