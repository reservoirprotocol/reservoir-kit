import React, { FC, useEffect, useState } from 'react'
import { TokenCheckout } from './TokenCheckout'
import { Execute, ReservoirChain } from '@reservoir0x/reservoir-sdk'
import { ApproveCollapsible } from './ApproveCollapisble'
import { Flex } from '../primitives'

type Props = {
  title?: string
  item: NonNullable<Execute['steps'][0]['items']>[0]
  pathMap: Record<string, NonNullable<Execute['path']>[0]>
  usdPrice: number
  chain?: ReservoirChain | null
  open?: boolean
}

export const ApprovePurchasingCollapsible: FC<Props> = ({
  item,
  pathMap,
  usdPrice,
  chain,
  open,
}) => {
  const [collapsibleOpen, setCollapsibleOpen] = useState(false)

  const isComplete = item && item?.status == 'complete'
  const itemCount = item?.orderIds?.length || 1

  function processOrders(orderIds: string[]) {
    let totalPrice = 0
    let images: string[] = []

    orderIds.forEach((orderId: string) => {
      const path = pathMap[orderId]

      if (path) {
        let imageRedirect = `${chain?.baseApiUrl}/redirect/tokens/${path.contract}:${path.tokenId}/image/v1?imageSize=small`
        images.push(imageRedirect)
        totalPrice += path.quote || 0
      }
    })

    images = images.slice(0, 2)

    return { totalPrice, images }
  }

  const { totalPrice, images } = processOrders(item?.orderIds as string[])

  useEffect(() => {
    if (open !== undefined && open !== collapsibleOpen) {
      setCollapsibleOpen(open)
    }
  }, [open])

  return (
    <ApproveCollapsible
      title={'Approve transaction'}
      open={collapsibleOpen}
      onOpenChange={setCollapsibleOpen}
      isComplete={isComplete}
    >
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
    </ApproveCollapsible>
  )
}
