import React, { ComponentPropsWithoutRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Flex from './Flex'
import Text from './Text'
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons'
import Anchor from './Anchor'
import { TransactionTimeoutError } from '@reservoir0x/reservoir-sdk'
import { Address } from 'viem'

type Props = {
  error?: Error
} & Pick<ComponentPropsWithoutRef<typeof Flex>, 'css'>

export default function ErrorWell({ error, css }: Props) {
  let message = 'Oops, something went wrong. Please try again.'
  let txHash: Address | null = null

  if (error) {
    if (error.message.includes('rejected')) {
      message = 'User rejected the request.'
    }
    if (error.name === 'Transaction Timeout Error') {
      txHash = (error as TransactionTimeoutError).txHash
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
        {error?.name === 'Transaction Timeout Error' ? (
          <>
            Transaction timed out.{' '}
            <Anchor
              href={`${
                (error as TransactionTimeoutError).blockExplorerBaseUrl
              }/tx/${txHash}`}
              color="primary"
              weight="medium"
              target="_blank"
              css={{ fontSize: 12 }}
            >
              View transaction: {txHash}
            </Anchor>
          </>
        ) : (
          message
        )}
      </Text>
    </Flex>
  )
}
