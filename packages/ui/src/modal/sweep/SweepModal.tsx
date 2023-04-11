import {
  faCheckCircle,
  faCube,
  faWallet,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { Dispatch, ReactElement, SetStateAction } from 'react'
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
import { SweepModalRenderer, SweepStep } from './SweepModalRenderer'

type Props = Pick<Parameters<typeof Modal>['0'], 'trigger'> & {
  openState?: [boolean, Dispatch<SetStateAction<boolean>>]
  collectionId?: string
  normalizeRoyalties?: boolean
  // Todo: add callback functions
}

export function SweepModal({
  openState,
  trigger,
  collectionId,
  normalizeRoyalties,
}: Props): ReactElement {
  const [open, setOpen] = useFallbackState(
    openState ? openState[0] : false,
    openState
  )

  return (
    <SweepModalRenderer
      open={open}
      collectionId={collectionId}
      normalizeRoyalties={normalizeRoyalties}
    >
      {({
        loading,
        selectedTokens,
        setSelectedTokens,
        itemAmount,
        setItemAmount,
        ethAmount,
        setEthAmount,
        isItemsToggled,
        setIsItemsToggled,
        maxInput,
        setMaxInput,
        currency,
        total,
        totalUsd,
        currentChain,
        tokens,
        blockExplorerBaseUrl,
        transactionError,
        stepData,
        setStepData,
        sweepStep,
        setSweepStep,
        sweepTokens,
      }) => {
        const hasTokens = tokens && tokens.length > 0

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
        return (
          <Modal
            trigger={trigger}
            title="Sweep"
            open={open}
            loading={loading}
            onOpenChange={(open) => {
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
                  No items were found for this collection.
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
                    max={
                      isItemsToggled
                        ? Math.min(50, maxInput)
                        : Math.min(100, maxInput)
                    }
                    step={isItemsToggled ? 1 : 0.1}
                    value={isItemsToggled ? [itemAmount] : [ethAmount]}
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
                      value={isItemsToggled ? itemAmount : ethAmount}
                      type="number"
                      step={isItemsToggled ? 1 : 0.1}
                      onChange={(e) => {
                        const inputValue = Number(e.target.value)

                        if (e.target.value == '') {
                          setItemAmount(0)
                          setEthAmount(0)
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
                            } // TODO: decimal or native?
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
                <Button
                  css={{ m: '$4' }}
                  disabled={!(selectedTokens.length > 0)}
                  onClick={sweepTokens}
                >
                  {selectedTokens.length > 0 ? 'Sweep' : 'Select Items to Buy'}
                </Button>
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
                      <Button disabled={true} css={{ m: '$4' }}>
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

                  <FontAwesomeIcon icon={faCube} width="24" />
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
                      color: '$successAccent',
                    }}
                  >
                    <FontAwesomeIcon icon={faCheckCircle} fontSize={32} />
                  </Box>
                  <Text style="h5" css={{ textAlign: 'center' }}>
                    Congrats! Purchase was successful.
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
