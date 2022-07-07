import React, { FC, ReactNode } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClose } from '@fortawesome/free-solid-svg-icons'
import { Box } from './primitives/Box'
import { Flex } from './primitives/Flex'
import { Anchor } from './primitives/Anchor'
import Button from './primitives/Button'
import { styled } from '../stitches.config'
import { Dialog } from './primitives/Dialog'

const Title = styled(DialogPrimitive.Title, {})

type Props = {
  title: string
  children: ReactNode
  trigger: ReactNode
}

export const Modal: FC<Props> = ({ title, children, trigger }) => {
  return (
    <Dialog trigger={trigger}>
      <Box
        css={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          width: '100%',
          translate: '50%',
        }}
      >
        <Box css={{ px: 5 }}>
          <Box
            css={{
              mx: 'auto',
              overflow: 'hidden',
              borderWidth: 1,
              borderStyle: 'solid',
              borderColor: '$red10',
              backgroundColor: 'black',
              p: 11,
              borderRadius: 16,
              maxWidth: 516,
              boxShadow: '0px 2px 16px rgba(0, 0, 0, 0.9)',
            }}
          >
            <Flex
              css={{
                mb: 16,
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Title>{title}</Title>
              <DialogPrimitive.Close asChild>
                <Button css={{ p: 6 }}>
                  <FontAwesomeIcon icon={faClose} width={16} height={16} />
                </Button>
              </DialogPrimitive.Close>
            </Flex>
            {children}
          </Box>
          <Flex
            css={{
              mx: 'auto',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottomRightRadius: 16,
              borderBottomLeftRadius: 16,
              backgroundColor: 'black',
              py: 16,
              maxWidth: 510,
            }}
          >
            <Anchor
              css={{ display: 'inline-flex', gap: 4, color: 'white' }}
              href="https://reservoirprotocol.github.io/"
              target="_blank"
            >
              Powered by <img src="/reservoir_watermark_dark.svg" />
            </Anchor>
          </Flex>
        </Box>
      </Box>
    </Dialog>
  )
}
