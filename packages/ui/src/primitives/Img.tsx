import { faImage } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Flex from './Flex'
import { ComponentPropsWithoutRef, useEffect, useState } from 'react'
import { styled } from '@stitches/react'
import React from 'react'

const StyledImg = styled('img')

const Img = (props: ComponentPropsWithoutRef<typeof StyledImg>) => {
  const [collectionImageBroken, setCollectionImageBroken] = useState(false)

  useEffect(() => {
    if (collectionImageBroken) {
      setCollectionImageBroken(false)
    }
  }, [props.src])

  return collectionImageBroken || !props.src ? (
    <Flex
      css={{ ...props.css, background: '$neutralBgActive' }}
      justify="center"
      align="center"
    >
      <FontAwesomeIcon icon={faImage} size="2x" />
    </Flex>
  ) : (
    <StyledImg
      {...props}
      onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        setCollectionImageBroken(true)
      }}
    />
  )
}

export default Img
