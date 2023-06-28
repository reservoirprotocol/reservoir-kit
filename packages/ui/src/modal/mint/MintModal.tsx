import {
  faCheckCircle,
  faCircleExclamation,
  faCube,
  faEye,
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
  FormatCurrency,
  Box,
  Loader,
  Anchor,
  ErrorWell,
} from '../../primitives'
import { ApprovePurchasingCollapsible } from '../ApprovePurchasingCollapsible'
import { Modal } from '../Modal'
import SigninStep from '../SigninStep'
import {
  MintModalRenderer,
  MintModalStepData,
  MintStep,
} from './MintModalRenderer'
import { MintCollectionInfo } from './MintCollectionInfo'
import QuantitySelector from '../QuantitySelector'
import { MintCheckout } from './MintCheckout'
import { Address } from 'wagmi'
import { MintImages } from './MintImages'

type MintCallbackData = {
  collectionId?: string
  maker?: string
  stepData: MintModalStepData | null
}

const ModalCopy = {
  title: 'Complete Mint',
  ctaClose: 'Close',
  ctaMint: 'Mint',
  ctaInsufficientFunds: 'Add Funds to Purchase',
  ctaAwaitingApproval: 'Waiting for Approval...',
  ctaAwaitingValidation: 'Waiting to be validated...',
  ctaCopyAddress: 'Copy Wallet Address',
}

type Props = Pick<Parameters<typeof Modal>['0'], 'trigger'> & {
  openState?: [boolean, Dispatch<SetStateAction<boolean>>]
  collectionId?: string
  copyOverrides?: Partial<typeof ModalCopy>
  onMintComplete?: (data: MintCallbackData) => void
  onMintError?: (error: Error, data: MintCallbackData) => void
  onClose?: (data: MintCallbackData, currentStep: MintStep) => void
}

