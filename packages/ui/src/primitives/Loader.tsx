import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { styled } from '../../stitches.config'
import React, { ComponentPropsWithoutRef, ReactNode } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { motion } from 'framer-motion'

const LoaderContainer = styled('div', {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  color: '$neutralText',
})

type Props = ComponentPropsWithoutRef<typeof LoaderContainer> & {
  icon?: ReactNode
}

export default function Loader(props: Props) {
  const { icon, ...containerProps } = props
  return (
    <LoaderContainer {...containerProps}>
      <motion.div
        initial={{ rotate: 0 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        animate={{ rotate: 360 }}
      >
        {icon ? (
          icon
        ) : (
          <FontAwesomeIcon icon={faSpinner} width={20} height={20} />
        )}
      </motion.div>
    </LoaderContainer>
  )
}
