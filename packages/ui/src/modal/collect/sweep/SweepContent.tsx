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
  faWallet,
} from '@fortawesome/free-solid-svg-icons'
import QuantitySelector from '../../QuantitySelector'
import { CollectModalCopy } from '../CollectModal'
import { CollectCheckout } from '../CollectCheckout'
import SigninStep from '../../SigninStep'
import { ApprovePurchasingCollapsible } from '../../ApprovePurchasingCollapsible'
import { Path } from '../../../components/cart/CartCheckoutModal'

export const MintContent: FC<
  ChildrenProps & {
    copy: typeof CollectModalCopy
    open: boolean
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
  }
> = ({
  loading,
  collection,
  address,
  selectedTokens,
  itemAmount,
  setItemAmount,
  maxInput,
  currency,
  total,
  totalUsd,
  feeOnTop,
  feeUsd,
  usdPrice,
  currentChain,
  availableTokens,
  balance,
  contract,
  hasEnoughCurrency,
  addFundsLink,
  blockExplorerBaseUrl,
  transactionError,
  stepData,
  collectStep,
  collectTokens,
  copy,
  open,
  setOpen,
}) => {
  const hasTokens = availableTokens && availableTokens.length > 0

  const images = selectedTokens.slice(0, 2).map((token) => {
    return `${currentChain?.baseApiUrl}/redirect/tokens/${token.contract}:${token.tokenId}/image/v1?imageSize=small`
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

  const transfersTxHashes =
    stepData?.currentStep?.items?.reduce((txHashes, item) => {
      item.transfersData?.forEach((transferData) => {
        if (transferData.txHash) {
          txHashes.add(transferData.txHash)
        }
      })
      return txHashes
    }, new Set<string>()) || []
  const totalSales = Array.from(transfersTxHashes).length
  const failedSales = totalSales - (stepData?.currentStep?.items?.length || 0)
  const successfulSales = totalSales - failedSales

  return (
    <>
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
      {!loading && hasTokens && collectStep === CollectStep.Idle && (
        <Flex direction="column">
          <Flex direction="column" css={{ px: '$4', pt: '$4', pb: '$2' }}>
            {transactionError ? <ErrorWell /> : null}
            <Flex align="center" css={{ gap: '$3', mb: 20 }}>
              <QuantitySelector
                quantity={itemAmount}
                setQuantity={setItemAmount}
                min={1}
                max={maxInput}
                css={{ width: '100%' }}
              />
            </Flex>
            {feeOnTop > 0 && (
              <Flex
                direction="column"
                css={{ width: '100%', py: '$4', gap: '$1' }}
              >
                <Flex align="center" justify="between">
                  <Text style="subtitle2">Referral Fee</Text>
                  <FormatCryptoCurrency
                    amount={feeOnTop}
                    address={currency?.address}
                    decimals={currency?.decimals}
                    symbol={currency?.symbol}
                  />
                </Flex>
                <Flex justify="end">
                  <FormatCurrency amount={feeUsd} color="subtle" />
                </Flex>
              </Flex>
            )}
            <Flex justify="between" align="start" css={{ height: 34 }}>
              <Text style="h6">Total</Text>
              <Flex direction="column" align="end" css={{ gap: '$1' }}>
                <FormatCryptoCurrency
                  textStyle="h6"
                  amount={total}
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
                disabled={true}
                onClick={() => window.open(addFundsLink, '_blank')}
              >
                {copy.sweepCtaInsufficientFunds}
              </Button>
            </Flex>
          )}
        </Flex>
      )}

      {!loading && collectStep === CollectStep.Approving && (
        <Flex direction="column">
          <Box
            css={{
              p: '$4',
              borderBottom: '1px solid $neutralBorder',
            }}
          >
            <CollectCheckout
              collection={collection}
              itemCount={selectedTokens.length}
              totalPrice={total}
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
                      Due to limitations with Blur, the purchase of these items
                      needs to be split into{' '}
                      {stepData?.currentStep?.items.length} separate
                      transactions.
                    </Text>
                    {stepData?.currentStep?.items.map((item) => (
                      <ApprovePurchasingCollapsible
                        item={item}
                        pathMap={pathMap}
                        usdPrice={totalUsd}
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

      {!loading && collectStep === CollectStep.Finalizing && (
        <Flex direction="column">
          <Box
            css={{
              p: '$4',
              borderBottom: '1px solid $neutralBorder',
            }}
          >
            <CollectCheckout
              collection={collection}
              itemCount={selectedTokens.length}
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
