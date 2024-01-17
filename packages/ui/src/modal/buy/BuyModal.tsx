import React, {
  ComponentPropsWithoutRef,
  Dispatch,
  ReactElement,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react'
import {
  useCreditCardProvider,
  useFallbackState,
  useReservoirClient,
} from '../../hooks'
import {
  Flex,
  Box,
  Text,
  Anchor,
  Button,
  FormatCryptoCurrency,
  Loader,
  ErrorWell,
  CryptoCurrencyIcon,
  FormatCurrency,
} from '../../primitives'
import Progress from '../Progress'
import { Modal } from '../Modal'
import {
  faCircleExclamation,
  faCheckCircle,
  faChevronLeft,
  faChevronRight,
  faImage,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { BuyModalRenderer, BuyStep, BuyModalStepData } from './BuyModalRenderer'
import { Execute, ReservoirWallet } from '@reservoir0x/reservoir-sdk'
import ProgressBar from '../ProgressBar'
import QuantitySelector from '../QuantitySelector'
import { formatNumber } from '../../lib/numbers'
import { ProviderOptionsContext } from '../../ReservoirKitProvider'
import { truncateAddress } from '../../lib/truncate'
import { WalletClient } from 'viem'
import getChainBlockExplorerUrl from '../../lib/getChainBlockExplorerUrl'
import { Dialog } from '../../primitives/Dialog'
import { CreditCardProviders } from '../../hooks/useCreditCardProvider'
import { SelectPaymentToken } from '../SelectPaymentToken'
import TokenLineItem from '../TokenLineItem'
import CreditCardErrorWell from '../../components/CreditCard/ErrorWell'

type PurchaseData = {
  tokenId?: string
  collectionId?: string
  maker?: string
  steps?: Execute['steps']
}

const ModalCopy = {
  titleInsufficientFunds: 'Add Funds',
  titleUnavilable: 'Selected item is no longer Available',
  titleIsOwner: 'You already own this token',
  titleDefault: 'Complete Checkout',
  ctaClose: 'Close',
  ctaCheckout: 'Checkout',
  ctaCheckoutWithCreditCard: 'Checkout with a Credit Card',
  ctaConnect: 'Connect',
  ctaInsufficientFunds: 'Add Funds',
  ctaGoToToken: '',
  ctaAwaitingValidation: 'Waiting for transaction to be validated',
  ctaAwaitingApproval: 'Waiting for approval...',
  ctaCopyAddress: 'Copy Wallet Address',
}

type Props = Pick<Parameters<typeof Modal>['0'], 'trigger'> & {
  openState?: [boolean, Dispatch<SetStateAction<boolean>>]
  creditCardCheckoutComponent?: JSX.Element
  tokenId?: string
  collectionId?: string
  chainId?: number
  defaultQuantity?: number
  orderId?: string
  feesOnTopBps?: string[] | null
  feesOnTopUsd?: string[] | null
  normalizeRoyalties?: boolean
  copyOverrides?: Partial<typeof ModalCopy>
  walletClient?: ReservoirWallet | WalletClient
  usePermit?: boolean
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

function titleForStep(
  step: BuyStep,
  copy: typeof ModalCopy,
  isLoading: boolean,
  isOwner: boolean
) {
  if (isLoading) {
    return copy.titleDefault
  }

  switch (step) {
    case BuyStep.Unavailable:
      return isOwner ? copy.titleIsOwner : copy.titleUnavilable
    default:
      return copy.titleDefault
  }
}

export function BuyModal({
  openState,
  trigger,
  tokenId,
  chainId,
  collectionId,
  orderId,
  feesOnTopBps,
  feesOnTopUsd,
  normalizeRoyalties,
  defaultQuantity,
  copyOverrides,
  walletClient,
  usePermit,
  onConnectWallet,
  onPurchaseComplete,
  onPurchaseError,
  onClose,
  onGoToToken,
  onPointerDownOutside,
  creditCardCheckoutComponent,
}: Props): ReactElement {
  const copy: typeof ModalCopy = { ...ModalCopy, ...copyOverrides }
  const [open, setOpen] = useFallbackState(
    openState ? openState[0] : false,
    openState
  )

  const [creditCardCheckoutProvider, setCreditCardCheckoutProvider] =
    useState<CreditCardProviders | null>(null)
  const [creditCardCheckoutStatus, setCreditCardCheckoutStatus] = useState<
    string | null
  >(null)

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
      defaultQuantity={defaultQuantity}
      tokenId={tokenId}
      collectionId={collectionId}
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
        token,
        collection,
        quantityAvailable,
        quantity,
        averageUnitPrice,
        totalPrice,
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
        gasCost,
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
        const title = titleForStep(buyStep, copy, loading, isOwner)

        useEffect(() => {
          if (buyStep === BuyStep.Complete && onPurchaseComplete) {
            const data: PurchaseData = {
              tokenId: tokenId,
              collectionId: collectionId,
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
              tokenId: tokenId,
              collectionId: collectionId,
              maker: address,
            }
            onPurchaseError(transactionError, data)
          }
        }, [transactionError])

        const executableSteps =
          steps?.filter((step) => step.items && step.items.length > 0) || []
        const lastStepItems =
          executableSteps[executableSteps.length - 1]?.items || []

        const totalPurchases = creditCardCheckoutStatus
          ? 1
          : stepData?.currentStep?.items?.reduce((total, item) => {
              item.transfersData?.forEach((transferData) => {
                total += Number(transferData.amount || 1)
              })
              return total
            }, 0) || 0

        const failedPurchases =
          creditCardCheckoutStatus === 'PROCESSING_ERROR'
            ? 1
            : quantity - totalPurchases
        const successfulPurchases =
          creditCardCheckoutStatus === 'TRANSFER_SUCCEEDED'
            ? 1
            : quantity - failedPurchases
        const finalTxHashes = lastStepItems[lastStepItems.length - 1]?.txHashes

        const price =
          totalPrice || BigInt(token?.token?.lastSale?.price?.amount?.raw || 0)

        const CreditCardCheckoutComponent = useCreditCardProvider({
          creditCardCheckoutComponent,
          callback: (provider, status) => {
            setCreditCardCheckoutProvider(provider)
            setCreditCardCheckoutStatus(status)
            switch (status) {
              case 'PROCESSING_ERROR':
                setBuyStep(BuyStep.Complete)
                break
              case 'TRANSFER_SUCCEEDED':
                setBuyStep(BuyStep.Complete)
                break
              case 'PAYMENT_SUCCEEDED':
                setBuyStep(BuyStep.CreditCardCheckoutProgress)
              default:
                break
            }
          },
        })

        return (
          <Modal
            trigger={trigger}
            title={title}
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
                  tokenId: tokenId,
                  collectionId: collectionId,
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
                <TokenLineItem
                  chain={modalChain}
                  tokenDetails={token}
                  collection={collection}
                  usdPrice={paymentCurrency?.usdTotalFormatted}
                  isUnavailable={true}
                  price={quantity > 1 ? averageUnitPrice : price}
                  currency={paymentCurrency}
                  priceSubtitle={quantity > 1 ? 'Average Price' : undefined}
                  showRoyalties={true}
                />
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
              <Flex direction="column" css={{ py: 20 }}>
                <Flex align="center" css={{ gap: '$2', px: '$4' }}>
                  <Button
                    onClick={() => setBuyStep(BuyStep.Checkout)}
                    color="ghost"
                    size="xs"
                    css={{ color: '$neutralSolidHover' }}
                  >
                    <FontAwesomeIcon icon={faChevronLeft} width={10} />
                  </Button>
                  <Text style="subtitle2">Select A Token</Text>
                </Flex>
                <SelectPaymentToken
                  paymentTokens={paymentTokens}
                  currency={paymentCurrency}
                  setCurrency={setPaymentCurrency}
                  goBack={() => setBuyStep(BuyStep.Checkout)}
                  itemAmount={quantity}
                />
              </Flex>
            )}

            {buyStep === BuyStep.Checkout && !loading && (
              <Flex direction="column">
                {transactionError && <ErrorWell error={transactionError} />}
                <TokenLineItem
                  chain={modalChain}
                  tokenDetails={token}
                  collection={collection}
                  usdPrice={paymentCurrency?.usdTotalFormatted}
                  price={quantity > 1 ? averageUnitPrice : price}
                  currency={paymentCurrency}
                  css={{ border: 0 }}
                  priceSubtitle={quantity > 1 ? 'Average Price' : undefined}
                  showRoyalties={true}
                />
                {quantityAvailable > 1 && (
                  <Flex
                    css={{ p: '$4', borderBottom: '1px solid $borderColor' }}
                    justify="between"
                  >
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
                  css={{ pt: '$4', pb: '$2', gap: '$4' }}
                >
                  {paymentTokens.length > 1 ? (
                    <Flex
                      direction="column"
                      css={{
                        gap: '$2',
                        py: '$3',
                        px: '$4',
                        borderRadius: '$3',
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
                            <CryptoCurrencyIcon
                              address={paymentCurrency?.address as string}
                              css={{ width: 16, height: 16, mr: '$1' }}
                            />
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
                  {feeOnTop > 0 && (
                    <Flex
                      justify="between"
                      align="start"
                      css={{ px: '$4', py: '$3', width: '100%' }}
                    >
                      <Text style="subtitle3">Referral Fee</Text>
                      <Flex direction="column" align="end" css={{ gap: '$1' }}>
                        <FormatCryptoCurrency
                          chainId={chainId}
                          amount={feeOnTop}
                          address={paymentCurrency?.address}
                          decimals={paymentCurrency?.decimals}
                          symbol={paymentCurrency?.name}
                        />
                        <FormatCurrency
                          amount={feeUsd}
                          color="subtle"
                          style="tiny"
                        />
                      </Flex>
                    </Flex>
                  )}
                  <Flex
                    justify="between"
                    align="start"
                    css={{ height: 34, px: '$4' }}
                  >
                    <Text style="h6">You Pay</Text>
                    <Flex direction="column" align="end" css={{ gap: '$1' }}>
                      {providerOptions.preferDisplayFiatTotal ? (
                        <>
                          <FormatCurrency
                            amount={paymentCurrency?.usdTotalPriceRaw}
                            style="h6"
                            color="base"
                          />
                          <FormatCryptoCurrency
                            chainId={chainId}
                            textStyle="tiny"
                            textColor="subtle"
                            amount={paymentCurrency?.currencyTotalRaw}
                            address={paymentCurrency?.address}
                            decimals={paymentCurrency?.decimals}
                            symbol={paymentCurrency?.symbol}
                            logoWidth={12}
                          />
                        </>
                      ) : (
                        <>
                          <FormatCryptoCurrency
                            chainId={chainId}
                            textStyle="h6"
                            textColor="base"
                            amount={paymentCurrency?.currencyTotalRaw}
                            address={paymentCurrency?.address}
                            decimals={paymentCurrency?.decimals}
                            symbol={paymentCurrency?.symbol}
                            logoWidth={18}
                          />
                          <FormatCurrency
                            amount={paymentCurrency?.usdTotalPriceRaw}
                            style="tiny"
                            color="subtle"
                          />
                        </>
                      )}
                    </Flex>
                  </Flex>
                </Flex>

                <Flex
                  direction="column"
                  css={{ p: '$4', width: '100%', gap: '$2' }}
                >
                  {hasEnoughCurrency || !isConnected ? (
                    <Flex direction="column">
                      <Button
                        disabled={!hasEnoughCurrency && isConnected}
                        onClick={buyToken}
                        css={{ width: '100%' }}
                        color="primary"
                      >
                        {!isConnected ? copy.ctaConnect : copy.ctaCheckout}
                      </Button>
                    </Flex>
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

                      {gasCost > 0n && (
                        <Flex align="center">
                          <Text css={{ mr: '$3' }} color="error" style="body3">
                            Estimated Gas Cost
                          </Text>
                          <FormatCryptoCurrency
                            chainId={chainId}
                            amount={gasCost}
                            address={paymentCurrency?.address}
                            decimals={paymentCurrency?.decimals}
                            symbol={paymentCurrency?.symbol}
                            textStyle="body3"
                          />
                        </Flex>
                      )}

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
                  {creditCardCheckoutComponent && (
                    <Button
                      onClick={() => setBuyStep(BuyStep.CreditCardCheckout)}
                      css={{ width: '100%' }}
                      color="primary"
                    >
                      {copy.ctaCheckoutWithCreditCard}
                    </Button>
                  )}
                </Flex>
              </Flex>
            )}

            {CreditCardCheckoutComponent &&
              buyStep === BuyStep.CreditCardCheckout &&
              !loading && (
                <Flex
                  align="center"
                  justify="center"
                  css={{
                    padding: '$3',
                    width: '100%',
                    'div iframe': {
                      border: 'none',
                    },
                  }}
                >
                  {CreditCardCheckoutComponent}
                </Flex>
              )}

            {CreditCardCheckoutComponent &&
              buyStep === BuyStep.CreditCardCheckoutProgress &&
              !loading && (
                <Flex direction="column">
                  <TokenLineItem
                    chain={modalChain}
                    tokenDetails={token}
                    collection={collection}
                    usdPrice={paymentCurrency?.usdTotalFormatted}
                    price={quantity > 1 ? averageUnitPrice : price}
                    currency={paymentCurrency}
                    css={{ border: 0 }}
                    priceSubtitle={quantity > 1 ? 'Average Price' : undefined}
                    showRoyalties={true}
                  />

                  <Flex
                    direction="column"
                    css={{
                      borderTop: '1px solid $borderColor',
                      textAlign: 'center',
                      gap: '$4',
                      pt: '$5',
                      pb: '24px',
                      px: '$4',
                    }}
                  >
                    <Text style="h6">Processing Transaction</Text>
                    <Text color="subtle" style="subtitle2">
                      {creditCardCheckoutProvider} has confirmed your payment.
                      Your purchase is being processed and will be confirmed on
                      the blockchain shortly.
                    </Text>
                    <FontAwesomeIcon
                      color="#889096"
                      fontSize={32}
                      icon={faImage}
                    />
                  </Flex>
                  <Flex
                    css={{
                      p: '$4',
                    }}
                  >
                    <Button disabled={true} css={{ m: '$4', w: '100%' }}>
                      <Loader />
                      Finalizing Transaction
                    </Button>
                  </Flex>
                </Flex>
              )}

            {buyStep === BuyStep.Approving && token && (
              <Flex direction="column">
                <TokenLineItem
                  chain={modalChain}
                  tokenDetails={token}
                  collection={collection}
                  usdPrice={paymentCurrency?.usdTotalFormatted}
                  price={quantity > 1 ? averageUnitPrice : price}
                  currency={paymentCurrency}
                  priceSubtitle={quantity > 1 ? 'Average Price' : undefined}
                  quantity={quantity}
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
                      {creditCardCheckoutStatus === 'PROCESSING_ERROR' ? (
                        <CreditCardErrorWell
                          provider={
                            creditCardCheckoutProvider as CreditCardProviders
                          }
                          txHash={''}
                          token={token.token}
                        />
                      ) : (
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
                      )}
                    </>
                  )}
                  {totalPurchases === 1 && (
                    <img
                      src={token?.token?.imageSmall}
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
                        {!!token.token?.collection?.image && (
                          <Box css={{ mr: '$1' }}>
                            <img
                              src={token.token?.collection?.image}
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
                          {token?.token?.name
                            ? token?.token?.name
                            : `#${token?.token?.tokenId}`}
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
