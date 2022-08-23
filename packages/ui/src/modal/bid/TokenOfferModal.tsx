import React, { ReactElement, useEffect, useState, useRef } from 'react'
import { styled } from '../../../stitches.config'
import {
  Flex,
  Text,
  FormatWEth,
  Box,
  Input,
  Select,
  DateInput,
} from '../../primitives'

import { Modal, ModalSize } from '../Modal'
import {
  TokenOfferModalRenderer,
  TokenOfferStep,
} from './TokenOfferModalRenderer'
// import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons'
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import TokenStats from './TokenStats'
import WEthIcon from '../../img/WEthIcon'
import dayjs from 'dayjs'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendar } from '@fortawesome/free-solid-svg-icons'
import Flatpickr from 'react-flatpickr'

type Props = Pick<Parameters<typeof Modal>['0'], 'trigger'> & {
  tokenId?: string
  collectionId?: string
  onViewOffers?: () => any
  onBidComplete?: (data: any) => void
  onBidError?: (error: Error, data: any) => void
}

function titleForStep(step: TokenOfferStep) {
  switch (step) {
    case TokenOfferStep.SetPrice:
      return 'Make an Offer'
    case TokenOfferStep.Swap:
      return 'Add Funds'
    case TokenOfferStep.Offering:
      return 'Complete Offer'
    case TokenOfferStep.Complete:
      return 'Offer Submitted'
  }
}

const ContentContainer = styled(Flex, {
  width: '100%',
  flexDirection: 'column',
  '@bp1': {
    flexDirection: 'row',
  },
})

const MainContainer = styled(Flex, {
  flex: 1,
  borderColor: '$borderColor',
  borderTopWidth: 1,
  borderLeftWidth: 0,
  '@bp1': {
    borderTopWidth: 0,
    borderLeftWidth: 1,
  },

  defaultVariants: {
    direction: 'column',
  },
})

const minimumDate = dayjs().add(1, 'h').format('DD/MM/YYYY h:mm A')
export function TokenOfferModal({
  trigger,
  tokenId,
  collectionId,
  onViewOffers,
}: Props): ReactElement {
  const [open, setOpen] = useState(false)
  const datetimeElement = useRef<Flatpickr | null>(null)

  return (
    <TokenOfferModalRenderer
      open={open}
      tokenId={tokenId}
      collectionId={collectionId}
    >
      {({
        token,
        collection,
        tokenOfferStep,
        expirationOption,
        expirationOptions,
        setExpirationOption,
        // ethUsdPrice,
        // isBanned,
        // transactionError,
      }) => {
        const [expirationDate, setExpirationDate] = useState('')

        useEffect(() => {
          if (
            expirationOption &&
            expirationOption.relativeTime &&
            expirationOption.relativeTimeUnit
          ) {
            setExpirationDate(
              dayjs()
                .add(
                  expirationOption.relativeTime,
                  expirationOption.relativeTimeUnit
                )
                .format('DD/MM/YYYY h:mm A')
            )
          } else if (
            expirationOption &&
            expirationOption.value === 'custom' &&
            expirationOption.relativeTime
          ) {
            setExpirationDate(
              dayjs
                .unix(expirationOption.relativeTime)
                .format('DD/MM/YYYY h:mm A')
            )
          } else {
            setExpirationDate('')
          }
        }, [expirationOption])

        return (
          <Modal
            size={ModalSize.LG}
            trigger={trigger}
            title={titleForStep(tokenOfferStep)}
            open={open}
            onOpenChange={(open) => {
              setOpen(open)
            }}
            loading={!token}
            onPointerDownOutside={(e) => {
              if (
                e.target instanceof Element &&
                datetimeElement.current?.flatpickr?.calendarContainer &&
                datetimeElement.current.flatpickr.calendarContainer.contains(
                  e.target
                )
              ) {
                e.preventDefault()
              }
            }}
          >
            {tokenOfferStep === TokenOfferStep.SetPrice && token && (
              <ContentContainer>
                <TokenStats token={token} collection={collection} />
                <MainContainer css={{ p: '$4' }}>
                  <Flex justify="between">
                    <Text style="tiny">Offer Amount</Text>
                    <Text
                      as={Flex}
                      css={{ gap: '$1' }}
                      align="center"
                      style="tiny"
                    >
                      Balance:{' '}
                      <FormatWEth logoWidth={10} textStyle="tiny" amount={3} />{' '}
                    </Text>
                  </Flex>
                  <Flex css={{ mt: '$2', gap: 20 }}>
                    <Text
                      as={Flex}
                      css={{ gap: '$2', ml: '$3', flexShrink: 0 }}
                      align="center"
                      style="body1"
                      color="subtle"
                    >
                      <Box css={{ width: 'auto', height: 20 }}>
                        <WEthIcon />
                      </Box>
                      WETH
                    </Text>
                    <Input
                      placeholder="Enter price here"
                      containerCss={{
                        width: '100%',
                      }}
                      css={{
                        color: '$neutralText',
                        textAlign: 'left',
                      }}
                    />
                  </Flex>
                  <Text
                    as={Box}
                    css={{ marginLeft: 'auto', mt: '$2' }}
                    style="tiny"
                  >
                    $0
                  </Text>
                  <Text as={Box} css={{ mt: '$4', mb: '$2' }} style="tiny">
                    Expiration Date
                  </Text>
                  <Flex css={{ gap: '$2' }}>
                    <Select
                      css={{ width: 160 }}
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
                    <DateInput
                      ref={datetimeElement}
                      icon={
                        <FontAwesomeIcon
                          icon={faCalendar}
                          width={14}
                          height={16}
                        />
                      }
                      value={expirationDate}
                      options={{
                        minDate: minimumDate,
                        enableTime: true,
                      }}
                      defaultValue={expirationDate}
                      onChange={(e: any) => {
                        if (Array.isArray(e)) {
                          const customOption = expirationOptions.find(
                            (option) => option.value === 'custom'
                          )
                          if (customOption) {
                            setExpirationOption({
                              ...customOption,
                              relativeTime: dayjs(e[0]).unix(),
                            })
                          }
                        }
                      }}
                      containerCss={{
                        width: '100%',
                      }}
                    />
                  </Flex>
                </MainContainer>
              </ContentContainer>
            )}
          </Modal>
        )
      }}
    </TokenOfferModalRenderer>
  )
}

TokenOfferModal.Custom = TokenOfferModalRenderer
