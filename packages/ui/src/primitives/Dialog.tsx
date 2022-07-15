import { styled } from '../../stitches.config'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import React, {
  ComponentPropsWithoutRef,
  ElementRef,
  forwardRef,
  ReactNode,
  useState,
  useEffect,
} from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const Overlay = styled(DialogPrimitive.Overlay, {
  backgroundColor: '$overlayBackground',
  position: 'fixed',
  inset: 0,
})

const AnimatedOverlay = forwardRef<
  ElementRef<typeof DialogPrimitive.Overlay>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ ...props }, forwardedRef) => (
  <Overlay {...props} forceMount asChild>
    <motion.div
      ref={forwardedRef}
      transition={{ duration: 0.5 }}
      initial={{
        opacity: 0,
      }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    />
  </Overlay>
))

const Content = styled(DialogPrimitive.Content, {
  backgroundColor: '$contentBackground',
  borderRadius: 8,
  $$shadowColor: '$colors$gray7',
  boxShadow: 'box-shadow: 0px 2px 16px $$shadowColor',
  border: '1px solid $borderColor',
  position: 'fixed',
  top: '12.5%',
  left: '50%',
  transform: 'translateX(-50%)',
  maxWidth: 516,
  width: '100%',
  maxHeight: '85vh',
  overflowY: 'auto',
  '&:focus': { outline: 'none' },
})

const AnimatedContent = forwardRef<
  ElementRef<typeof DialogPrimitive.DialogContent>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.DialogContent>
>(({ children, ...props }, forwardedRef) => (
  <Content forceMount asChild {...props}>
    <motion.div
      ref={forwardedRef}
      transition={{ type: 'spring', duration: 0.5 }}
      initial={{
        opacity: 0,
        top: '14%',
      }}
      animate={{
        opacity: 1,
        top: '9%',
      }}
      exit={{
        opacity: 0,
        top: '14%',
      }}
    >
      {children}
    </motion.div>
  </Content>
))

type Props = {
  trigger: ReactNode
  portalProps?: DialogPrimitive.PortalProps
  onOpenChange?: (open: boolean) => void
  open?: boolean
}

const Dialog = forwardRef<
  ElementRef<typeof DialogPrimitive.Content>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & Props
>(
  (
    { children, trigger, portalProps, onOpenChange, open, ...props },
    forwardedRef
  ) => {
    const [dialogOpen, setDialogOpen] = useState(false)

    useEffect(() => {
      if (open !== undefined) {
        setDialogOpen(open)
        if (onOpenChange) {
          onOpenChange(open)
        }
      }
    }, [open])

    return (
      <DialogPrimitive.Root
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (onOpenChange) {
            onOpenChange(open)
          }
        }}
        open={dialogOpen}
      >
        <DialogPrimitive.DialogTrigger asChild>
          {trigger}
        </DialogPrimitive.DialogTrigger>
        <AnimatePresence>
          {dialogOpen && (
            <DialogPrimitive.DialogPortal forceMount {...portalProps}>
              <AnimatedOverlay />
              <AnimatedContent ref={forwardedRef} {...props} forceMount>
                {children}
              </AnimatedContent>
            </DialogPrimitive.DialogPortal>
          )}
        </AnimatePresence>
      </DialogPrimitive.Root>
    )
  }
)

export { Dialog, Content, AnimatedContent, Overlay, AnimatedOverlay }
