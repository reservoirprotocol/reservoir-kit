import React, { ComponentPropsWithoutRef, ReactNode } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Flex from './Flex'
import Text from './Text'
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons'
import Anchor from './Anchor'
import { TransactionTimeoutError } from '@reservoir0x/reservoir-sdk'
import { truncateAddress } from '../lib/truncate'

type Props = {
  error?: Error
} & Pick<ComponentPropsWithoutRef<typeof Flex>, 'css'>

export default function ErrorWell({ error, css }: Props) {
  let message = 'Oops, something went wrong. Please try again.'
  let messageWithContent: ReactNode = null

  const errorType = (error as any)?.type
  const errorStatus = (error as any)?.statusCode
  if (error) {
    if (error?.message?.includes('rejected')) {
      message = 'User rejected the request.'
    } else if (errorType && errorType === 'price mismatch') {
      message = error.message
    } else if (
      error.name === 'TransactionTimeoutError' &&
      (error as TransactionTimeoutError).txHash &&
      (error as TransactionTimeoutError).blockExplorerBaseUrl
    ) {
      let transactionError = error as TransactionTimeoutError
      messageWithContent = (
        <>
          Your transaction was sent, but is taking longer to process.
          <br />
          <Anchor
            href={`${transactionError.blockExplorerBaseUrl}/tx/${transactionError.txHash}`}
            color="primary"
            weight="medium"
            target="_blank"
            css={{ fontSize: 12 }}
          >
            View on block explorer: {truncateAddress(transactionError.txHash)}
          </Anchor>
        </>
      )
    } else if (error.name === 'CrossChainTransactionError') {
      messageWithContent = (
        <>
          Cross-chain purchase failed, please try again. Your balance can be
          used for another purchase. For assistance or withdrawal help, please
          contact{' '}
          <Anchor
            href={`https://reservoir.tools/`}
            color="primary"
            weight="medium"
            target="_blank"
            css={{ fontSize: 12 }}
          >
            Reservoir
          </Anchor>
          .
        </>
      )
    } else if (errorStatus >= 400 && errorStatus < 500) {
      message = error.message
    }
  }

  return (
    <Flex
      css={{
        color: '$errorAccent',
        p: '$4',
        gap: '$2',
        background: '$wellBackground',
        ...css,
      }}
      align="center"
    >
      <FontAwesomeIcon icon={faCircleExclamation} width={16} height={16} />
      <Text style="body3" color="errorLight">
        {messageWithContent ? messageWithContent : message}
      </Text>
    </Flex>
  )
}
