import { styled } from '../../../stitches.config'
import React, { Dispatch, ReactElement, SetStateAction, useEffect } from 'react'
import {
  Flex,
  Box,
  Text,
  Button,
  Loader,
  Select,
  ErrorWell,
  Img,
} from '../../primitives'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Modal } from '../Modal'
import {
  ListingData,
  ListModalRenderer,
  ListStep,
  ListModalStepData,
} from './ListModalRenderer'
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons'
import { useFallbackState, useReservoirClient } from '../../hooks'
import TransactionProgress from '../../modal/TransactionProgress'
import ProgressBar from '../../modal/ProgressBar'
import { Currency } from '../../types/Currency'
import SigninStep from '../SigninStep'
import { zeroAddress } from 'viem'
import PriceInput from './PriceInput'
import ListCheckout from './ListCheckout'

type ListingCallbackData = {
  listings?: ListingData[]
  tokenId?: string
  collectionId?: string
}

const ModalCopy = {
  title: 'List Item for sale',
  ctaClose: 'Close',
  ctaSetPrice: 'Set your price',
  ctaList: 'List for Sale',
  ctaAwaitingApproval: 'Waiting for Approval',
  ctaEditListing: 'Edit Listing',
  ctaRetry: 'Retry',
  ctaGoToToken: 'Go to Token',
}

type Props = Pick<Parameters<typeof Modal>['0'], 'trigger'> & {
  openState?: [boolean, Dispatch<SetStateAction<boolean>>]
  tokenId?: string
  collectionId?: string
  chainId?: number
  currencies?: Currency[]
  nativeOnly?: boolean
  normalizeRoyalties?: boolean
  enableOnChainRoyalties?: boolean
  oracleEnabled?: boolean
  copyOverrides?: Partial<typeof ModalCopy>
  feesBps?: string[]
  onGoToToken?: () => any
  onListingComplete?: (data: ListingCallbackData) => void
  onListingError?: (error: Error, data: ListingCallbackData) => void
  onClose?: (
    data: ListingCallbackData,
    stepData: ListModalStepData | null,
    currentStep: ListStep
  ) => void
}

const Image = styled('img', {})
const Span = styled('span', {})

const MINIMUM_AMOUNT = 0.000001

