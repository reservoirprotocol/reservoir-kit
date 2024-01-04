import React, {
  ComponentPropsWithoutRef,
  Dispatch,
  ReactElement,
  SetStateAction,
  useEffect,
} from 'react'
import { WalletClient, formatUnits } from 'viem'
import { ReservoirWallet } from '@reservoir0x/reservoir-sdk'
import { useFallbackState, useReservoirClient } from '../../hooks'
import { Modal } from '../Modal'
import {
  SweepModalRenderer,
  SweepModalStepData,
  SweepStep,
} from './SweepModalRenderer'
import {
  Anchor,
  Box,
  Button,
  CryptoCurrencyIcon,
  ErrorWell,
  Flex,
  FormatCryptoCurrency,
  Loader,
  Text,
} from '../../primitives'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheckCircle,
  faChevronLeft,
  faChevronRight,
  faCircleExclamation,
  faCube,
  faMagnifyingGlass,
  faPenNib,
  faWallet,
} from '@fortawesome/free-solid-svg-icons'
import { formatNumber } from '../../lib/numbers'
import { Path } from '../../components/cart/CartCheckoutModal'
import QuantitySelector from '../QuantitySelector'
import { CurrentStepTxHashes } from '../CurrentStepTxHashes'
import SigninStep from '../SigninStep'
import { ApprovePurchasingCollapsible } from '../ApprovePurchasingCollapsible'
import { truncateAddress } from '../../lib/truncate'
import getChainBlockExplorerUrl from '../../lib/getChainBlockExplorerUrl'
import { TokenInfo } from '../TokenInfo'
import { CollectionInfo } from '../CollectionInfo'
import { PurchaseCheckout } from '../PurchaseCheckout'
import { PaymentDetails } from '../../common/PaymentDetails'
import { Dialog } from '../../primitives/Dialog'
import { SelectPaymentTokenv2 } from '../SelectPaymentTokenv2'

export type SweepCallbackData = {
  collectionId?: string
  maker?: string
  stepData: SweepModalStepData | null
}

export const SweepModalCopy = {
  ctaConnect: 'Connect',
  sweepTitle: 'Sweep',
  sweepCtaClose: 'Close',
  sweepCtaBuy: 'Sweep',
  sweepCtaBuyDisabled: 'Sweep',
  sweepCtaInsufficientFunds: 'Add Funds to Purchase',
  sweepCtaAwaitingApproval: 'Waiting for approval...',
  sweepCtaAwaitingValidation: 'Waiting to be validated...',
  sweepCtaGoToToken: '',
}

type Props = Pick<Parameters<typeof Modal>['0'], 'trigger'> & {
  openState?: [boolean, Dispatch<SetStateAction<boolean>>]
  contract?: string
  collectionId?: string
  token?: string
  defaultQuantity?: number
  onConnectWallet: () => void
  feesOnTopBps?: string[] | null
  feesOnTopUsd?: string[] | null
  chainId?: number
  copyOverrides?: Partial<typeof SweepModalCopy>
  walletClient?: ReservoirWallet | WalletClient
  normalizeRoyalties?: boolean
  usePermit?: boolean
  onSweepComplete?: (data: SweepCallbackData) => void
  onSweepError?: (error: Error, data: SweepCallbackData) => void
  onClose?: (data: SweepCallbackData, currentStep: SweepStep) => void
  onGoToToken?: (data: SweepCallbackData) => any
  onPointerDownOutside?: ComponentPropsWithoutRef<
    typeof Dialog
  >['onPointerDownOutside']
}

