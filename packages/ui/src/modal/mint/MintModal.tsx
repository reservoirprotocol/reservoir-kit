import React, {
  Dispatch,
  ReactElement,
  SetStateAction,
  useContext,
  useEffect,
} from 'react'
import { WalletClient } from 'viem'
import { ReservoirWallet } from '@reservoir0x/reservoir-sdk'
import { useFallbackState, useReservoirClient } from '../../hooks'
import { Modal } from '../Modal'
import {
  MintModalRenderer,
  MintModalStepData,
  MintStep,
} from './MintModalRenderer'
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
  faEye,
  faPenNib,
  faWallet,
} from '@fortawesome/free-solid-svg-icons'
import { formatNumber } from '../../lib/numbers'
import { ProviderOptionsContext } from '../../ReservoirKitProvider'
import { Path } from '../../components/cart/CartCheckoutModal'
import QuantitySelector from '../QuantitySelector'
import { SelectPaymentToken } from '../SelectPaymentToken'
import { CurrentStepTxHashes } from '../CurrentStepTxHashes'
import SigninStep from '../SigninStep'
import { ApprovePurchasingCollapsible } from '../ApprovePurchasingCollapsible'
import { MintImages } from '../collect/mint/MintImages'
import { truncateAddress } from '../../lib/truncate'
import getChainBlockExplorerUrl from '../../lib/getChainBlockExplorerUrl'
import { TokenInfo } from '../collect/TokenInfo'
import { CollectionInfo } from '../collect/CollectionInfo'
import { CollectCheckout } from '../collect/CollectCheckout'
import { PaymentDetails } from '../PaymentDetails'

export type MintCallbackData = {
  collectionId?: string
  maker?: string
  stepData: MintModalStepData | null
}

export const MintModalCopy = {
  ctaConnect: 'Connect',
  mintTitle: 'Mint',
  mintCtaClose: 'Close',
  mintCtaBuy: 'Mint',
  mintCtaBuyDisabled: 'Mint',
  mintCtaInsufficientFunds: 'Add Funds to Purchase',
  mintCtaAwaitingApproval: 'Waiting for approval...',
  mintCtaAwaitingValidation: 'Waiting to be validated...',
  mintCtaGoToToken: '',
}

type Props = Pick<Parameters<typeof Modal>['0'], 'trigger'> & {
  openState?: [boolean, Dispatch<SetStateAction<boolean>>]
  contract?: string
  tokenId?: string
  defaultQuantity?: number
  onConnectWallet: () => void
  feesOnTopBps?: string[] | null
  feesOnTopUsd?: string[] | null
  chainId?: number
  copyOverrides?: Partial<typeof MintModalCopy>
  walletClient?: ReservoirWallet | WalletClient
  onMintComplete?: (data: MintCallbackData) => void
  onMintError?: (error: Error, data: MintCallbackData) => void
  onClose?: (data: MintCallbackData, currentStep: MintStep) => void
  onGoToToken?: (data: MintCallbackData) => any
}

