import { useMemo } from 'react'
import { useCart, useTokens } from './'
import { SWRInfiniteConfiguration } from 'swr/infinite'
import { Cart } from './../context/CartProvider'

export default function (
  options: Parameters<typeof useTokens>['0'] = {},
  swrOptions: SWRInfiniteConfiguration = {}
) {
  const tokensResponse = useTokens(
    {
      includeDynamicPricing: true,
      ...options,
    },
    swrOptions
  )
  const { data: cartItems, ...cartActions } = useCart((cart) => cart.items)
  const { data: cartPools } = useCart((cart) => cart.pools)

  const cartRequiresReordering = useMemo(
    () => Object.values(cartPools).some((pool) => pool.itemCount > 1),
    [cartPools]
  )
  const itemsMap = useMemo(() => {
    return cartItems.reduce((itemMap, item) => {
      itemMap[`${item.collection.id}:${item.token.id}`] = item
      return itemMap
    }, {} as Record<string, Cart['items'][0]>)
  }, [cartItems])

  const dynamicTokens = tokensResponse.data.map((tokenData) => {
    const id = `${tokenData?.token?.collection?.id}:${tokenData?.token?.tokenId}`
    const cartItem = itemsMap[id]
    const dynamicTokenData = {
      ...tokenData,
      isInCart: cartItem !== undefined,
    }
    const floorAsk = tokenData?.market?.floorAsk
    const isInPool = floorAsk?.dynamicPricing?.kind === 'pool'
    const poolId = isInPool
      ? (floorAsk?.dynamicPricing?.data?.pool as string)
      : undefined
    const poolPrices = isInPool
      ? (floorAsk?.dynamicPricing?.data
          ?.prices as Cart['items'][0]['poolPrices'])
      : undefined
    if (cartItem) {
      if (
        dynamicTokenData.market?.floorAsk &&
        cartItem.poolId &&
        cartItem.price &&
        cartItem.price.amount?.decimal !=
          dynamicTokenData.market?.floorAsk?.price
      ) {
        dynamicTokenData.market.floorAsk.price = cartItem.price
      }
    } else if (
      isInPool &&
      poolId &&
      poolPrices &&
      floorAsk &&
      dynamicTokenData.market?.floorAsk
    ) {
      const nextPoolCartIndex = cartPools[poolId]
        ? cartPools[poolId].itemCount
        : 0
      if (poolPrices && poolPrices[nextPoolCartIndex]) {
        dynamicTokenData.market.floorAsk.price = poolPrices[nextPoolCartIndex]
      }
    }
    return dynamicTokenData
  })

  if (
    cartRequiresReordering &&
    (!options || !options.sortBy || options.sortBy === 'floorAskPrice')
  ) {
    dynamicTokens.sort((a, b) => {
      const aPrice = a.market?.floorAsk?.price?.amount?.decimal || 0
      const bPrice = b.market?.floorAsk?.price?.amount?.decimal || 0
      if (
        !options ||
        !options.sortDirection ||
        options.sortDirection === 'asc'
      ) {
        return aPrice - bPrice
      } else {
        return aPrice + bPrice
      }
    })
  }

  return {
    ...tokensResponse,
    data: dynamicTokens,
    ...cartActions,
  }
}
