import {
  faCheckCircle,
  faCircleExclamation,
  faCube,
  faWallet,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { Dispatch, ReactElement, SetStateAction, useEffect } from 'react'
import { Path } from '../../components/cart/CartCheckoutModal'
import { useFallbackState } from '../../hooks'
import {
  Button,
  Flex,
  FormatCryptoCurrency,
  Text,
  Slider,
  Input,
  Grid,
  FormatCurrency,
  Box,
  Loader,
  Anchor,
  ErrorWell,
} from '../../primitives'
import { ApprovalCollapsible } from '../ApprovalCollapsible'
import { Modal } from '../Modal'
import SigninStep from '../SigninStep'
import { TokenCheckout } from '../TokenCheckout'
import { ItemToggle } from './ItemToggle'
import { SweepItem } from './SweepItem'
import {
  SweepModalRenderer,
  SweepModalStepData,
  SweepStep,
} from './SweepModalRenderer'

type SweepCallbackData = {
  collectionId?: string
  maker?: string
  stepData: SweepModalStepData | null
}

type Props = Pick<Parameters<typeof Modal>['0'], 'trigger'> & {
  openState?: [boolean, Dispatch<SetStateAction<boolean>>]
  collectionId?: string
  referrerFeeBps?: number | null
  referrerFeeFixed?: number | null
  referrer?: string | null
  normalizeRoyalties?: boolean
  onSweepComplete?: (data: SweepCallbackData) => void
  onSweepError?: (error: Error, data: SweepCallbackData) => void
  onClose?: (data: SweepCallbackData) => void
}

export function SweepModal({
  openState,
  trigger,
  collectionId,
  referrerFeeBps,
  referrerFeeFixed,
  referrer,
  normalizeRoyalties,
  onSweepComplete,
  onSweepError,
  onClose,
}: Props): ReactElement {
  const [open, setOpen] = useFallbackState(
    openState ? openState[0] : false,
    openState
  )

  return (
    <SweepModalRenderer
      open={open}
      collectionId={collectionId}
      referrerFeeBps={referrerFeeBps}
      referrerFeeFixed={referrerFeeFixed}
      referrer={referrer}
      normalizeRoyalties={normalizeRoyalties}
    >
      {({
        loading,
        address,
        selectedTokens,
        itemAmount,
        setItemAmount,
        ethAmount,
        setEthAmount,
        isItemsToggled,
        setIsItemsToggled,
        maxInput,
        currency,
        total,
        totalUsd,
        currentChain,
        availableTokens,
        balance,
        hasEnoughCurrency,
        blockExplorerBaseUrl,
        transactionError,
        stepData,
        sweepStep,
        sweepTokens,
      }) => {
        useEffect(() => {
          if (sweepStep === SweepStep.Complete && onSweepComplete) {
            const data: SweepCallbackData = {
              collectionId: collectionId,
              maker: address,
              stepData,
            }

            onSweepComplete(data)
          }
        }, [sweepStep])

        useEffect(() => {
          if (transactionError && onSweepError) {
            const data: SweepCallbackData = {
              collectionId: collectionId,
              maker: address,
              stepData,
            }
            onSweepError(transactionError, data)
          }
        }, [transactionError])

        const hasTokens = availableTokens && availableTokens.length > 0

        const images = selectedTokens.slice(0, 2).map((token) => {
          if (token?.token?.image) {
            return token?.token?.image
          }
        }) as string[]

        const pathMap = stepData?.path
          ? (stepData.path as Path[]).reduce(
              (paths: Record<string, Path>, path: Path) => {
                if (path.orderId) {
                  paths[path.orderId] = path
                }

                return paths
              },
              {} as Record<string, Path>
            )
          : {}

        const totalPurchases =
          stepData?.currentStep?.items?.reduce(
            (total, item) => total + (item?.salesData?.length || 0),
            0
          ) || 0

        const failedPurchases = (selectedTokens.length || 0) - totalPurchases

        return (
          <Modal
            trigger={trigger}
            title="Sweep"
            open={open}
            loading={loading}
            onOpenChange={(open) => {
              if (!open && onClose) {
                const data: SweepCallbackData = {
                  collectionId: collectionId,
                  maker: address,
                  stepData,
                }
                onClose(data)
              }
              setOpen(open)
            }}
          >
            {!loading && !hasTokens ? (
              <Flex
                direction="column"
                align="center"
                css={{ py: '$6', px: '$4', gap: '$3' }}
              >
                <Text style="h6" css={{ textAlign: 'center' }}>
                  No available items were found for this collection.
                </Text>
              </Flex>
            ) : null}
            {!loading && hasTokens && sweepStep === SweepStep.Idle && (
              <Flex direction="column">
                <Flex direction="column" css={{ px: '$4', pt: '$4', pb: '$2' }}>
                  {transactionError ? (
                    <ErrorWell message={transactionError.message} />
                  ) : null}
                  <Slider
                    min={0}
                    max={isItemsToggled ? Math.min(50, maxInput) : maxInput}
                    step={isItemsToggled ? 1 : 0.01}
                    value={
                      isItemsToggled ? [itemAmount || 0] : [ethAmount || 0]
                    }
                    onValueChange={(value) => {
                      if (isItemsToggled) {
                        setItemAmount(value[0])
                      } else {
                        setEthAmount(value[0])
                      }
                    }}
                    css={{ width: '100%', my: '$3' }}
                  />
                  <Flex align="center" css={{ gap: '$3', mb: 20 }}>
                    <Input
                      value={
                        isItemsToggled ? itemAmount || '' : ethAmount || ''
                      }
                      type="number"
                      placeholder="0"
                      step={isItemsToggled ? 1 : 0.01}
                      onChange={(e) => {
                        const inputValue = Number(e.target.value)

                        if (e.target.value == '') {
                          setItemAmount(undefined)
                          setEthAmount(undefined)
                        } else if (isItemsToggled) {
                          setItemAmount(
                            Math.min(Math.max(inputValue, 0), maxInput) // min: 0, max: maxInput
                          )
                        } else {
                          setEthAmount(
                            Math.min(Math.max(inputValue, 0), maxInput)
                          )
                        }
                      }}
                      css={{
                        textAlign: 'center',
                        width: '100%',
                        height: 44,
                        boxSizing: 'border-box',
                        '&::placeholder': {
                          paddingLeft: 12,
                        },
                      }}
                      containerCss={{ width: '100%' }}
                    />
                    <ItemToggle
                      isItemsToggled={isItemsToggled}
                      setIsItemsToggled={setIsItemsToggled}
                      currency={currency}
                    />
                  </Flex>
                  <Flex
                    direction="column"
                    css={{ height: 185, overflowY: 'auto', mb: '$4' }}
                  >
                    {selectedTokens && selectedTokens.length > 0 ? (
                      <Grid
                        css={{
                          gridTemplateColumns: 'repeat(5,minmax(0,1fr))',
                          '@bp1': {
                            gridTemplateColumns: 'repeat(7,minmax(0,1fr))',
                          },
                          gap: 8,
                        }}
                      >
                        {selectedTokens.map((token, i) => (
                          <SweepItem
                            key={`${token?.token?.tokenId}-${i}`}
                            name={
                              token.token?.name || `#${token?.token?.tokenId}`
                            }
                            image={token.token?.image}
                            currency={currency}
                            amount={
                              token?.market?.floorAsk?.price?.amount?.decimal
                            }
                          />
                        ))}
                      </Grid>
                    ) : (
                      <Text
                        style="body3"
                        color="subtle"
                        css={{ textAlign: 'center', my: 'auto' }}
                      >
                        Selected items will appear here
                      </Text>
                    )}
                  </Flex>
                  <Flex justify="between" align="start" css={{ height: 34 }}>
                    <Text style="h6">Total</Text>
                    <Flex direction="column" align="end" css={{ gap: '$1' }}>
                      <FormatCryptoCurrency
                        textStyle="h6"
                        amount={total}
                        address={currency?.address}
                        decimals={currency?.decimals}
                        logoWidth={18}
                      />
                      <FormatCurrency
                        amount={totalUsd}
                        style="tiny"
                        color="subtle"
                      />
                    </Flex>
                  </Flex>
                </Flex>
                {hasEnoughCurrency ? (
                  <Button
                    css={{ m: '$4' }}
                    disabled={
                      !(selectedTokens.length > 0) || !hasEnoughCurrency
                    }
                    onClick={sweepTokens}
                  >
                    {selectedTokens.length > 0
                      ? 'Sweep'
                      : 'Select Items to Buy'}
                  </Button>
                ) : (
                  <Flex direction="column" align="center" css={{ px: '$3' }}>
                    <Flex align="center">
                      <Text css={{ mr: '$3' }} color="error" style="body2">
                        Insufficient Balance
                      </Text>

                      <FormatCryptoCurrency
                        amount={balance}
                        address={currency?.address}
                        decimals={currency?.decimals}
                        textStyle="body2"
                      />
                    </Flex>
                    <Button
                      css={{ my: '$4', width: '100%' }}
                      disabled={true}
                      onClick={sweepTokens}
                    >
                      Add Funds to Purchase
                    </Button>
                  </Flex>
                )}
              </Flex>
            )}

            {!loading && sweepStep === SweepStep.Approving && (
              <Flex direction="column">
                <Box
                  css={{
                    p: '$4',
                    borderBottom: '1px solid $neutralBorder',
                  }}
                >
                  <TokenCheckout
                    itemCount={selectedTokens.length}
                    images={images}
                    totalPrice={total}
                    usdPrice={totalUsd}
                    currency={currency}
                    chain={currentChain}
                  />
                </Box>
                <Flex
                  direction="column"
                  align="center"
                  css={{ p: '$4', overflowY: 'auto' }}
                >
                  {stepData?.currentStep == undefined ? (
                    <Flex css={{ py: '$5' }}>
                      <Loader />
                    </Flex>
                  ) : null}
                  {stepData?.currentStep &&
                  stepData.currentStep.id === 'auth' ? (
                    <>
                      <SigninStep css={{ mt: 48, mb: '$4', gap: 20 }} />
                      <Button disabled={true} css={{ mt: '$4', width: '100%' }}>
                        <Loader />
                        Waiting for Approval...
                      </Button>
                    </>
                  ) : null}

                  {stepData?.currentStep &&
                  stepData?.currentStep?.id !== 'auth' ? (
                    <>
                      {stepData?.currentStep?.items &&
                      stepData?.currentStep?.items.length > 1 ? (
                        <Flex
                          direction="column"
                          css={{ gap: '$4', width: '100%' }}
                        >
                          <Text style="h6" css={{ textAlign: 'center' }}>
                            Approve Purchases
                          </Text>
                          <Text style="subtitle2" color="subtle">
                            Due to limitations with Blur, the purchase of these
                            items needs to be split into{' '}
                            {stepData?.currentStep?.items.length} separate
                            transactions.
                          </Text>
                          {stepData?.currentStep?.items.map((item) => (
                            <ApprovalCollapsible
                              item={item}
                              pathMap={pathMap}
                              usdPrice={totalUsd}
                              cartChain={currentChain}
                              open={true}
                            />
                          ))}
                        </Flex>
                      ) : (
                        <Flex
                          direction="column"
                          align="center"
                          css={{ gap: '$4', pt: '$4', width: '100%' }}
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
                          <Button
                            disabled={true}
                            css={{ mt: '$4', width: '100%' }}
                          >
                            <Loader />
                            Waiting for Approval...
                          </Button>
                        </Flex>
                      )}
                    </>
                  ) : null}
                </Flex>
              </Flex>
            )}

            {!loading && sweepStep === SweepStep.Finalizing && (
              <Flex direction="column">
                <Box
                  css={{
                    p: '$4',
                    borderBottom: '1px solid $neutralBorder',
                  }}
                >
                  <TokenCheckout
                    itemCount={selectedTokens.length}
                    images={images}
                    totalPrice={total}
                    usdPrice={totalUsd}
                    currency={currency}
                    chain={currentChain}
                  />
                </Box>
                <Flex
                  direction="column"
                  align="center"
                  justify="center"
                  css={{
                    gap: '$4',
                    px: '$4',
                    py: '$5',
                  }}
                >
                  <Text style="h6">Finalizing on blockchain</Text>
                  <Text
                    style="subtitle2"
                    color="subtle"
                    css={{ textAlign: 'center' }}
                  >
                    You can close this modal while it finalizes on the
                    blockchain. The transaction will continue in the background.
                  </Text>
                  <Box css={{ color: '$neutralSolid' }}>
                    <FontAwesomeIcon icon={faCube} width={32} height={32} />
                  </Box>
                </Flex>
              </Flex>
            )}
            {sweepStep === SweepStep.Complete && (
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
                      color: failedPurchases
                        ? '$errorAccent'
                        : '$successAccent',
                    }}
                  >
                    <FontAwesomeIcon
                      icon={
                        failedPurchases ? faCircleExclamation : faCheckCircle
                      }
                      fontSize={32}
                    />
                  </Box>
                  <Text style="h5" css={{ textAlign: 'center' }}>
                    {failedPurchases
                      ? `${totalPurchases} ${
                          totalPurchases > 1 ? 'items' : 'item'
                        } purchased, ${failedPurchases} ${
                          failedPurchases > 1 ? 'items' : 'item'
                        } failed`
                      : 'Congrats! Purchase was successful.'}
                  </Text>
                  <Flex direction="column" css={{ gap: '$2', mb: '$3' }}>
                    {stepData?.currentStep?.items?.map((item) => {
                      const itemCount = item?.orderIds?.length || 1
                      const itemSubject = itemCount > 1 ? 'items' : 'item'

                      return (
                        <Anchor
                          href={`${blockExplorerBaseUrl}/tx/${item?.txHash}`}
                          color="primary"
                          weight="medium"
                          target="_blank"
                          css={{ fontSize: 12 }}
                        >
                          View transaction for {itemCount} {itemSubject} on
                          Etherscan
                        </Anchor>
                      )
                    })}
                  </Flex>
                </Flex>
                <Button css={{ width: '100%' }} onClick={() => setOpen(false)}>
                  Close
                </Button>
              </Flex>
            )}
          </Modal>
        )
      }}
    </SweepModalRenderer>
  )
}

SweepModal.Custom = SweepModalRenderer
