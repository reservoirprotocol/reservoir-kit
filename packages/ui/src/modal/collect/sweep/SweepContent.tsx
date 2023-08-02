import React, { FC } from 'react'
import { ChildrenProps, CollectStep } from '../CollectModalRenderer'
import {
  Anchor,
  Box,
  Button,
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
  faCircleExclamation,
  faCube,
  faMagnifyingGlass,
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

export const SweepContent: FC<
  ChildrenProps & {
    copy: typeof CollectModalCopy
    open: boolean
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
  }
> = ({
  collection,
  token,
  orders,
  selectedTokens,
  itemAmount,
  setItemAmount,
  maxItemAmount,
  currency,
  total,
  totalIncludingFees,
  totalUsd,
  feeOnTop,
  feeUsd,
  usdPrice,
  currentChain,
  balance,
  chainCurrency,
  isChainCurrency,
  hasEnoughCurrency,
  addFundsLink,
  blockExplorerBaseUrl,
  transactionError,
  stepData,
  collectStep,
  collectTokens,
  copy,
  setOpen,
}) => {
  const hasTokens = orders && orders.length > 0

  const is1155 = collection?.contractKind === 'erc1155'

  const cheapestToken = selectedTokens?.[0]
  const cheapestTokenPrice =
    cheapestToken?.currency != chainCurrency.address && isChainCurrency
      ? cheapestToken?.buyInQuote
      : cheapestToken?.totalPrice

  const mostExpensiveToken = selectedTokens?.[selectedTokens.length - 1]
  const mostExpensiveTokenPrice =
    mostExpensiveToken?.currency != chainCurrency.address && isChainCurrency
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
            {transactionError ? <ErrorWell /> : null}
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
                  css={{ gap: '$1', flexShrink: 0 }}
                >
                  <Text style="subtitle2">Quantity</Text>
                  <Text style="body3" color="subtle">
                    {maxItemAmount} {maxItemAmount === 1 ? 'item' : 'items'}{' '}
                    available
                  </Text>
                </Flex>
                <QuantitySelector
                  quantity={itemAmount}
                  setQuantity={setItemAmount}
                  min={1}
                  max={maxItemAmount}
                  css={{ width: '100%', justifyContent: 'space-between' }}
                />
              </Flex>
              {itemAmount > 1 ? (
                <Flex justify="end" css={{ gap: '$3' }}>
                  {!is1155 ? (
                    <>
                      <Flex align="center" css={{ gap: '$2' }}>
                        <Text style="subtitle2" color="subtle">
                          Price Range
                        </Text>
                        <FormatCryptoCurrency
                          amount={cheapestTokenPrice}
                          address={currency?.address}
                          decimals={currency?.decimals}
                          symbol={currency?.symbol}
                          maximumFractionDigits={2}
                        />
                        <Text style="subtitle2" color="subtle">
                          -
                        </Text>
                        <FormatCryptoCurrency
                          amount={mostExpensiveTokenPrice}
                          address={currency?.address}
                          decimals={currency?.decimals}
                          symbol={currency?.symbol}
                          maximumFractionDigits={2}
                        />
                      </Flex>
                      <Text style="subtitle2" color="subtle">
                        |
                      </Text>
                    </>
                  ) : null}
                  <Flex align="center" css={{ gap: '$2' }}>
                    <Text style="subtitle2" color="subtle">
                      Avg Price
                    </Text>
                    <FormatCryptoCurrency
                      amount={total / itemAmount}
                      address={currency?.address}
                      decimals={currency?.decimals}
                      symbol={currency?.symbol}
                      maximumFractionDigits={2}
                    />
                  </Flex>
                </Flex>
              ) : null}
            </Flex>
          </Flex>
          <Flex direction="column" css={{ px: '$4', pt: '$4', pb: '$2' }}>
            {feeOnTop > 0 && (
              <Flex
                justify="between"
                align="start"
                css={{ py: '$4', width: '100%' }}
              >
                <Text style="subtitle2">Referral Fee</Text>
                <Flex direction="column" align="end" css={{ gap: '$1' }}>
                  <FormatCryptoCurrency
                    amount={feeOnTop}
                    address={currency?.address}
                    decimals={currency?.decimals}
                    symbol={currency?.symbol}
                  />
                  <FormatCurrency amount={feeUsd} color="subtle" style="tiny" />
                </Flex>
              </Flex>
            )}
            <Flex justify="between" align="start" css={{ height: 34 }}>
              <Text style="h6">Total</Text>
              <Flex direction="column" align="end" css={{ gap: '$1' }}>
                <FormatCryptoCurrency
                  textStyle="h6"
                  amount={totalIncludingFees}
                  address={currency?.address}
                  decimals={currency?.decimals}
                  symbol={currency?.symbol}
                  logoWidth={18}
                />
                <FormatCurrency amount={totalUsd} style="tiny" color="subtle" />
              </Flex>
            </Flex>
          </Flex>
          {hasEnoughCurrency ? (
            <Button
              css={{ m: '$4' }}
              disabled={!(selectedTokens.length > 0) || !hasEnoughCurrency}
              onClick={collectTokens}
            >
              {selectedTokens.length > 0
                ? copy.sweepCtaBuy
                : copy.sweepCtaBuyDisabled}
            </Button>
          ) : (
            <Flex direction="column" align="center" css={{ px: '$3' }}>
              <Flex align="center">
                <Text css={{ mr: '$3' }} color="error" style="body3">
                  Insufficient Balance
                </Text>

                <FormatCryptoCurrency
                  amount={balance}
                  address={currency?.address}
                  decimals={currency?.decimals}
                  symbol={currency?.symbol}
                  textStyle="body3"
                />
              </Flex>
              <Button
                css={{ my: '$4', width: '100%' }}
                onClick={() => window.open(addFundsLink, '_blank')}
              >
                {copy.sweepCtaInsufficientFunds}
              </Button>
            </Flex>
          )}
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
              collection={collection}
              token={token}
              itemCount={itemAmount}
              totalPrice={totalIncludingFees}
              usdPrice={usdPrice}
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
            {stepData?.currentStep && stepData.currentStep.id === 'auth' ? (
              <>
                <SigninStep css={{ mt: 48, mb: '$4', gap: 20 }} />
                <Button disabled={true} css={{ mt: '$4', width: '100%' }}>
                  <Loader />
                  {copy.sweepCtaAwaitingApproval}
                </Button>
              </>
            ) : null}

            {stepData?.currentStep && stepData?.currentStep?.id !== 'auth' ? (
              <>
                {stepData?.currentStep?.items &&
                stepData?.currentStep?.items.length > 1 ? (
                  <Flex direction="column" css={{ gap: '$4', width: '100%' }}>
                    <Text style="h6" css={{ textAlign: 'center' }}>
                      Approve Purchases
                    </Text>
                    <Text style="subtitle2" color="subtle">
                      The purchase of these items needs to be split into{' '}
                      {stepData?.currentStep?.items.length} separate
                      transactions.
                    </Text>
                    {stepData?.currentStep?.items.map((item) => (
                      <ApprovePurchasingCollapsible
                        item={item}
                        pathMap={pathMap}
                        usdPrice={usdPrice}
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
              collection={collection}
              token={token}
              itemCount={itemAmount}
              totalPrice={totalIncludingFees}
              usdPrice={usdPrice}
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
              {stepData?.currentStep?.items?.map((item) => {
                const txHash = item.txHash
                  ? `${item.txHash.slice(0, 4)}...${item.txHash.slice(-4)}`
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
          <Button css={{ width: '100%' }} onClick={() => setOpen(false)}>
            {copy.sweepCtaClose}
          </Button>
        </Flex>
      )}
    </>
  )
}
