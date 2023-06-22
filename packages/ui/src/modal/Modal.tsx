import React, {
  ComponentPropsWithoutRef,
  ElementRef,
  forwardRef,
  ReactNode,
  useContext,
} from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faClose,
  faChevronLeft,
  faLock,
} from '@fortawesome/free-solid-svg-icons'
import { Anchor, Button, Flex, Text, Loader, Box } from '../primitives'
import { styled } from '../../stitches.config'
import { Dialog } from '../primitives/Dialog'
import { ProviderOptionsContext } from '../ReservoirKitProvider'
import ReservoirText from '../img/ReservoirText'

const Title = styled(DialogPrimitive.Title, {
  margin: 0,
})

export enum ModalSize {
  MD,
  LG,
}

type Props = {
  title: string
  children: ReactNode
  size?: ModalSize
  onBack?: (() => void) | null
  loading?: boolean
} & Pick<
  ComponentPropsWithoutRef<typeof Dialog>,
  | 'onPointerDownOutside'
  | 'onOpenChange'
  | 'open'
  | 'trigger'
  | 'onFocusCapture'
>

export const Logo = styled(ReservoirText, {
  fill: '$neutralText',
  '&:hover': {
    fill: '$neutralSolid',
  },
})

export const Modal = forwardRef<ElementRef<typeof Dialog>, Props>(
  (
    {
      title,
      children,
      trigger,
      onBack,
      open,
      size = ModalSize.MD,
      onOpenChange,
      loading,
      onPointerDownOutside,
      onFocusCapture,
    },
    forwardedRef
  ) => {
    const providerOptionsContext = useContext(ProviderOptionsContext)

    return (
      <Dialog
        ref={forwardedRef}
        trigger={trigger}
        open={open}
        onOpenChange={onOpenChange}
        size={size}
        onPointerDownOutside={onPointerDownOutside}
        onFocusCapture={onFocusCapture}
      >
        <Flex
          css={{
            p: 16,
            backgroundColor: '$headerBackground',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTopRightRadius: '$borderRadius',
            borderTopLeftRadius: '$borderRadius',
          }}
        >
          <Title css={{ alignItems: 'center', display: 'flex' }}>
            {onBack && (
              <Button
                color="ghost"
                size="none"
                css={{ mr: '$2', color: '$neutralText' }}
                onClick={onBack}
              >
                <FontAwesomeIcon icon={faChevronLeft} width={16} height={16} />
              </Button>
            )}
            <Text style="h6">{title}</Text>
          </Title>
          <DialogPrimitive.Close asChild>
            <Button color="ghost" size="none" css={{ color: '$neutralText' }}>
              <FontAwesomeIcon icon={faClose} width={16} height={16} />
            </Button>
          </DialogPrimitive.Close>
        </Flex>
        {loading && (
          <Loader
            css={{
              minHeight: 242,
              backgroundColor: '$contentBackground',
            }}
          />
        )}
        <Box css={{ maxHeight: '85vh', overflowY: 'auto' }}>{children}</Box>
        {!providerOptionsContext.disablePoweredByReservoir && (
          <Flex
            align="center"
            css={{
              mx: 'auto',
              alignItems: 'center',
              justifyContent: 'center',
              pb: 12,
              gap: '$1',
              visibility: '$poweredByReservoirVisibility',
              borderBottomRightRadius: '$borderRadius',
              borderBottomLeftRadius: '$borderRadius',
            }}
          >
            <Box css={{ color: '$neutralBorderHover' }}>
              <FontAwesomeIcon icon={faLock} width={9} height={10} />
            </Box>
            <Text
              style="tiny"
              color="subtle"
              css={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontWeight: 400,
                lineHeight: '12px',
                color: '$neutralText',
              }}
            >
              Powered by{' '}
              <Anchor
                href="https://reservoir.tools/"
                target="_blank"
                weight="heavy"
                color="gray"
                css={{
                  height: 12,
                  fontSize: 12,
                  '&:hover': {
                    color: '$neutralSolid',
                    fill: '$neutralSolid',
                  },
                }}
              >
                <Logo />
              </Anchor>
            </Text>
          </Flex>
        )}
      </Dialog>
    )
  }
)