export function MintModal({
  openState,
  trigger,
  collectionId,
  copyOverrides,
  onMintComplete,
  onMintError,
  onClose,
}: Props): ReactElement {
  const copy: typeof ModalCopy = { ...ModalCopy, ...copyOverrides }
  const [open, setOpen] = useFallbackState(
    openState ? openState[0] : false,
    openState
  )

  return (
    <MintModalRenderer open={open} collectionId={collectionId}>
      {({
        loading,
        address,
        collection,
        quantity,
        setQuantity,
        maxQuantity,
        setMaxQuantity,
        currency,
        total,
        totalUsd,
        usdPrice,
        currentChain,
        mintData,
        mintPrice,
        balance,
        hasEnoughCurrency,
        addFundsLink,
        blockExplorerBaseUrl,
        transactionError,
        stepData,
        setStepData,
        mintStep,
        setMintStep,
        mintTokens,
      }) => {
        useEffect(() => {
          if (mintStep === MintStep.Complete && onMintComplete) {
            const data: MintCallbackData = {
              collectionId: collectionId,
              maker: address,
              stepData,
            }

            onMintComplete(data)
          }
        }, [mintStep])

        useEffect(() => {
          if (transactionError && onMintError) {
            const data: MintCallbackData = {
              collectionId: collectionId,
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

        const transfersTokenIds =
          stepData?.currentStep?.items?.reduce((tokenIds, item) => {
            item.transfersData?.forEach((transferData) => {
              if (transferData?.token?.tokenId) {
                tokenIds.add(transferData?.token?.tokenId)
              }
            })
            return tokenIds
          }, new Set<string>()) || []

        const totalMints = Array.from(transfersTokenIds).length
        const failedMints = quantity - totalMints
        const successfulMints = quantity - failedMints

        const quantitySubject = quantity > 1 ? 'Items' : 'Item'

        const hasQuantitySet = quantity >= 1

        const contract = collectionId?.split(':')[0] as Address

        return (
          <Modal
            trigger={trigger}
            title={copy.title}
            open={open}
            loading={loading}
            onOpenChange={(open) => {
              if (!open && onClose) {
                const data: MintCallbackData = {
                  collectionId: collectionId,
                  maker: address,
                  stepData,
                }
                onClose(data, mintStep)
              }
              setOpen(open)
            }}
          >
            {!loading && !mintData ? (
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
                    Oops. Looks like the mint has ended.
                  </Text>
                </Flex>
                <Button css={{ width: '100%' }} onClick={() => setOpen(false)}>
                  {copy.ctaClose}
                </Button>
              </Flex>
            ) : null}

            {!loading && mintData && mintStep === MintStep.Idle && (
              <Flex direction="column">
                <Flex
                  direction="column"
                  css={{ borderBottom: '1px solid $neutralBorder' }}
                >
                  {transactionError ? <ErrorWell /> : null}
                  <Flex direction="column" css={{ p: '$4', gap: '$4' }}>
                    <MintCollectionInfo collection={collection} />
                    <QuantitySelector
                      min={1}
                      max={maxQuantity}
                      quantity={quantity}
                      setQuantity={setQuantity}
                      css={{ justifyContent: 'space-between' }}
                    />
                  </Flex>
                </Flex>
                <Flex
                  direction="column"
                  css={{ px: '$4', pt: '$4', pb: '$2', gap: '$4' }}
                >
                  <Flex direction="column" css={{ gap: 10 }}>
                    {hasQuantitySet ? (
                      <Flex
                        justify="between"
                        align="center"
                        css={{ gap: '$4' }}
                      >
                        <Text style="subtitle2" color="subtle">
                          {quantity} {quantitySubject}
                        </Text>
                        <Flex css={{ gap: '$1' }}>
                          <FormatCryptoCurrency
                            amount={mintPrice}
                            address={currency?.contract}
                            decimals={currency?.decimals}
                            symbol={currency?.symbol}
                            logoWidth={12}
                            css={{ color: '$neutralText' }}
                          />
                          <Text style="subtitle2" color="subtle">
                            x {quantity}
                          </Text>
                        </Flex>
                      </Flex>
                    ) : null}
                  </Flex>
                  <Flex justify="between" align="start" css={{ height: 34 }}>
                    <Text style="h6">Total</Text>
                    <Flex direction="column" align="end" css={{ gap: '$1' }}>
                      <FormatCryptoCurrency
                        textStyle="h6"
                        amount={total}
                        address={currency?.contract}
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
                {hasEnoughCurrency ? (
                  <Button
                    css={{ m: '$4' }}
                    disabled={!hasEnoughCurrency}
                    onClick={mintTokens}
                  >
                    {copy.ctaMint}
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
                        address={currency?.contract}
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
                      {copy.ctaInsufficientFunds}
                    </Button>
                  </Flex>
                )}
              </Flex>
            )}

            {!loading && mintStep === MintStep.Approving && (
              <Flex direction="column">
                <Box
                  css={{
                    p: '$4',
                    borderBottom: '1px solid $neutralBorder',
                  }}
                >
                  <MintCheckout
                    collection={collection}
                    itemCount={quantity}
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
                        {copy.ctaAwaitingApproval}
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
                          {stepData?.currentStep?.items.map((item, index) => (
                            <ApprovePurchasingCollapsible
                              key={index}
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
                            {copy.ctaAwaitingApproval}
                          </Button>
                        </Flex>
                      )}
                    </>
                  ) : null}
                </Flex>
              </Flex>
            )}

            {!loading && mintStep === MintStep.Finalizing && (
              <Flex direction="column">
                <Box
                  css={{
                    p: '$4',
                    borderBottom: '1px solid $neutralBorder',
                  }}
                >
                  <MintCheckout
                    collection={collection}
                    itemCount={quantity}
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
                    <FontAwesomeIcon
                      icon={faCube}
                      style={{ width: 32, height: 32 }}
                    />
                  </Box>
                </Flex>
                <Button disabled={true} css={{ m: '$4' }}>
                  <Loader />
                  {copy.ctaAwaitingValidation}
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
                  <Flex
                    direction="column"
                    css={{ gap: '$2', mb: '$3', px: '$5' }}
                  >
                    {stepData?.currentStep?.items?.map((item, index) => {
                      const txHash = item.txHash
                        ? `${item.txHash.slice(0, 4)}...${item.txHash.slice(
                            -4
                          )}`
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
                  <Button
                    css={{ width: '100%' }}
                    onClick={() => setOpen(false)}
                  >
                    {copy.ctaClose}
                  </Button>
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
