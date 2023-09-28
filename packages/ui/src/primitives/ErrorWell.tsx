import React, { ComponentPropsWithoutRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Flex from './Flex'
import Text from './Text'
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons'
import Anchor from './Anchor'

type Props = {
  error?: Error
  blockExplorerBaseUrl?: string
} & Pick<ComponentPropsWithoutRef<typeof Flex>, 'css'>

export default function ErrorWell({ error, blockExplorerBaseUrl, css }: Props) {
  let message = 'Oops, something went wrong. Please try again.'
  let txHash

  if (error) {
    if (error.message.includes('rejected')) {
      message = 'User rejected the request.'
    }
    if (error.message.startsWith('Transaction Timeout Error')) {
      const txHashRegex = /hash '(0x[a-fA-F0-9]+)'/
      const match = error.message.match(txHashRegex)
      txHash = match ? match[1] : undefined
      console.log(txHash)
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
        {txHash && blockExplorerBaseUrl ? (
          <>
            Transaction timed out.{' '}
            <Anchor
              href={`${blockExplorerBaseUrl}/tx/${txHash}`}
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
