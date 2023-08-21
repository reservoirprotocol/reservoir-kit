import React, { ReactElement, useContext, useEffect, useState } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { AnimatePresence } from 'framer-motion'
import { AnimatedOverlay, StyledAnimatedContent } from '../../primitives/Dialog'
import { Anchor, Button, Flex, Text, Box, Loader } from '../../primitives'
import { styled } from '@stitches/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheckCircle,
  faCircleExclamation,
  faClose,
  faCube,
  faLock,
  faWallet,
} from '@fortawesome/free-solid-svg-icons'
import { ProviderOptionsContext } from '../../ReservoirKitProvider'
import { TokenCheckout } from '../../modal/TokenCheckout'
import { Cart, CheckoutStatus } from '../../context/CartProvider'
import SigninStep from '../../modal/SigninStep'
import { ApprovePurchasingCollapsible } from '../../modal/ApprovePurchasingCollapsible'
import { Execute } from '@reservoir0x/reservoir-sdk'
import { Logo } from '../../modal/Modal'

const Title = styled(DialogPrimitive.Title, {
  margin: 0,
})

export type Path = NonNullable<Execute['path']>[0]

type Props = {
  items: Cart['items']
  totalPrice: number
  usdPrice: number
  currency: NonNullable<Cart['items'][0]['price']>['currency']
  cartChain: Cart['chain']
  blockExplorerBaseUrl: string
  transaction?: Cart['transaction']
  open?: boolean
  setCartPopoverOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export function CartCheckoutModal({
  items,
  totalPrice,
  usdPrice,
  currency,
  cartChain,
  blockExplorerBaseUrl,
  transaction,
  open,
  setCartPopoverOpen,
}: Props): ReactElement | null {
  const [dialogOpen, setDialogOpen] = useState(false)
  const providerOptionsContext = useContext(ProviderOptionsContext)

  const images = items.slice(0, 2).map((item) => {
    const { token, collection } = item
    const contract = collection.id.split(':')[0]

    return `${cartChain?.baseApiUrl}/redirect/tokens/${contract}:${token.id}/image/v1?imageSize=small`
  })

  const totalSales =
    transaction?.currentStep?.items?.reduce((total, item) => {
      item.transfersData?.forEach((transferData) => {
        total += Number(transferData.amount || 1)
      })
      return total
    }, 0) || 0

  const totalQuantity =
    transaction?.items?.reduce((total, item) => {
      total += item?.order?.quantity || 1
      return total
    }, 0) || 0

  const failedSales = totalQuantity - totalSales
  const successfulSales = totalQuantity - failedSales

  const pathMap = transaction?.path
    ? (transaction.path as Path[]).reduce(
        (paths: Record<string, Path>, path: Path) => {
          if (path.orderId) {
            paths[path.orderId] = path
          }

          return paths
        },
        {} as Record<string, Path>
      )
    : {}

  useEffect(() => {
    if (open !== undefined && open !== dialogOpen) {
      setDialogOpen(open)
    }
  }, [open])

  return (
    <DialogPrimitive.Root
      onOpenChange={(open) => {
        setDialogOpen(open)
        if (!open) {
          setCartPopoverOpen(false)
        }
      }}
      open={dialogOpen}
    >
      <AnimatePresence>
        {dialogOpen && (
          <DialogPrimitive.DialogPortal forceMount>
            <AnimatedOverlay style={{ zIndex: 1002 }} />
            <StyledAnimatedContent
              forceMount
              css={{
                zIndex: 1003,
              }}
            >
              <Flex
                css={{
                  p: 16,
                  backgroundColor: '$headerBackground',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTopRightRadius: '$borderRadius',
                  borderTopLeftRadius: '$borderRadius',
                }}
              >
                <Title css={{ alignItems: 'center', display: 'flex' }}>
                  <Text style="h6">Complete Checkout</Text>
                </Title>
                <DialogPrimitive.Close asChild>
                  <Button
                    color="ghost"
                    size="none"
                    css={{ color: '$neutralText' }}
                  >
                    <FontAwesomeIcon icon={faClose} width={16} height={16} />
                  </Button>
                </DialogPrimitive.Close>
              </Flex>
              <Box css={{ maxHeight: '85vh', overflowY: 'auto' }}>
                {transaction?.status === CheckoutStatus.Approving && (
                  <Flex direction="column">
                    <Box
                      css={{
                        p: '$4',
                        borderBottom: '1px solid $neutralBorder',
                      }}
                    >
                      <TokenCheckout
                        itemCount={items.length}
                        images={images}
                        totalPrice={totalPrice}
                        usdPrice={usdPrice}
                        currency={currency}
                        chain={cartChain}
                      />
                    </Box>
                    <Flex
                      direction="column"
                      css={{ p: '$4', overflowY: 'auto' }}
                    >
                      <Flex
                        direction="column"
                        align="center"
                        justify="center"
                        css={{
                          color: '$neutralBorderHover',
                          flex: 1,
                          gap: '$5',
                        }}
                      >
                        {transaction?.currentStep == undefined ? (
                          <Flex css={{ py: '$5' }}>
                            <Loader />
                          </Flex>
                        ) : null}
                        {transaction?.currentStep &&
                        transaction?.currentStep?.id === 'auth' ? (
                          <SigninStep css={{ mt: 48, mb: '$4', gap: 20 }} />
                        ) : null}
                        {transaction?.currentStep &&
                        transaction?.currentStep?.id !== 'auth' ? (
                          <>
                            {transaction?.currentStep?.items &&
                            transaction.currentStep?.items.length > 1 ? (
                              <Flex
                                direction="column"
                                css={{ gap: '$4', width: '100%' }}
                              >
                                <Text style="h6" css={{ textAlign: 'center' }}>
                                  Approve Purchases
                                </Text>
                                <Text style="subtitle2" color="subtle">
                                  Due to limitations with Blur, the purchase of
                                  these items needs to be split into{' '}
                                  {transaction?.currentStep?.items.length}{' '}
                                  separate transactions.
                                </Text>
                                {transaction.currentStep?.items.map((item) => (
                                  <ApprovePurchasingCollapsible
                                    item={item}
                                    pathMap={pathMap}
                                    usdPrice={usdPrice}
                                    chain={cartChain}
                                    open={true}
                                  />
                                ))}
                              </Flex>
                            ) : (
                              <Flex
                                direction="column"
                                align="center"
                                css={{ gap: '$4', py: '$4' }}
                              >
                                <Text style="h6">
                                  Confirm transaction in your wallet
                                </Text>
                                <Box css={{ color: '$neutralText' }}>
                                  <FontAwesomeIcon
                                    icon={faWallet}
                                    style={{
                                      width: '32px',
                                      height: '32px',
                                      margin: '12px 0px',
                                    }}
                                  />
                                </Box>
                              </Flex>
                            )}
                          </>
                        ) : null}
                      </Flex>
                    </Flex>
                    <Button disabled={true} css={{ m: '$4' }}>
                      <Loader />
                      Waiting for Approval...
                    </Button>
                  </Flex>
                )}
                {transaction?.status === CheckoutStatus.Finalizing && (
                  <Flex direction="column">
                    <Flex direction="column" css={{ px: '$4', py: '$5' }}>
                      <Flex
                        direction="column"
                        align="center"
                        justify="center"
                        css={{
                          gap: '$4',
                        }}
                      >
                        <Text style="h6">Finalizing on blockchain</Text>
                        <Text
                          style="subtitle2"
                          color="subtle"
                          css={{ textAlign: 'center' }}
                        >
                          You can close this modal while it finalizes on the
                          blockchain. The transaction will continue in the
                          background.
                        </Text>

                        <FontAwesomeIcon
                          icon={faCube}
                          style={{ height: 24, width: 24 }}
                        />
                      </Flex>
                    </Flex>
                    <Button disabled={true} css={{ m: '$4' }}>
                      <Loader />
                      Waiting to be Validated...
                    </Button>
                  </Flex>
                )}

                {transaction?.status === CheckoutStatus.Complete && (
                  <Flex
                    direction="column"
                    align="center"
                    css={{ width: '100%', p: '$4' }}
                  >
                    <Flex
                      direction="column"
                      align="center"
                      css={{ width: '100%', p: '$4' }}
                    >
                      <Flex
                        direction="column"
                        align="center"
                        css={{ px: '$4', py: '$5', gap: 24 }}
                      >
                        <Box
                          css={{
                            color: failedSales
                              ? '$errorAccent'
                              : '$successAccent',
                          }}
                        >
                          <FontAwesomeIcon
                            icon={
                              failedSales ? faCircleExclamation : faCheckCircle
                            }
                            fontSize={32}
                          />
                        </Box>
                        <Text style="h5" css={{ textAlign: 'center' }}>
                          {failedSales
                            ? `${successfulSales} ${
                                successfulSales > 1 ? 'items' : 'item'
                              } purchased, ${failedSales} ${
                                failedSales > 1 ? 'items' : 'item'
                              } failed`
                            : 'Congrats! Purchase was successful.'}
                        </Text>
                        <Flex direction="column" css={{ gap: '$2', mb: '$3' }}>
                          {transaction.currentStep?.items?.map((item) => {
                            const txHash = item.txHash
                              ? `${item.txHash.slice(
                                  0,
                                  4
                                )}...${item.txHash.slice(-4)}`
                              : ''
                            return (
                              <Anchor
                                href={`${blockExplorerBaseUrl}/tx/${item?.txHash}`}
                                color="primary"
                                weight="medium"
                                target="_blank"
                                css={{ fontSize: 12 }}
                              >
                                View transaction: {txHash}
                              </Anchor>
                            )
                          })}
                        </Flex>
                      </Flex>
                    </Flex>
                    <Flex css={{ width: '100%', p: '$4' }}>
                      <Button
                        css={{ width: '100%' }}
                        onClick={() => setDialogOpen(false)}
                      >
                        Close
                      </Button>
                    </Flex>
                  </Flex>
                )}
              </Box>

              {!providerOptionsContext.disablePoweredByReservoir && (
                <Flex
                  align="center"
                  css={{
                    mx: 'auto',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pb: 12,
                    gap: '$1',
                    visibility: '$poweredByReservoirVisibility',
                    borderBottomRightRadius: '$borderRadius',
                    borderBottomLeftRadius: '$borderRadius',
                  }}
                >
                  <Box css={{ color: '$neutralBorderHover' }}>
                    <FontAwesomeIcon icon={faLock} width={9} height={10} />
                  </Box>
                  <Text
                    style="tiny"
                    color="subtle"
                    css={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      lineHeight: '12px',
                      fontWeight: 400,
                      color: '$neutralText',
                    }}
                  >
                    Powered by{' '}
                    <Anchor
                      href="https://reservoir.tools/"
                      target="_blank"
                      weight="heavy"
                      color="gray"
                      css={{
                        height: 12,
                        fontSize: 12,
                        '&:hover': {
                          color: '$neutralSolid',
                          fill: '$neutralSolid',
                        },
                      }}
                    >
                      <Logo />
                    </Anchor>
                  </Text>
                </Flex>
              )}
            </StyledAnimatedContent>
          </DialogPrimitive.DialogPortal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  )
}
