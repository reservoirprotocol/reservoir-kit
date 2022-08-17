import React, { ReactElement, useState } from 'react'
import { styled } from '../../../stitches.config'
import { Flex, Text, FormatWEth } from '../../primitives'

import { Modal } from '../Modal'
import {
  TokenOfferModalRenderer,
  TokenOfferStep,
} from './TokenOfferModalRenderer'
// import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons'
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import TokenStats from './TokenStats'

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

export function TokenOfferModal({
  trigger,
  tokenId,
  collectionId,
  onViewOffers,
}: Props): ReactElement {
  const [open, setOpen] = useState(false)

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
        // ethUsdPrice,
        // isBanned,
        // transactionError,
      }) => {
        return (
          <Modal
            trigger={trigger}
            title={titleForStep(tokenOfferStep)}
            open={open}
            onOpenChange={(open) => {
              setOpen(open)
            }}
            loading={!token}
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
                      Balance: <FormatWEth amount={3} />{' '}
                    </Text>
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