export function ListModal({
  openState,
  trigger,
  tokenId,
  collectionId,
  chainId,
  currencies,
  normalizeRoyalties,
  enableOnChainRoyalties = false,
  oracleEnabled = false,
  copyOverrides,
  feesBps,
  onGoToToken,
  onListingComplete,
  onListingError,
  onClose,
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

  return (
    <ListModalRenderer
      open={open}
      chainId={modalChain?.id}
      tokenId={tokenId}
      collectionId={collectionId}
      currencies={currencies}
      normalizeRoyalties={normalizeRoyalties}
      enableOnChainRoyalties={enableOnChainRoyalties}
      oracleEnabled={oracleEnabled}
      feesBps={feesBps}
    >
      {({
        token,
        quantityAvailable,
        collection,
        usdPrice,
        listStep,
        marketplace,
        expirationOption,
        expirationOptions,
        isFetchingOnChainRoyalties,
        listingData,
        transactionError,
        stepData,
        price,
        setPrice,
        currencies,
        currency,
        quantity,
        royaltyBps,
        setListStep,
        listToken,
        setCurrency,
        setExpirationOption,
        setQuantity,
      }) => {
        const tokenImage =
          token && token.token?.imageSmall
            ? token.token.imageSmall
            : (collection?.image as string)

        useEffect(() => {
          if (listStep === ListStep.Complete && onListingComplete) {
            const data: ListingCallbackData = {
              tokenId: tokenId,
              collectionId: collectionId,
              listings: listingData,
            }
            onListingComplete(data)
          }
        }, [listStep])

        useEffect(() => {
          if (transactionError && onListingError) {
            const data: ListingCallbackData = {
              tokenId: tokenId,
              collectionId: collectionId,
              listings: listingData,
            }
            onListingError(transactionError, data)
          }
        }, [transactionError])

        const quantitySelectionAvailable =
          marketplace?.orderbook === 'reservoir' ||
          marketplace?.orderbook === 'opensea'

        let loading =
          !token ||
          !collection ||
          (enableOnChainRoyalties ? isFetchingOnChainRoyalties : false)

        return (
          <Modal
            trigger={trigger}
            title={copy.title}
            open={open}
            onOpenChange={(open) => {
              if (!open && onClose) {
                const data: ListingCallbackData = {
                  tokenId: tokenId,
                  collectionId: collectionId,
                  listings: listingData,
                }
                onClose(data, stepData, listStep)
              }

              setOpen(open)
            }}
            loading={loading}
          >
            {!loading && listStep == ListStep.SetPrice && (
              <Flex>
                <ListCheckout
                  collection={collection}
                  token={token}
                  chain={modalChain}
                />

                <Flex
                  direction="column"
                  align="center"
                  css={{ width: '100%', p: '$4' }}
                >
                  {quantityAvailable > 1 && quantitySelectionAvailable && (
                    <>
                      <Box css={{ mb: '$2' }}>
                        <Text
                          as="div"
                          css={{ mb: '$2' }}
                          style="subtitle3"
                          color="subtle"
                        >
                          Quantity
                        </Text>
                        <Select
                          value={`${quantity}`}
                          onValueChange={(value: string) => {
                            setQuantity(Number(value))
                          }}
                        >
                          {[...Array(quantityAvailable)].map((_a, i) => (
                            <Select.Item key={i} value={`${i + 1}`}>
                              <Select.ItemText>{i + 1}</Select.ItemText>
                            </Select.Item>
                          ))}
                        </Select>
                      </Box>
                      <Text
                        style="body2"
                        css={{ mb: 24, display: 'inline-block' }}
                      >
                        {quantityAvailable} items available
                      </Text>
                    </>
                  )}

                  <PriceInput
                    price={price}
                    chainId={modalChain?.id}
                    currency={currency}
                    currencies={currencies}
                    setCurrency={setCurrency}
                    onChange={(e) => {
                      setPrice(e.target.value)
                    }}
                    onBlur={() => {
                      // if (price === '') {
                      //   setPrice(0)
                      // }
                    }}
                  />
                  {Number(price) !== 0 && Number(price) < MINIMUM_AMOUNT && (
                    <Box>
                      <Text style="body2" color="error">
                        Amount must be higher than {MINIMUM_AMOUNT}
                      </Text>
                    </Box>
                  )}
                  {collection &&
                    collection?.floorAsk?.price?.amount?.native !== undefined &&
                    Number(price) !== 0 &&
                    Number(price) >= MINIMUM_AMOUNT &&
                    currency.contract === zeroAddress &&
                    Number(price) <
                      collection?.floorAsk?.price.amount.native && (
                      <Box>
                        <Text style="body2" color="error">
                          Price is{' '}
                          {Math.round(
                            ((collection.floorAsk.price.amount.native -
                              +price) /
                              ((collection.floorAsk.price.amount.native +
                                +price) /
                                2)) *
                              100 *
                              1000
                          ) / 1000}
                          % below the floor
                        </Text>
                      </Box>
                    )}
                  <Box css={{ mb: '$3', mt: '$4' }}>
                    <Text
                      as="div"
                      css={{ mb: '$2' }}
                      style="subtitle3"
                      color="subtle"
                    >
                      Expiration Date
                    </Text>
                    <Select
                      value={expirationOption?.text || ''}
                      onValueChange={(value: string) => {
                        const option = expirationOptions.find(
                          (option) => option.value == value
                        )
                        if (option) {
                          setExpirationOption(option)
                        }
                      }}
                    >
                      {expirationOptions.map((option) => (
                        <Select.Item key={option.text} value={option.value}>
                          <Select.ItemText>{option.text}</Select.ItemText>
                        </Select.Item>
                      ))}
                    </Select>
                  </Box>
                </Flex>
                <Box css={{ p: '$4', width: '100%' }}>
                  <Button
                    disabled={
                      Number(price) == 0 || Number(price) < MINIMUM_AMOUNT
                    }
                    onClick={listToken}
                    css={{ width: '100%' }}
                  >
                    {copy.ctaList}
                  </Button>
                </Box>
              </Flex>
            )}
            {!loading && listStep == ListStep.Listing && (
              <Flex
                direction="column"
                align="center"
                css={{ width: '100%', p: '$4' }}
              >
                {transactionError && (
                  <ErrorWell error={transactionError} css={{ mt: 24 }} />
                )}
                {stepData && stepData.currentStep.id === 'auth' ? (
                  <SigninStep css={{ mt: 48, mb: '$4', gap: 20 }} />
                ) : null}
                {stepData && stepData.currentStep.id !== 'auth' ? (
                  <>
                    <Text
                      css={{ textAlign: 'center', mt: 48, mb: 28 }}
                      style="subtitle1"
                    >
                      {stepData.currentStep.kind === 'transaction'
                        ? 'Approve access to items\nin your wallet'
                        : 'Confirm listing in your wallet'}
                    </Text>
                    <TransactionProgress
                      justify="center"
                      fromImg={tokenImage}
                      toImgs={[marketplace?.imageUrl ?? '']}
                    />
                    <Text
                      css={{
                        textAlign: 'center',
                        mt: 24,
                        maxWidth: 395,
                        mx: 'auto',
                        mb: '$4',
                      }}
                      style="body3"
                      color="subtle"
                    >
                      {stepData?.currentStep.description}
                    </Text>
                  </>
                ) : null}
                {!stepData && (
                  <Flex
                    css={{ height: '100%' }}
                    justify="center"
                    align="center"
                  >
                    <Loader />
                  </Flex>
                )}
                {!transactionError && (
                  <Button css={{ width: '100%', mt: 'auto' }} disabled={true}>
                    <Loader />
                    {copy.ctaAwaitingApproval}
                  </Button>
                )}
                {transactionError && (
                  <Flex css={{ mt: 'auto', gap: 10 }}>
                    <Button
                      color="secondary"
                      css={{ flex: 1 }}
                      onClick={() => setListStep(ListStep.SetPrice)}
                    >
                      {copy.ctaEditListing}
                    </Button>
                    <Button css={{ flex: 1 }} onClick={listToken}>
                      {copy.ctaRetry}
                    </Button>
                  </Flex>
                )}
              </Flex>
            )}
            {!loading && listStep == ListStep.Complete && (
              <Flex direction="column" align="center">
                <Flex
                  direction="column"
                  align="center"
                  css={{ width: '100%', p: '$5', gap: 24 }}
                >
                  <Flex direction="column" align="center" css={{ gap: '$2' }}>
                    <Img
                      src={token?.token?.image || collection?.image}
                      alt={token?.token?.name || token?.token?.tokenId}
                      css={{
                        width: 120,
                        height: 120,
                        aspectRatio: '1/1',
                        borderRadius: 4,
                      }}
                    />
                    <Text style="h6">
                      {token?.token?.tokenId
                        ? `#${token?.token?.tokenId}`
                        : token?.token?.name}
                    </Text>
                    <Text style="subtitle2" color="accent">
                      {collection?.name}
                    </Text>
                  </Flex>
                  <Text style="h5" css={{ mb: '$2' }} as="h5">
                    Your item has been listed!
                  </Text>
                  <Text style="subtitle3" as="p" css={{ mb: '$3' }}>
                    View Listing on
                  </Text>
                  <Flex css={{ gap: '$3' }}>
                    {listingData.map((data) => {
                      const source =
                        data.listing.orderbook === 'reservoir' && client?.source
                          ? client?.source
                          : data.marketplace.domain
                      return (
                        <a
                          key={data.listing.orderbook}
                          target="_blank"
                          href={`${modalChain?.baseApiUrl}/redirect/sources/${source}/tokens/${token?.token?.contract}:${token?.token?.tokenId}/link/v2`}
                        >
                          <Image
                            css={{ width: 24 }}
                            src={marketplace?.imageUrl}
                          />
                        </a>
                      )
                    })}
                  </Flex>
                </Flex>
                <Flex
                  css={{
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
                        color="secondary"
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
                        {copy.ctaGoToToken}
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
    </ListModalRenderer>
  )
}

ListModal.Custom = ListModalRenderer
