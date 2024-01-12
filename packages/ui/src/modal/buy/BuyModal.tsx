import React, {
  ComponentPropsWithoutRef,
  Dispatch,
  ReactElement,
  SetStateAction,
  useContext,
  useEffect,
} from 'react'
import { useFallbackState, useReservoirClient } from '../../hooks'
import {
  Flex,
  Box,
  Text,
  Anchor,
  Button,
  FormatCryptoCurrency,
  Loader,
  ErrorWell,
} from '../../primitives'
import Progress from '../Progress'
import { Modal } from '../Modal'
import {
  faCircleExclamation,
  faCheckCircle,
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { BuyModalRenderer, BuyStep, BuyModalStepData } from './BuyModalRenderer'
import {
  BuyTokenBodyParameters,
  Execute,
  ReservoirWallet,
} from '@reservoir0x/reservoir-sdk'
import ProgressBar from '../ProgressBar'
import QuantitySelector from '../QuantitySelector'
import { formatNumber } from '../../lib/numbers'
import { ProviderOptionsContext } from '../../ReservoirKitProvider'
import { truncateAddress } from '../../lib/truncate'
import { SelectPaymentTokenv2 } from '../SelectPaymentTokenv2'
import { WalletClient } from 'viem'
import getChainBlockExplorerUrl from '../../lib/getChainBlockExplorerUrl'
import { Dialog } from '../../primitives/Dialog'
import { TokenInfo, PaymentDetails } from '../../common'

type PurchaseData = {
  token?: string
  maker?: string
  steps?: Execute['steps']
}

const ModalCopy = {
  titleInsufficientFunds: 'Add Funds',
  titleDefault: 'Buy',
  ctaClose: 'Close',
  ctaCheckout: 'Checkout',
  ctaConnect: 'Connect',
  ctaInsufficientFunds: 'Add Funds',
  ctaGoToToken: '',
  ctaAwaitingValidation: 'Waiting for transaction to be validated',
  ctaAwaitingApproval: 'Waiting for approval...',
  ctaCopyAddress: 'Copy Wallet Address',
}

type Props = Pick<Parameters<typeof Modal>['0'], 'trigger'> & {
  openState?: [boolean, Dispatch<SetStateAction<boolean>>]
  token?: string
  orderId?: string
  creditCardCheckoutButton?: JSX.Element
  chainId?: number
  defaultQuantity?: number
  feesOnTopBps?: string[] | null
  feesOnTopUsd?: string[] | null
  normalizeRoyalties?: boolean
  copyOverrides?: Partial<typeof ModalCopy>
  walletClient?: ReservoirWallet | WalletClient
  usePermit?: boolean
  executionMethod?: BuyTokenBodyParameters['executionMethod']
  onConnectWallet: () => void
  onGoToToken?: () => any
  onPurchaseComplete?: (data: PurchaseData) => void
  onPurchaseError?: (error: Error, data: PurchaseData) => void
  onClose?: (
    data: PurchaseData,
    stepData: BuyModalStepData | null,
    currentStep: BuyStep
  ) => void
  onPointerDownOutside?: ComponentPropsWithoutRef<
    typeof Dialog
  >['onPointerDownOutside']
}

export function BuyModal({
  openState,
  trigger,
  token,
  orderId,
  chainId,
  feesOnTopBps,
  feesOnTopUsd,
  normalizeRoyalties,
  defaultQuantity,
  copyOverrides,
  walletClient,
  usePermit,
  executionMethod,
  onConnectWallet,
  onPurchaseComplete,
  onPurchaseError,
  onClose,
  onGoToToken,
  onPointerDownOutside,
  creditCardCheckoutButton,
}: Props): ReactElement {
  const copy: typeof ModalCopy = { ...ModalCopy, ...copyOverrides }
  const [open, setOpen] = useFallbackState(
    openState ? openState[0] : false,
    openState
  )

  const client = useReservoirClient()

  const currentChain = client?.currentChain()

  const modalChain = chainId
    ? client?.chains.find(({ id }) => id === chainId) || currentChain
    : currentChain

  const providerOptions = useContext(ProviderOptionsContext)

  return (
    <BuyModalRenderer
      chainId={modalChain?.id}
      open={open}
      executionMethod={executionMethod}
      defaultQuantity={defaultQuantity}
      token={token}
      orderId={orderId}
      feesOnTopBps={feesOnTopBps}
      feesOnTopUsd={feesOnTopUsd}
      normalizeRoyalties={normalizeRoyalties}
      walletClient={walletClient}
      usePermit={usePermit}
      onConnectWallet={onConnectWallet}
    >
      {({
        loading,
        isFetchingPath,
        tokenData,
        collection,
        quantityAvailable,
        quantity,
        averageUnitPrice,
        totalIncludingFees,
        feeOnTop,
        paymentCurrency,
        paymentTokens,
        buyStep,
        transactionError,
        hasEnoughCurrency,
        addFundsLink,
        steps,
        stepData,
        feeUsd,
        totalUsd,
        usdPrice,
        balance,
        address,
        blockExplorerBaseName,
        isConnected,
        isOwner,
        setPaymentCurrency,
        setQuantity,
        setBuyStep,
        buyToken,
      }) => {
        useEffect(() => {
          if (buyStep === BuyStep.Complete && onPurchaseComplete) {
            const data: PurchaseData = {
              token,
              maker: address,
            }
            if (steps) {
              data.steps = steps
            }
            onPurchaseComplete(data)
          }
        }, [buyStep])

        useEffect(() => {
          if (transactionError && onPurchaseError) {
            const data: PurchaseData = {
              token,
              maker: address,
            }
            onPurchaseError(transactionError, data)
          }
        }, [transactionError])

        const executableSteps =
          steps?.filter((step) => step.items && step.items.length > 0) || []
        const lastStepItems =
          executableSteps[executableSteps.length - 1]?.items || []

        const totalPurchases =
          stepData?.currentStep?.items?.reduce((total, item) => {
            item.transfersData?.forEach((transferData) => {
              total += Number(transferData.amount || 1)
            })
            return total
          }, 0) || 0

        const failedPurchases = quantity - totalPurchases
        const successfulPurchases = quantity - failedPurchases
        const finalTxHashes = lastStepItems[lastStepItems.length - 1]?.txHashes

        return (
          <Modal
            trigger={trigger}
            title={copy.titleDefault}
            open={open}
            onPointerDownOutside={(e) => {
              const dismissableLayers = Array.from(
                document.querySelectorAll('div[data-radix-dismissable]')
              )
              const clickedDismissableLayer = dismissableLayers.some((el) =>
                e.target ? el.contains(e.target as Node) : false
              )

              if (!clickedDismissableLayer && dismissableLayers.length > 0) {
                e.preventDefault()
              }
              if (onPointerDownOutside) {
                onPointerDownOutside(e)
              }
            }}
            onOpenChange={(open) => {
              if (!open && onClose) {
                const data: PurchaseData = {
                  token,
                  maker: address,
                }
                onClose(data, stepData, buyStep)
              }
              setOpen(open)
            }}
            loading={loading}
          >
            {buyStep === BuyStep.Unavailable && !loading && (
              <Flex direction="column">
                <Flex
                  direction="column"
                  align="center"
                  css={{ py: '$6', px: '$4', gap: '$3' }}
                >
                  <Text style="h6" css={{ textAlign: 'center' }}>
                    {isOwner
                      ? 'You already own this token.'
                      : 'Item is no longer available.'}
                  </Text>
                </Flex>
                <Button
                  onClick={() => {
                    setOpen(false)
                  }}
                  css={{ m: '$4' }}
                >
                  {copy.ctaClose}
                </Button>
              </Flex>
            )}

            {buyStep === BuyStep.SelectPayment && (
              <Flex direction="column" css={{ pb: 20 }}>
                <Flex align="center" css={{ gap: '$2' }}>
                  <Button
                    onClick={() => setBuyStep(BuyStep.Checkout)}
                    color="ghost"
                    size="xs"
                    css={{ color: '$neutralSolidHover' }}
                  >
                    <FontAwesomeIcon icon={faChevronLeft} width={10} />
                  </Button>
                  <Text style="subtitle2">Select Payment Method</Text>
                </Flex>
                <SelectPaymentTokenv2
                  paymentTokens={paymentTokens}
                  currency={paymentCurrency}
                  setCurrency={setPaymentCurrency}
                  goBack={() => setBuyStep(BuyStep.Checkout)}
                  itemAmount={quantity}
                  chainId={modalChain?.id || 1}
                />
              </Flex>
            )}

            {buyStep === BuyStep.Checkout && !loading && (
              <Flex direction="column">
                {transactionError && <ErrorWell error={transactionError} />}
                <TokenInfo
                  token={tokenData}
                  chain={modalChain}
                  collection={collection}
                  css={{ p: '$4' }}
                />
                {quantityAvailable > 1 && (
                  <Flex css={{ p: '$4' }} justify="between">
                    <Flex direction="column" css={{ gap: '$1' }}>
                      <Text style="body3">Quantity</Text>
                      <Text style="body3" color="subtle">
                        {formatNumber(quantityAvailable)} items available
                      </Text>
                    </Flex>
                    <QuantitySelector
                      min={1}
                      max={quantityAvailable}
                      quantity={quantity}
                      setQuantity={(quantity) => {
                        setQuantity(quantity)
                      }}
                    />
                  </Flex>
                )}
                <Flex
                  direction="column"
                  css={{
                    pb: '$2',
                    borderTop: '1px solid $neutralBorder',
                  }}
                >
                  {paymentTokens.length > 1 ? (
                    <Flex
                      direction="column"
                      css={{
                        gap: '$2',
                        py: '$3',
                        px: '$4',
                        borderRadius: '$3',
                        borderBottom: '1px solid $neutralBorder',
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: '$neutralBgHover',
                        },
                      }}
                      onClick={() => setBuyStep(BuyStep.SelectPayment)}
                    >
                      <Flex
                        justify="between"
                        align="center"
                        css={{
                          gap: '$1',
                        }}
                      >
                        <Text style="subtitle2">Payment Method</Text>
                        <Flex
                          align="center"
                          css={{ gap: '$2', cursor: 'pointer' }}
                        >
                          <Flex align="center">
                            <Text style="subtitle2">
                              {paymentCurrency?.name}
                            </Text>
                          </Flex>
                          <Box css={{ color: '$neutralSolidHover' }}>
                            <FontAwesomeIcon icon={faChevronRight} width={10} />
                          </Box>
                        </Flex>
                      </Flex>
                    </Flex>
                  ) : null}
                  <PaymentDetails
                    feeOnTop={feeOnTop}
                    feeUsd={feeUsd}
                    chainId={modalChain?.id}
                    paymentCurrency={paymentCurrency}
                    loading={isFetchingPath}
                    css={{ pt: '$4' }}
                  />
                </Flex>

                <Box css={{ p: '$4', width: '100%' }}>
                  {hasEnoughCurrency || !isConnected ? (
                    <>
                      <Button
                        disabled={!hasEnoughCurrency && isConnected}
                        onClick={buyToken}
                        css={{ width: '100%' }}
                        color="primary"
                      >
                        {!isConnected ? copy.ctaConnect : copy.ctaCheckout}
                      </Button>
                      {creditCardCheckoutButton && creditCardCheckoutButton}
                    </>
                  ) : (
                    <Flex direction="column" align="center">
                      <Flex align="center" css={{ mb: '$3' }}>
                        <Text css={{ mr: '$3' }} color="error" style="body3">
                          Insufficient Balance
                          {paymentTokens.length > 1
                            ? ', select another token or add funds'
                            : null}
                        </Text>

                        <FormatCryptoCurrency
                          chainId={modalChain?.id}
                          amount={paymentCurrency?.balance}
                          address={paymentCurrency?.address}
                          decimals={paymentCurrency?.decimals}
                          symbol={paymentCurrency?.name}
                          textStyle="body3"
                        />
                      </Flex>

                      {/* {paymentCurrency?.networkFees &&
                      paymentCurrency?.networkFees > 0n ? (
                        <Flex align="center">
                          <Text css={{ mr: '$3' }} color="error" style="body3">
                            Estimated Gas Cost
                          </Text>
                          <FormatCryptoCurrency
                            chainId={chainId}
                            amount={paymentCurrency?.networkFees}
                            address={paymentCurrency?.address}
                            decimals={paymentCurrency?.decimals}
                            symbol={paymentCurrency?.symbol}
                            textStyle="body3"
                          />
                        </Flex>
                      ) : null} */}

                      <Button
                        disabled={providerOptions.disableJumperLink}
                        onClick={() => {
                          window.open(addFundsLink, '_blank')
                        }}
                        css={{ width: '100%' }}
                      >
                        {providerOptions.disableJumperLink
                          ? copy.ctaCheckout
                          : copy.ctaInsufficientFunds}
                      </Button>
                    </Flex>
                  )}
                </Box>
              </Flex>
            )}

            {buyStep === BuyStep.Approving && token && (
              <Flex direction="column">
                <TokenInfo
                  token={tokenData}
                  chain={modalChain}
                  collection={collection}
                  css={{ p: '$4', borderBottom: '1px solid $neutralBorder' }}
                />
                {stepData && stepData.totalSteps > 1 && (
                  <ProgressBar
                    css={{ px: '$4', mt: '$3' }}
                    value={stepData?.stepProgress || 0}
                    max={stepData?.totalSteps || 0}
                  />
                )}
                {!stepData && <Loader css={{ height: 206 }} />}
                {stepData && (
                  <Progress
                    title={stepData?.currentStep.action || ''}
                    txHashes={stepData?.currentStepItem.txHashes}
                  />
                )}
                <Button disabled={true} css={{ m: '$4' }}>
                  <Loader />
                  {stepData?.currentStepItem?.txHashes
                    ? copy.ctaAwaitingValidation
                    : copy.ctaAwaitingApproval}
                </Button>
              </Flex>
            )}

            {buyStep === BuyStep.Complete && token && (
              <Flex direction="column">
                <Flex
                  css={{
                    p: '$4',
                    py: '$5',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                  }}
                >
                  {totalPurchases === 1 ? (
                    <>
                      <Text
                        style="h5"
                        css={{ textAlign: 'center', mt: 24, mb: 24 }}
                      >
                        Congratulations!
                      </Text>
                    </>
                  ) : (
                    <>
                      <Box
                        css={{
                          color: failedPurchases
                            ? '$errorAccent'
                            : '$successAccent',
                        }}
                      >
                        <FontAwesomeIcon
                          icon={
                            failedPurchases
                              ? faCircleExclamation
                              : faCheckCircle
                          }
                          fontSize={32}
                        />
                      </Box>
                      <Text
                        style="h5"
                        css={{ textAlign: 'center', mt: 24, mb: 24 }}
                      >
                        {failedPurchases
                          ? `${successfulPurchases} ${
                              successfulPurchases > 1 ? 'items' : 'item'
                            } purchased, ${failedPurchases} ${
                              failedPurchases > 1 ? 'items' : 'item'
                            } failed`
                          : 'Congrats! Purchase was successful.'}
                      </Text>
                    </>
                  )}
                  {totalPurchases === 1 && (
                    <img
                      src={tokenData?.token?.imageSmall}
                      style={{ width: 100, height: 100 }}
                    />
                  )}
                  {totalPurchases > 1 && (
                    <Flex direction="column" css={{ gap: '$2' }}>
                      {stepData?.currentStep?.items?.map((item, itemIndex) => {
                        if (
                          Array.isArray(item?.txHashes) &&
                          item?.txHashes.length > 0
                        ) {
                          return item.txHashes.map((hash, txHashIndex) => {
                            const truncatedTxHash = truncateAddress(hash.txHash)
                            const blockExplorerBaseUrl =
                              getChainBlockExplorerUrl(hash.chainId)
                            return (
                              <Anchor
                                key={`${itemIndex}-${txHashIndex}`}
                                href={`${blockExplorerBaseUrl}/tx/${hash.txHash}`}
                                color="primary"
                                weight="medium"
                                target="_blank"
                                css={{ fontSize: 12 }}
                              >
                                View transaction: {truncatedTxHash}
                              </Anchor>
                            )
                          })
                        } else {
                          return null
                        }
                      })}
                    </Flex>
                  )}

                  {totalPurchases === 1 && (
                    <>
                      <Flex
                        css={{ mb: 24, mt: 24, maxWidth: '100%' }}
                        align="center"
                        justify="center"
                      >
                        {!!tokenData?.token?.collection?.image && (
                          <Box css={{ mr: '$1' }}>
                            <img
                              src={tokenData?.token?.collection?.image}
                              style={{
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                              }}
                            />
                          </Box>
                        )}
                        <Text
                          style="subtitle3"
                          css={{ maxWidth: '100%' }}
                          ellipsify
                        >
                          {tokenData?.token?.name
                            ? tokenData?.token?.name
                            : `#${tokenData?.token?.tokenId}`}
                        </Text>
                      </Flex>
                      <Flex css={{ mb: '$2' }} align="center">
                        <Box css={{ color: '$successAccent', mr: '$2' }}>
                          <FontAwesomeIcon icon={faCheckCircle} />
                        </Box>
                        <Text style="body1">
                          Your transaction went through successfully
                        </Text>
                      </Flex>

                      <Flex
                        direction="column"
                        align="center"
                        css={{ gap: '$2' }}
                      >
                        {finalTxHashes?.map((hash, index) => {
                          const truncatedTxHash = truncateAddress(hash.txHash)
                          const blockExplorerBaseUrl = getChainBlockExplorerUrl(
                            hash.chainId
                          )
                          return (
                            <Anchor
                              key={index}
                              href={`${blockExplorerBaseUrl}/tx/${hash.txHash}`}
                              color="primary"
                              weight="medium"
                              target="_blank"
                              css={{ fontSize: 12 }}
                            >
                              View transaction: {truncatedTxHash}
                            </Anchor>
                          )
                        })}
                      </Flex>
                    </>
                  )}
                </Flex>
                <Flex
                  css={{
                    p: '$4',
                    flexDirection: 'column',
                    gap: '$3',
                    '@bp1': {
                      flexDirection: 'row',
                    },
                  }}
                >
                  {!!onGoToToken ? (
                    <>
                      <Button
                        onClick={() => {
                          setOpen(false)
                        }}
                        css={{ flex: 1 }}
                        color="ghost"
                      >
                        {copy.ctaClose}
                      </Button>
                      <Button
                        style={{ flex: 1 }}
                        color="primary"
                        onClick={() => {
                          onGoToToken()
                        }}
                      >
                        {copy.ctaGoToToken.length > 0
                          ? copy.ctaGoToToken
                          : `Go to ${
                              successfulPurchases > 1 ? 'Tokens' : 'Token'
                            }`}
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => {
                        setOpen(false)
                      }}
                      style={{ flex: 1 }}
                      color="primary"
                    >
                      {copy.ctaClose}
                    </Button>
                  )}
                </Flex>
              </Flex>
            )}
          </Modal>
        )
      }}
    </BuyModalRenderer>
  )
}

BuyModal.Custom = BuyModalRenderer
