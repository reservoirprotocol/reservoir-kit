import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Flex, Text } from '../primitives'
import React, { FC } from 'react'
import { faPenNib } from '@fortawesome/free-solid-svg-icons'
import { CSS } from '@stitches/react'

type Props = {
  css: CSS
}

const SigninStep: FC<Props> = ({ css }) => {
  return (
    <Flex
      css={{ color: '$neutralText', ...css }}
      direction="column"
      justify="center"
      align="center"
    >
      <Text style="h6" color="base" css={{ mb: '$2', textAlign: 'center' }}>
        Sign in to Blur
      </Text>
      <Text
        style="subtitle2"
        color="subtle"
        css={{ mb: 20, textAlign: 'center' }}
      >
        This is a one-time approval process that takes place once a month
      </Text>
      <FontAwesomeIcon
        icon={faPenNib}
        width={32}
        height={32}
        style={{ height: 32 }}
      />
    </Flex>
  )
}

export default SigninStep
