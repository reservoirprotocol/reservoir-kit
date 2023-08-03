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
  faEye,
  faWallet,
} from '@fortawesome/free-solid-svg-icons'
import QuantitySelector from '../../QuantitySelector'
import { CollectModalCopy } from '../CollectModal'
import { MintImages } from './MintImages'
import { CollectCheckout } from '../CollectCheckout'
import SigninStep from '../../SigninStep'
import { ApprovePurchasingCollapsible } from '../../ApprovePurchasingCollapsible'
import { Path } from '../../../components/cart/CartCheckoutModal'
import { CollectionInfo } from '../CollectionInfo'
import { TokenInfo } from '../TokenInfo'

export const MintContent: FC<
  ChildrenProps & {
    copy: typeof CollectModalCopy
    open: boolean
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
  }
> = ({
  collection,
  token,
  orders,
  mintPrice,
  itemAmount,
  setItemAmount,
  maxItemAmount,
  currency,
  totalIncludingFees,
  totalUsd,
  usdPrice,
  feeOnTop,
  feeUsd,
  currentChain,
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
  setOpen,
}) => {
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

  const totalMints =
    stepData?.currentStep?.items?.reduce((total, item) => {
      item.transfersData?.forEach((transferData) => {
        total += Number(transferData.amount || 1)
      })
      return total
    }, 0) || 0

  const failedMints = itemAmount - totalMints
  const successfulMints = itemAmount - failedMints

  const quantitySubject = itemAmount > 1 ? 'Items' : 'Item'

  const hasQuantitySet = itemAmount >= 1

  return (
    <>
      {orders?.length === 0 || maxItemAmount === 0 ? (
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
                icon={faEye}
                style={{
                  width: '36px',
                  height: '32px',
                }}
              />
            </Box>
            <Text style="h6" css={{ textAlign: 'center' }}>
              Oops. Looks like the mint has ended or the maximum minting limit
              has been reached.
            </Text>
          </Flex>
          <Button css={{ width: '100%' }} onClick={() => setOpen(false)}>
            {copy.mintCtaClose}
          </Button>
        </Flex>
      ) : null}

      {orders.length > 0 &&
        maxItemAmount !== 0 &&
        collectStep === CollectStep.Idle && (
          <Flex direction="column">
            <Flex
              direction="column"
              css={{ borderBottom: '1px solid $neutralBorder' }}
            >
              {transactionError ? <ErrorWell /> : null}
              <Flex direction="column" css={{ p: '$4', gap: '$4' }}>
                {token ? (
                  <TokenInfo token={token} collection={collection} />
                ) : (
                  <CollectionInfo collection={collection} mode="mint" />
                )}
                <Flex
                  align="center"
                  justify="between"
                  css={{ gap: 24, '@bp1': { gap: '$6' } }}
                >
                  <Flex
                    direction="column"
                    align="start"
                    css={{ gap: '$1', flexShrink: 0 }}
                  >
                    <Text style="subtitle2">Quantity</Text>
                    <Text style="body3" color="subtle">
                      {maxItemAmount} {maxItemAmount > 1 ? 'items' : 'item'}{' '}
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
              </Flex>
            </Flex>
            <Flex
              direction="column"
              css={{ px: '$4', pt: '$4', pb: '$2', gap: '$4' }}
            >
              <Flex direction="column" css={{ gap: 10 }}>
                {hasQuantitySet ? (
                  <Flex justify="between" align="center" css={{ gap: '$4' }}>
                    <Text style="subtitle2" color="subtle">
                      {itemAmount} {quantitySubject}
                    </Text>
                    <Flex css={{ gap: '$1' }}>
                      <FormatCryptoCurrency
                        amount={mintPrice}
                        address={currency?.address}
                        decimals={currency?.decimals}
                        symbol={currency?.symbol}
                        logoWidth={12}
                        css={{ color: '$neutralText' }}
                      />
                      <Text style="subtitle2" color="subtle">
                        x {itemAmount}
                      </Text>
                    </Flex>
                  </Flex>
                ) : null}
              </Flex>
              <Flex direction="column">
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
                      <FormatCurrency
                        amount={feeUsd}
                        color="subtle"
                        style="tiny"
                      />
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
                    <FormatCurrency
                      amount={totalUsd}
                      style="subtitle2"
                      color="subtle"
                    />
                  </Flex>
                </Flex>
              </Flex>
            </Flex>
            {hasEnoughCurrency ? (
              <Button
                css={{ m: '$4' }}
                disabled={!hasEnoughCurrency}
                onClick={collectTokens}
              >
                {copy.mintCtaBuy}
              </Button>
            ) : (
              <Flex
                direction="column"
                align="center"
                css={{ px: '$3', gap: '$3' }}
              >
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
                  onClick={() => {
                    window.open(addFundsLink, '_blank')
                  }}
                  css={{ width: '100%', mb: '$3' }}
                >
                  {copy.mintCtaInsufficientFunds}
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
                  {copy.mintCtaAwaitingApproval}
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
                    {stepData?.currentStep?.items.map((item, index) => (
                      <ApprovePurchasingCollapsible
                        key={index}
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
                      {copy.mintCtaAwaitingApproval}
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
            {copy.mintCtaAwaitingValidation}
          </Button>
        </Flex>
      )}

      {collectStep === CollectStep.Complete && (
        <Flex
          direction="column"
          align="center"
          css={{ width: '100%', py: '$4' }}
        >
          <Flex
            direction="column"
            align="center"
            css={{ py: '$5', gap: 24, maxWidth: '100%' }}
          >
            <Text style="h5" css={{ px: '$5' }}>
              Your mint is complete!
            </Text>
            <MintImages stepData={stepData} contract={contract} />
            <Flex align="center" css={{ gap: '$2', px: '$5' }}>
              <Box
                css={{
                  color: failedMints ? '$errorAccent' : '$successAccent',
                }}
              >
                <FontAwesomeIcon
                  icon={failedMints ? faCircleExclamation : faCheckCircle}
                  fontSize={16}
                />
              </Box>
              <Text style="body1" css={{ textAlign: 'center' }}>
                {failedMints
                  ? `${successfulMints} ${
                      successfulMints > 1 ? 'items' : 'item'
                    } minted, ${failedMints} ${
                      failedMints > 1 ? 'items' : 'item'
                    } failed`
                  : `Successfully minted ${successfulMints} ${
                      successfulMints > 1 ? 'items' : 'item'
                    }`}
                {collection?.name ? (
                  <>
                    {' '}
                    from
                    <Text style="body1" color="accent">
                      {' '}
                      {collection?.name}
                    </Text>
                  </>
                ) : null}
              </Text>
            </Flex>
            <Flex direction="column" css={{ gap: '$2', mb: '$3', px: '$5' }}>
              {stepData?.currentStep?.items?.map((item, index) => {
                const txHash = item.txHash
                  ? `${item.txHash.slice(0, 4)}...${item.txHash.slice(-4)}`
                  : ''

                return (
                  <Anchor
                    key={index}
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
          <Flex css={{ width: '100%', px: '$4' }}>
            <Button css={{ width: '100%' }} onClick={() => setOpen(false)}>
              {copy.mintCtaClose}
            </Button>
          </Flex>
        </Flex>
      )}
    </>
  )
}