export function SweepModal({
  openState,
  trigger,
  contract,
  collectionId,
  token,
  chainId,
  feesOnTopBps,
  feesOnTopUsd,
  copyOverrides,
  walletClient,
  normalizeRoyalties,
  usePermit,
  onSweepComplete,
  onSweepError,
  onClose,
  onConnectWallet,
  onGoToToken,
  onPointerDownOutside,
  defaultQuantity,
}: Props): ReactElement {
  const copy: typeof SweepModalCopy = {
    ...SweepModalCopy,
    ...copyOverrides,
  }
  const [open, setOpen] = useFallbackState(
    openState ? openState[0] : false,
    openState
  )

  const client = useReservoirClient()

  const currentChain = client?.currentChain()

  const modalChain = chainId
    ? client?.chains.find(({ id }) => id === chainId) || currentChain
    : currentChain

  return (
    <SweepModalRenderer
      onConnectWallet={onConnectWallet}
      chainId={modalChain?.id}
      defaultQuantity={defaultQuantity}
      open={open}
      contract={contract}
      collectionId={collectionId}
      token={token}
      feesOnTopBps={feesOnTopBps}
      feesOnTopUsd={feesOnTopUsd}
      walletClient={walletClient}
      normalizeRoyalties={normalizeRoyalties}
      usePermit={usePermit}
    >
      {({
        loading,
        isFetchingPath,
        collection,
        token,
        orders,
        totalIncludingFees,
        averageUnitPrice,
        selectedTokens,
        feeOnTop,
        feeUsd,
        paymentTokens,
        paymentCurrency,
        setPaymentCurrency,
        addFundsLink,
        chainCurrency,
        itemAmount,
        setItemAmount,
        maxItemAmount,
        setMaxItemAmount,
        usdPrice,
        usdPriceRaw,
        currentChain,
        address,
        isConnected,
        disableJumperLink,
        balance,
        hasEnoughCurrency,
        transactionError,
        stepData,
        sweepStep,
        setStepData,
        setSweepStep,
        sweepTokens,
      }) => {
        useEffect(() => {
          if (sweepStep === SweepStep.Complete && onSweepComplete) {
            const data: SweepCallbackData = {
              collectionId: collection?.id,
              maker: address,
              stepData,
            }

            onSweepComplete(data)
          }
        }, [sweepStep])

        useEffect(() => {
          if (transactionError && onSweepError) {
            const data: SweepCallbackData = {
              collectionId: collection?.id,
              maker: address,
              stepData,
            }
            onSweepError(transactionError, data)
          }
        }, [transactionError])

        const hasTokens = orders && orders.length > 0

        const maxQuantity = paymentCurrency?.maxItems
          ? paymentCurrency?.maxItems
          : maxItemAmount

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

        const totalSales =
          stepData?.currentStep?.items?.reduce((total, item) => {
            item.transfersData?.forEach((transferData) => {
              total += Number(transferData.amount || 1)
            })
            return total
          }, 0) || 0

        const failedSales = itemAmount - totalSales
        const successfulSales = itemAmount - failedSales

        return (
          <Modal
            trigger={trigger}
            title={copy.sweepTitle}
            open={open}
            loading={loading}
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
                const data: SweepCallbackData = {
                  collectionId: collection?.id,
                  maker: address,
                  stepData,
                }
                onClose(data, sweepStep)
              }
              setOpen(open)
            }}
          >
            {(!loading && !hasTokens) ||
            (maxItemAmount === 0 && sweepStep === SweepStep.Idle) ? (
              <Flex
                direction="column"
                align="center"
                css={{ width: '100%', p: '$4' }}
              >
                <Flex
                  direction="column"
                  align="center"
                  css={{ pt: 28, pb: 48, px: '$4', gap: 28 }}
                >
                  <Box css={{ color: '$neutralSolid' }}>
                    <FontAwesomeIcon
                      icon={faMagnifyingGlass}
                      style={{
                        width: '36px',
                        height: '32px',
                      }}
                    />
                  </Box>
                  <Text style="h6" css={{ textAlign: 'center' }}>
                    No available items were found for this collection.
                  </Text>
                </Flex>
                <Button css={{ width: '100%' }} onClick={() => setOpen(false)}>
                  {copy.sweepCtaClose}
                </Button>
              </Flex>
            ) : null}

            {!loading &&
              hasTokens &&
              maxItemAmount !== 0 &&
              sweepStep === SweepStep.Idle && (
                <Flex direction="column">
                  <Flex
                    direction="column"
                    css={{ borderBottom: '1px solid $neutralBorder' }}
                  >
                    {transactionError ? (
                      <ErrorWell error={transactionError} />
                    ) : null}
                    <Flex direction="column" css={{ p: '$4', gap: 10 }}>
                      {token ? (
                        <TokenInfo token={token} collection={collection} />
                      ) : (
                        <CollectionInfo collection={collection} />
                      )}
                      <Flex
                        align="center"
                        justify="between"
                        css={{ gap: 24, '@bp1': { gap: '$6' }, mt: '$1' }}
                      >
                        <Flex
                          direction="column"
                          align="start"
                          css={{
                            gap: '$1',
                            overflow: 'hidden',
                            flexShrink: 0,
                            maxWidth: 200,
                          }}
                        >
                          <Text style="subtitle2">Quantity</Text>
                          <Text
                            style="body3"
                            color="subtle"
                            ellipsify
                            css={{ width: '100%' }}
                          >
                            {formatNumber(maxQuantity)}{' '}
                            {maxQuantity === 1 ? 'item' : 'items'} available
                          </Text>
                        </Flex>
                        <QuantitySelector
                          quantity={itemAmount}
                          setQuantity={setItemAmount}
                          min={1}
                          max={maxQuantity}
                          css={{
                            width: '100%',
                            justifyContent: 'space-between',
                            minWidth: 200,
                          }}
                        />
                      </Flex>
                      {itemAmount > 1 && averageUnitPrice ? (
                        <Flex justify="end" css={{ gap: '$3' }}>
                          <Flex align="center" css={{ gap: '$2' }}>
                            <Text style="subtitle3" color="subtle">
                              Avg Item Price
                            </Text>
                            <FormatCryptoCurrency
                              chainId={chainId}
                              amount={averageUnitPrice}
                              address={paymentCurrency?.address}
                              decimals={paymentCurrency?.decimals}
                              symbol={paymentCurrency?.name}
                              maximumFractionDigits={2}
                            />
                          </Flex>
                        </Flex>
                      ) : null}
                    </Flex>
                  </Flex>
                  <Flex direction="column" css={{ pb: '$2' }}>
                    {paymentTokens.length > 1 ? (
                      <Flex
                        direction="column"
                        css={{
                          gap: '$2',
                          py: '$3',
                          px: '$4',
                          borderRadius: '$3',
                          borderBottom: '1px solid $neutralBorder',
                          '&:hover': {
                            backgroundColor: '$neutralBgHover',
                          },
                        }}
                        onClick={() => setSweepStep(SweepStep.SelectPayment)}
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
                              <FontAwesomeIcon
                                icon={faChevronRight}
                                width={10}
                              />
                            </Box>
                          </Flex>
                        </Flex>
                      </Flex>
                    ) : null}
                    <PaymentDetails
                      chainId={chainId}
                      paymentCurrency={paymentCurrency}
                      feeOnTop={feeOnTop}
                      feeUsd={feeUsd}
                      loading={isFetchingPath}
                      css={{ pt: '$4' }}
                    />
                  </Flex>
                  {hasEnoughCurrency || !isConnected ? (
                    <Button
                      css={{ m: '$4' }}
                      disabled={
                        !(selectedTokens.length > 0) ||
                        (!hasEnoughCurrency && isConnected)
                      }
                      onClick={sweepTokens}
                    >
                      {!isConnected
                        ? copy.ctaConnect
                        : selectedTokens.length > 0
                        ? copy.sweepCtaBuy
                        : copy.sweepCtaBuyDisabled}
                    </Button>
                  ) : (
                    <Flex direction="column" align="center" css={{ px: '$3' }}>
                      <Flex align="center">
                        <Text css={{ mr: '$3' }} color="error" style="body3">
                          Insufficient Balance
                          {paymentTokens.length > 1
                            ? ', select another token or add funds'
                            : null}
                        </Text>

                        <FormatCryptoCurrency
                          chainId={chainId}
                          amount={paymentCurrency?.balance}
                          address={paymentCurrency?.address}
                          decimals={paymentCurrency?.decimals}
                          symbol={paymentCurrency?.name}
                          textStyle="body3"
                        />
                      </Flex>
                      <Button
                        disabled={disableJumperLink}
                        onClick={() => {
                          window.open(addFundsLink, '_blank')
                        }}
                        css={{ width: '100%', my: '$4' }}
                      >
                        {disableJumperLink
                          ? copy.sweepCtaBuy
                          : copy.sweepCtaInsufficientFunds}
                      </Button>
                    </Flex>
                  )}
                </Flex>
              )}

            {!loading && sweepStep === SweepStep.SelectPayment && (
              <Flex direction="column" css={{ py: 20 }}>
                <Flex align="center" css={{ gap: '$2', px: '$4' }}>
                  <Button
                    onClick={() => setSweepStep(SweepStep.Idle)}
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
                  goBack={() => setSweepStep(SweepStep.Idle)}
                  itemAmount={itemAmount}
                  chainId={modalChain?.id || 1}
                />
              </Flex>
            )}

            {sweepStep === SweepStep.Approving && (
              <Flex direction="column">
                <Box
                  css={{
                    p: '$4',
                    borderBottom: '1px solid $neutralBorder',
                  }}
                >
                  <PurchaseCheckout
                    chainId={chainId}
                    collection={collection}
                    token={token}
                    itemCount={itemAmount}
                    totalPrice={
                      (paymentCurrency?.currencyTotalRaw || 0n) + feeOnTop
                    }
                    currency={paymentCurrency}
                    usdTotalFormatted={formatUnits(
                      ((paymentCurrency?.currencyTotalRaw || 0n) + feeOnTop) *
                        (paymentCurrency?.usdPriceRaw || 0n),
                      (paymentCurrency?.decimals || 18) + 6
                    )}
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
                  stepData.currentStep.id !== 'auth' &&
                  stepData.currentStep.id !== 'sale' ? (
                    <>
                      <Flex
                        css={{ color: '$neutralText', py: '$5' }}
                        direction="column"
                        justify="center"
                        align="center"
                      >
                        <Text
                          style="h6"
                          color="base"
                          css={{ mb: '$2', textAlign: 'center' }}
                        >
                          {stepData.currentStep.action}{' '}
                          {stepData?.currentStep?.items &&
                          stepData.currentStep.items.length > 1
                            ? `(${
                                stepData.currentStep.items.filter(
                                  (item) => item.status === 'complete'
                                ).length
                              }/${stepData.currentStep.items.length})`
                            : null}
                        </Text>
                        <Text
                          style="subtitle3"
                          color="subtle"
                          css={{ mb: 20, textAlign: 'center' }}
                        >
                          {stepData.currentStep.description}
                        </Text>
                        <FontAwesomeIcon
                          icon={faPenNib}
                          width={32}
                          height={32}
                          style={{ height: 32 }}
                        />
                      </Flex>
                      <CurrentStepTxHashes
                        currentStep={stepData?.currentStep}
                      />
                      <Button disabled={true} css={{ mt: '$4', width: '100%' }}>
                        <Loader />
                        {copy.sweepCtaAwaitingApproval}
                      </Button>
                    </>
                  ) : null}

                  {stepData?.currentStep &&
                  stepData.currentStep.id === 'auth' ? (
                    <>
                      <SigninStep css={{ mt: 48, mb: '$4', gap: 20 }} />
                      <Button disabled={true} css={{ mt: '$4', width: '100%' }}>
                        <Loader />
                        {copy.sweepCtaAwaitingApproval}
                      </Button>
                    </>
                  ) : null}

                  {stepData?.currentStep &&
                  stepData?.currentStep?.id === 'sale' ? (
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
                          <Text style="subtitle3" color="subtle">
                            The purchase of these items needs to be split into{' '}
                            {stepData?.currentStep?.items.length} separate
                            transactions.
                          </Text>
                          {stepData?.currentStep?.items.map((item, idx) => (
                            <ApprovePurchasingCollapsible
                              key={idx}
                              item={item}
                              pathMap={pathMap}
                              usdPrice={+usdPrice}
                              chain={currentChain}
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
                          <CurrentStepTxHashes
                            currentStep={stepData?.currentStep}
                          />
                          <Button
                            disabled={true}
                            css={{ mt: '$4', width: '100%' }}
                          >
                            <Loader />
                            {copy.sweepCtaAwaitingApproval}
                          </Button>
                        </Flex>
                      )}
                    </>
                  ) : null}
                </Flex>
              </Flex>
            )}

            {sweepStep === SweepStep.Finalizing && (
              <Flex direction="column">
                <Box
                  css={{
                    p: '$4',
                    borderBottom: '1px solid $neutralBorder',
                  }}
                >
                  <PurchaseCheckout
                    chainId={chainId}
                    collection={collection}
                    token={token}
                    itemCount={itemAmount}
                    totalPrice={
                      (paymentCurrency?.currencyTotalRaw || 0n) + feeOnTop
                    }
                    currency={paymentCurrency}
                    usdTotalFormatted={formatUnits(
                      ((paymentCurrency?.currencyTotalRaw || 0n) + feeOnTop) *
                        (paymentCurrency?.usdPriceRaw || 0n),
                      (paymentCurrency?.decimals || 18) + 6
                    )}
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
                    style="subtitle3"
                    color="subtle"
                    css={{ textAlign: 'center' }}
                  >
                    You can close this modal while it finalizes on the
                    blockchain. The transaction will continue in the background.
                  </Text>
                  <Box css={{ color: '$neutralSolid' }}>
                    <FontAwesomeIcon
                      icon={faCube}
                      style={{ width: 32, height: 32 }}
                    />
                  </Box>
                </Flex>
                <CurrentStepTxHashes currentStep={stepData?.currentStep} />
                <Button disabled={true} css={{ m: '$4' }}>
                  <Loader />
                  {copy.sweepCtaAwaitingValidation}
                </Button>
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
                      color: failedSales ? '$errorAccent' : '$successAccent',
                    }}
                  >
                    <FontAwesomeIcon
                      icon={failedSales ? faCircleExclamation : faCheckCircle}
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
                    {stepData?.currentStep?.items?.map((item, itemIndex) => {
                      if (
                        Array.isArray(item?.txHashes) &&
                        item?.txHashes.length > 0
                      ) {
                        return item.txHashes.map((hash, txHashIndex) => {
                          const truncatedTxHash = truncateAddress(hash.txHash)
                          const blockExplorerBaseUrl = getChainBlockExplorerUrl(
                            hash.chainId
                          )
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
                </Flex>
                <Flex css={{ width: '100%' }}>
                  {!!onGoToToken ? (
                    <>
                      <Button
                        onClick={() => {
                          setOpen(false)
                        }}
                        css={{ flex: 1 }}
                        color="ghost"
                      >
                        {copy.sweepCtaClose}
                      </Button>
                      <Button
                        style={{ flex: 1 }}
                        color="primary"
                        onClick={() => {
                          onGoToToken({
                            collectionId: collection?.id,
                            maker: address,
                            stepData,
                          })
                        }}
                      >
                        {copy.sweepCtaGoToToken.length > 0
                          ? copy.sweepCtaGoToToken
                          : `View ${successfulSales > 1 ? 'Tokens' : 'Token'}`}
                      </Button>
                    </>
                  ) : (
                    <Button
                      css={{ width: '100%' }}
                      onClick={() => setOpen(false)}
                    >
                      {copy.sweepCtaClose}
                    </Button>
                  )}
                </Flex>
              </Flex>
            )}
          </Modal>
        )
      }}
    </SweepModalRenderer>
  )
}

SweepModal.Custom = SweepModalRenderer
