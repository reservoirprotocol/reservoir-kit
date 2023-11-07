import React, { FC } from 'react'
import { ChildrenProps, CollectStep } from '../CollectModalRenderer'
import {
  Anchor,
  Box,
  Button,
  CryptoCurrencyIcon,
  ErrorWell,
  Flex,
  FormatCryptoCurrency,
  FormatCurrency,
  Loader,
  Text,
} from '../../../primitives'
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
import QuantitySelector from '../../QuantitySelector'
import { CollectModalCopy } from '../CollectModal'
import { CollectCheckout } from '../CollectCheckout'
import SigninStep from '../../SigninStep'
import { ApprovePurchasingCollapsible } from '../../ApprovePurchasingCollapsible'
import { Path } from '../../../components/cart/CartCheckoutModal'
import { CollectionInfo } from '../CollectionInfo'
import { TokenInfo } from '../TokenInfo'
import { SelectPaymentToken } from '../../SelectPaymentToken'
import { formatNumber } from '../../../lib/numbers'
import { truncateAddress } from '../../../lib/truncate'

export const SweepContent: FC<
  ChildrenProps & {
    chainId?: number
    copy: typeof CollectModalCopy
    open: boolean
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
  }
> = ({
  chainId,
  collection,
  token,
  orders,
  selectedTokens,
  itemAmount,
  setItemAmount,
  maxItemAmount,
  disableJumperLink,
  paymentCurrency,
  setPaymentCurrency,
  total,
  totalIncludingFees,
  feeOnTop,
  feeUsd,
  isConnected,
  usdPrice,
  usdPriceRaw,
  currentChain,
  paymentTokens,
  hasEnoughCurrency,
  addFundsLink,
  blockExplorerBaseUrl,
  transactionError,
  stepData,
  collectStep,
  setCollectStep,
  collectTokens,
  copy,
  setOpen,
}) => {
  const hasTokens = orders && orders.length > 0

  const is1155 = collection?.contractKind === 'erc1155'

  const cheapestToken = selectedTokens?.[0]
  const cheapestTokenPrice =
    cheapestToken?.currency?.toLowerCase() != paymentCurrency?.address
      ? cheapestToken?.buyInQuote
      : cheapestToken?.totalPrice

  const mostExpensiveToken = selectedTokens?.[selectedTokens.length - 1]
  const mostExpensiveTokenPrice =
    mostExpensiveToken?.currency?.toLowerCase() != paymentCurrency?.address
      ? mostExpensiveToken?.buyInQuote
      : mostExpensiveToken?.totalPrice

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
    <>
      {!hasTokens || maxItemAmount === 0 ? (
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
            {copy.mintCtaClose}
          </Button>
        </Flex>
      ) : null}

      {hasTokens && maxItemAmount !== 0 && collectStep === CollectStep.Idle && (
        <Flex direction="column">
          <Flex
            direction="column"
            css={{ borderBottom: '1px solid $neutralBorder' }}
          >
            {transactionError ? <ErrorWell error={transactionError} /> : null}
            <Flex direction="column" css={{ p: '$4', gap: 10 }}>
              {token ? (
                <TokenInfo token={token} collection={collection} />
              ) : (
                <CollectionInfo collection={collection} mode="sweep" />
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
                    {formatNumber(maxItemAmount)}{' '}
                    {maxItemAmount === 1 ? 'item' : 'items'} available
                  </Text>
                </Flex>
                <QuantitySelector
                  quantity={itemAmount}
                  setQuantity={setItemAmount}
                  min={1}
                  max={maxItemAmount}
                  css={{
                    width: '100%',
                    justifyContent: 'space-between',
                    minWidth: 200,
                  }}
                />
              </Flex>
              {itemAmount > 1 ? (
                <Flex justify="end" css={{ gap: '$3' }}>
                  {!is1155 ? (
                    <>
                      <Flex align="center" css={{ gap: '$2' }}>
                        <Text style="subtitle3" color="subtle">
                          Price Range
                        </Text>
                        <FormatCryptoCurrency
                          chainId={chainId}
                          amount={cheapestTokenPrice}
                          address={paymentCurrency?.address}
                          decimals={paymentCurrency?.decimals}
                          symbol={paymentCurrency?.name}
                          maximumFractionDigits={2}
                        />
                        <Text style="subtitle3" color="subtle">
                          -
                        </Text>
                        <FormatCryptoCurrency
                          chainId={chainId}
                          amount={mostExpensiveTokenPrice}
                          address={paymentCurrency?.address}
                          decimals={paymentCurrency?.decimals}
                          symbol={paymentCurrency?.name}
                          maximumFractionDigits={2}
                        />
                      </Flex>
                      <Text style="subtitle3" color="subtle">
                        |
                      </Text>
                    </>
                  ) : null}
                  <Flex align="center" css={{ gap: '$2' }}>
                    <Text style="subtitle3" color="subtle">
                      Avg Price
                    </Text>
                    <FormatCryptoCurrency
                      chainId={chainId}
                      amount={total / BigInt(itemAmount)}
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
          <Flex direction="column" css={{ pt: '$4', pb: '$2', gap: '$4' }}>
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
                onClick={() => setCollectStep(CollectStep.SelectPayment)}
              >
                <Flex
                  justify="between"
                  align="center"
                  css={{
                    gap: '$1',
                  }}
                >
                  <Text style="subtitle2">Payment Method</Text>
                  <Flex align="center" css={{ gap: '$2', cursor: 'pointer' }}>
                    <Flex align="center">
                      <CryptoCurrencyIcon
                        address={paymentCurrency?.address as string}
                        css={{ width: 16, height: 16, mr: '$1' }}
                      />
                      <Text style="subtitle2">{paymentCurrency?.symbol}</Text>
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
                  <FormatCurrency amount={feeUsd} color="subtle" style="tiny" />
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
                <FormatCryptoCurrency
                  chainId={chainId}
                  textStyle="h6"
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
              </Flex>
            </Flex>
          </Flex>
          {hasEnoughCurrency || !isConnected ? (
            <Button
              css={{ m: '$4' }}
              disabled={
                !(selectedTokens.length > 0) ||
                (!hasEnoughCurrency && isConnected)
              }
              onClick={collectTokens}
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
                  ? copy.mintCtaBuy
                  : copy.mintCtaInsufficientFunds}
              </Button>
            </Flex>
          )}
        </Flex>
      )}

      {collectStep === CollectStep.SelectPayment && (
        <Flex direction="column" css={{ py: 20 }}>
          <Flex align="center" css={{ gap: '$2', px: '$4' }}>
            <Button
              onClick={() => setCollectStep(CollectStep.Idle)}
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
            goBack={() => setCollectStep(CollectStep.Idle)}
          />
        </Flex>
      )}

      {collectStep === CollectStep.Approving && (
        <Flex direction="column">
          <Box
            css={{
              p: '$4',
              borderBottom: '1px solid $neutralBorder',
            }}
          >
            <CollectCheckout
              chainId={chainId}
              collection={collection}
              token={token}
              itemCount={itemAmount}
              totalPrice={paymentCurrency?.currencyTotalRaw || 0n}
              usdTotalFormatted={paymentCurrency?.usdTotalFormatted}
              currency={paymentCurrency}
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
                <Button disabled={true} css={{ mt: '$4', width: '100%' }}>
                  <Loader />
                  {copy.sweepCtaAwaitingApproval}
                </Button>
              </>
            ) : null}

            {stepData?.currentStep && stepData.currentStep.id === 'auth' ? (
              <>
                <SigninStep css={{ mt: 48, mb: '$4', gap: 20 }} />
                <Button disabled={true} css={{ mt: '$4', width: '100%' }}>
                  <Loader />
                  {copy.sweepCtaAwaitingApproval}
                </Button>
              </>
            ) : null}

            {stepData?.currentStep && stepData?.currentStep?.id === 'sale' ? (
              <>
                {stepData?.currentStep?.items &&
                stepData?.currentStep?.items.length > 1 ? (
                  <Flex direction="column" css={{ gap: '$4', width: '100%' }}>
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
                    <Text style="h6">Confirm transaction in your wallet</Text>
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
                    <Button disabled={true} css={{ mt: '$4', width: '100%' }}>
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

      {collectStep === CollectStep.Finalizing && (
        <Flex direction="column">
          <Box
            css={{
              p: '$4',
              borderBottom: '1px solid $neutralBorder',
            }}
          >
            <CollectCheckout
              chainId={chainId}
              collection={collection}
              token={token}
              itemCount={itemAmount}
              totalPrice={paymentCurrency?.currencyTotalRaw || 0n}
              usdTotalFormatted={paymentCurrency?.usdTotalFormatted}
              currency={paymentCurrency}
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
              You can close this modal while it finalizes on the blockchain. The
              transaction will continue in the background.
            </Text>
            <Box css={{ color: '$neutralSolid' }}>
              <FontAwesomeIcon
                icon={faCube}
                style={{ width: 32, height: 32 }}
              />
            </Box>
          </Flex>
          <Button disabled={true} css={{ m: '$4' }}>
            <Loader />
            {copy.sweepCtaAwaitingValidation}
          </Button>
        </Flex>
      )}

      {collectStep === CollectStep.Complete && (
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
                  return item.txHashes.map((txHash, txHashIndex) => {
                    const truncatedTxHash = truncateAddress(txHash)
                    return (
                      <Anchor
                        key={`${itemIndex}-${txHashIndex}`}
                        href={`${blockExplorerBaseUrl}/tx/${txHash}`}
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
          <Button css={{ width: '100%' }} onClick={() => setOpen(false)}>
            {copy.sweepCtaClose}
          </Button>
        </Flex>
      )}
    </>
  )
}
