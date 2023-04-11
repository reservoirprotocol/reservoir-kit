import { faCube, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { Dispatch, ReactElement, SetStateAction } from 'react'
import { useFallbackState } from '../../hooks'
import {
  Button,
  Flex,
  FormatCryptoCurrency,
  Text,
  Slider,
  Input,
  Grid,
  FormatCurrency,
  Box,
} from '../../primitives'
import { Modal } from '../Modal'
import { ItemToggle } from './ItemToggle'
import { SweepItem } from './SweepItem'
import { SweepModalRenderer, SweepStep } from './SweepModalRenderer'

type Props = Pick<Parameters<typeof Modal>['0'], 'trigger'> & {
  openState?: [boolean, Dispatch<SetStateAction<boolean>>]
  collectionId?: string
  normalizeRoyalties?: boolean
  // Todo: add callback functions
}

export function SweepModal({
  openState,
  trigger,
  collectionId,
  normalizeRoyalties,
}: Props): ReactElement {
  const [open, setOpen] = useFallbackState(
    openState ? openState[0] : false,
    openState
  )

  return (
    <SweepModalRenderer
      open={open}
      collectionId={collectionId}
      normalizeRoyalties={normalizeRoyalties}
    >
      {({
        loading,
        selectedTokens,
        setSelectedTokens,
        itemAmount,
        setItemAmount,
        ethAmount,
        setEthAmount,
        isItemsToggled,
        setIsItemsToggled,
        maxInput,
        setMaxInput,
        currency,
        total,
        totalUsd,
        tokens,
        stepData,
        setStepData,
        sweepStep,
        setSweepStep,
        sweepTokens,
      }) => {
        const hasTokens = tokens && tokens.length > 0
        return (
          <Modal
            trigger={trigger}
            title="Sweep"
            open={open}
            loading={loading}
            onOpenChange={(open) => {
              setOpen(open)
            }}
          >
            {!loading && !hasTokens ? (
              <Flex
                direction="column"
                align="center"
                css={{ py: '$6', px: '$4', gap: '$3' }}
              >
                <Text style="h6" css={{ textAlign: 'center' }}>
                  No items were found for this collection.
                </Text>
              </Flex>
            ) : null}
            {!loading && hasTokens && sweepStep === SweepStep.Idle && (
              <Flex direction="column">
                <Flex direction="column" css={{ px: '$4', pt: '$5', pb: '$2' }}>
                  <Slider
                    min={0}
                    max={
                      isItemsToggled
                        ? Math.min(50, maxInput)
                        : Math.min(100, maxInput)
                    }
                    step={isItemsToggled ? 1 : 0.1}
                    value={isItemsToggled ? [itemAmount] : [ethAmount]}
                    onValueChange={(value) => {
                      if (isItemsToggled) {
                        setItemAmount(value[0])
                      } else {
                        setEthAmount(value[0])
                      }
                    }}
                    css={{ width: '100%', mb: '$3' }}
                  />
                  <Flex align="center" css={{ gap: '$3', mb: 20 }}>
                    <Input
                      value={isItemsToggled ? itemAmount : ethAmount}
                      type="number"
                      step={isItemsToggled ? 1 : 0.1}
                      onChange={(e) => {
                        const inputValue = Number(e.target.value)

                        if (e.target.value == '') {
                          setItemAmount(0)
                          setEthAmount(0)
                        } else if (isItemsToggled) {
                          setItemAmount(
                            Math.min(Math.max(inputValue, 0), maxInput) // min: 0, max: maxInput
                          )
                        } else {
                          setEthAmount(
                            Math.min(Math.max(inputValue, 0), maxInput)
                          )
                        }
                      }}
                      css={{
                        textAlign: 'center',
                        width: '100%',
                        height: 44,
                        boxSizing: 'border-box',
                      }}
                      containerCss={{ width: '100%' }}
                    />
                    <ItemToggle
                      isItemsToggled={isItemsToggled}
                      setIsItemsToggled={setIsItemsToggled}
                      currency={currency}
                    />
                  </Flex>
                  <Flex
                    direction="column"
                    css={{ height: 185, overflowY: 'auto', mb: '$4' }}
                  >
                    {selectedTokens && selectedTokens.length > 0 ? (
                      <Grid
                        css={{
                          gridTemplateColumns: 'repeat(5,minmax(0,1fr))',
                          '@bp1': {
                            gridTemplateColumns: 'repeat(7,minmax(0,1fr))',
                          },
                          gap: 8,
                        }}
                      >
                        {selectedTokens.map((token, i) => (
                          <SweepItem
                            key={`${token?.token?.tokenId}-${i}`}
                            name={
                              token.token?.name || `#${token?.token?.tokenId}`
                            }
                            image={token.token?.image}
                            currency={currency}
                            amount={
                              token?.market?.floorAsk?.price?.amount?.decimal
                            } // TODO: decimal or native?
                          />
                        ))}
                      </Grid>
                    ) : (
                      <Text
                        style="body3"
                        color="subtle"
                        css={{ textAlign: 'center', my: 'auto' }}
                      >
                        Selected items will appear here
                      </Text>
                    )}
                  </Flex>
                  <Flex justify="between" align="start" css={{ height: 34 }}>
                    <Text style="h6">Total</Text>
                    <Flex direction="column" align="end" css={{ gap: '$1' }}>
                      <FormatCryptoCurrency
                        textStyle="h6"
                        amount={total}
                        address={currency?.address}
                        decimals={currency?.decimals}
                        logoWidth={18}
                      />
                      <FormatCurrency
                        amount={totalUsd}
                        style="tiny"
                        color="subtle"
                      />
                    </Flex>
                  </Flex>
                </Flex>
                <Button
                  css={{ m: '$4' }}
                  disabled={!(selectedTokens.length > 0)}
                >
                  {selectedTokens.length > 0 ? 'Sweep' : 'Select Items to Buy'}
                </Button>
              </Flex>
            )}

            {!loading && sweepStep === SweepStep.Approving && (
              <Flex direction="column">
                <Box
                  css={{
                    p: '$4',
                    borderBottom: '1px solid $neutralBorder',
                  }}
                >
                  {/* <TokenCheckout
                    itemCount={selectedTokens.length}
                    images={images}
                    totalPrice={total}
                    usdPrice={totalUsd}
                    currency={currency}
                    chain={cartChain}
                  /> */}
                </Box>
                <Flex direction="column" css={{ p: '$4', overflowY: 'auto' }}>
                  {/* {stepData?.currentStep &&
                  stepData.currentStep.id === 'auth' ? (
                    <SigninStep css={{ mt: 48, mb: '$4', gap: 20 }} />
                  ) : null} */}
                </Flex>
              </Flex>
            )}

            {!loading && sweepStep === SweepStep.Finalizing && (
              <Flex
                direction="column"
                align="center"
                justify="center"
                css={{
                  gap: '$4',
                }}
              >
                <Text style="h6">Finalizing on blockchain</Text>
                <Text
                  style="subtitle2"
                  color="subtle"
                  css={{ textAlign: 'center' }}
                >
                  You can close this modal while it finalizes on the blockchain.
                  The transaction will continue in the background.
                </Text>

                <FontAwesomeIcon icon={faCube} width="24" />
              </Flex>
            )}
          </Modal>
        )
      }}
    </SweepModalRenderer>
  )
}

SweepModal.Custom = SweepModalRenderer