export function MintModal({
  openState,
  trigger,
  contract,
  tokenId,
  chainId,
  feesOnTopBps,
  feesOnTopUsd,
  copyOverrides,
  walletClient,
  onMintComplete,
  onMintError,
  onClose,
  onConnectWallet,
  onGoToToken,
  defaultQuantity,
}: Props): ReactElement {
  const copy: typeof MintModalCopy = {
    ...MintModalCopy,
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
    <MintModalRenderer
      onConnectWallet={onConnectWallet}
      chainId={modalChain?.id}
      defaultQuantity={defaultQuantity}
      open={open}
      contract={contract}
      tokenId={tokenId}
      feesOnTopBps={feesOnTopBps}
      feesOnTopUsd={feesOnTopUsd}
      walletClient={walletClient}
    >
      {({
        loading,
        collection,
        token,
        orders,
        total,
        totalIncludingFees,
        feeOnTop,
        feeUsd,
        gasCost,
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
        mintStep,
        setStepData,
        setMintStep,
        mintTokens,
      }) => {
        useEffect(() => {
          if (mintStep === MintStep.Complete && onMintComplete) {
            const data: MintCallbackData = {
              collectionId: collection?.id,
              maker: address,
              stepData,
            }

            onMintComplete(data)
          }
        }, [mintStep])

        useEffect(() => {
          if (transactionError && onMintError) {
            const data: MintCallbackData = {
              collectionId: collection?.id,
              maker: address,
              stepData,
            }
            onMintError(transactionError, data)
          }
        }, [transactionError])

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

        const maxQuantity = paymentCurrency?.maxItems
          ? paymentCurrency?.maxItems
          : maxItemAmount

        const totalMints =
          stepData?.currentStep?.items?.reduce((total, item) => {
            item.transfersData?.forEach((transferData) => {
              total += Number(transferData.amount || 1)
            })
            return total
          }, 0) || 0

        const failedMints = itemAmount - totalMints
        const successfulMints = itemAmount - failedMints

        return (
          <Modal
            trigger={trigger}
            title={copy.mintTitle}
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
            }}
            onOpenChange={(open) => {
              if (!open && onClose) {
                const data: MintCallbackData = {
                  collectionId: collection?.id,
                  maker: address,
                  stepData,
                }
                onClose(data, mintStep)
              }
              setOpen(open)
            }}
          >
            {!loading &&
            (orders?.length === 0 || maxItemAmount === 0) &&
            mintStep === MintStep.Idle ? (
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
                    Oops. Looks like the mint has ended or the maximum minting
                    limit has been reached.
                  </Text>
                </Flex>
                <Button css={{ width: '100%' }} onClick={() => setOpen(false)}>
                  {copy.mintCtaClose}
                </Button>
              </Flex>
            ) : null}
            {orders.length > 0 &&
              maxItemAmount !== 0 &&
              mintStep === MintStep.Idle && (
                <Flex direction="column">
                  <Flex
                    direction="column"
                    css={{ borderBottom: '1px solid $neutralBorder' }}
                  >
                    {transactionError ? (
                      <ErrorWell error={transactionError} />
                    ) : null}
                    <Flex direction="column" css={{ p: '$4', gap: '$4' }}>
                      {token ? (
                        <TokenInfo
                          token={token}
                          collection={collection}
                          chain={currentChain}
                        />
                      ) : (
                        <CollectionInfo
                          collection={collection}
                          chain={currentChain}
                        />
                      )}

                      <Flex
                        align="center"
                        justify="between"
                        css={{ gap: 24, '@bp1': { gap: '$6' } }}
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
                            {maxQuantity > 1 ? 'items' : 'item'} available
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
                    </Flex>
                  </Flex>
                  <Flex
                    direction="column"
                    css={{ pt: '$4', pb: '$2', gap: '$4' }}
                  >
                    <PaymentDetails
                      chainId={chainId}
                      paymentCurrency={paymentCurrency}
                      feeOnTop={feeOnTop}
                      feeUsd={feeUsd}
                    />
                    {paymentTokens.length > 1 ? (
                      <Flex
                        direction="column"
                        css={{
                          gap: '$2',
                          py: '$3',
                          px: '$4',
                          borderRadius: '$3',
                          borderTop: '1px solid $neutralBorder',
                          '&:hover': {
                            backgroundColor: '$neutralBgHover',
                          },
                        }}
                        onClick={() => setMintStep(MintStep.SelectPayment)}
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
                  </Flex>
                  {hasEnoughCurrency || !isConnected ? (
                    <Button
                      css={{ m: '$4' }}
                      disabled={!hasEnoughCurrency && isConnected}
                      onClick={mintTokens}
                    >
                      {!isConnected ? copy.ctaConnect : copy.mintCtaBuy}
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
                          chainId={chainId}
                          amount={paymentCurrency?.balance}
                          address={paymentCurrency?.address}
                          decimals={paymentCurrency?.decimals}
                          symbol={paymentCurrency?.name}
                          textStyle="body3"
                        />
                      </Flex>
                      {gasCost > 0n && (
                        <Flex align="center" css={{ mt: '$1' }}>
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
                        disabled={disableJumperLink}
                        onClick={() => {
                          window.open(addFundsLink, '_blank')
                        }}
                        css={{ mb: '$3', width: '100%' }}
                      >
                        {disableJumperLink
                          ? copy.mintCtaBuy
                          : copy.mintCtaInsufficientFunds}
                      </Button>
                    </Flex>
                  )}
                </Flex>
              )}

            {!loading && mintStep === MintStep.SelectPayment && (
              <Flex direction="column" css={{ py: 20 }}>
                <Flex align="center" css={{ gap: '$2', px: '$4' }}>
                  <Button
                    onClick={() => setMintStep(MintStep.Idle)}
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
                  goBack={() => setMintStep(MintStep.Idle)}
                  itemAmount={itemAmount}
                />
              </Flex>
            )}

            {mintStep === MintStep.Approving && (
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
                    currency={paymentCurrency}
                    usdTotalFormatted={paymentCurrency?.usdTotalFormatted}
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
                        {copy.mintCtaAwaitingApproval}
                      </Button>
                    </>
                  ) : null}

                  {stepData?.currentStep &&
                  stepData.currentStep.id === 'auth' ? (
                    <>
                      <SigninStep css={{ mt: 48, mb: '$4', gap: 20 }} />
                      <Button disabled={true} css={{ mt: '$4', width: '100%' }}>
                        <Loader />
                        {copy.mintCtaAwaitingApproval}
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
                            {copy.mintCtaAwaitingApproval}
                          </Button>
                        </Flex>
                      )}
                    </>
                  ) : null}
                </Flex>
              </Flex>
            )}

            {mintStep === MintStep.Finalizing && (
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
                    currency={paymentCurrency}
                    usdTotalFormatted={paymentCurrency?.usdTotalFormatted}
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
                  {copy.mintCtaAwaitingValidation}
                </Button>
              </Flex>
            )}

            {mintStep === MintStep.Complete && (
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
                  <MintImages
                    stepData={stepData}
                    tokenKind={collection?.contractKind}
                  />
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
                  <Flex
                    direction="column"
                    css={{ gap: '$2', mb: '$3', px: '$5' }}
                  >
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
                <Flex css={{ width: '100%', px: '$4' }}>
                  {!!onGoToToken ? (
                    <>
                      <Button
                        onClick={() => {
                          setOpen(false)
                        }}
                        css={{ flex: 1 }}
                        color="ghost"
                      >
                        {copy.mintCtaClose}
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
                        {copy.mintCtaGoToToken.length > 0
                          ? copy.mintCtaGoToToken
                          : `View ${successfulMints > 1 ? 'Tokens' : 'Token'}`}
                      </Button>
                    </>
                  ) : (
                    <Button
                      css={{ width: '100%' }}
                      onClick={() => setOpen(false)}
                    >
                      {copy.mintCtaClose}
                    </Button>
                  )}
                </Flex>
              </Flex>
            )}
          </Modal>
        )
      }}
    </MintModalRenderer>
  )
}

MintModal.Custom = MintModalRenderer
