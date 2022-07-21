import React, { FC, ReactNode, useContext } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClose, faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import { Anchor, Button, Flex, Text, Loader } from '../primitives'
import { styled } from '../../stitches.config'
import { Dialog } from '../primitives/Dialog'
import ReservoirLogoWhiteText from '../img/ReservoirLogoWhiteText'
import { ProviderOptionsContext } from '../ReservoirKitProvider'

const Title = styled(DialogPrimitive.Title, {})

type Props = {
  title: string
  children: ReactNode
  trigger: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onBack?: (() => void) | null
  loading?: boolean
}

const Logo = styled(ReservoirLogoWhiteText, {
  '& .letter': {
    fill: '$reservoirLogoColor',
  },
})

export const Modal: FC<Props> = ({
  title,
  children,
  trigger,
  onBack,
  open,
  onOpenChange,
  loading,
}) => {
  const providerOptionsContext = useContext(ProviderOptionsContext)

  return (
    <Dialog trigger={trigger} open={open} onOpenChange={onOpenChange}>
      <Flex
        css={{
          p: 16,
          backgroundColor: '$headerBackground',
          alignItems: 'center',
          justifyContent: 'space-between',
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
      {children}
      {!providerOptionsContext.disablePoweredByReservoir && (
        <Flex
          css={{
            mx: 'auto',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '$footerBackground',
            py: 10.5,
            visibility: '$poweredByReservoirVisibility',
          }}
        >
          <Anchor href="https://reservoir.tools/" target="_blank">
            <Text
              style="body2"
              css={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
            >
              Powered by <Logo />
            </Text>
          </Anchor>
        </Flex>
      )}
    </Dialog>
  )
}
