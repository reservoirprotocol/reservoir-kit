import { CheckoutWithCard } from '@paperxyz/react-client-sdk'
import { executePaperSteps } from '@reservoir0x/reservoir-sdk'
import {
  ComponentProps,
  cloneElement,
  useEffect,
  useMemo,
  useState,
} from 'react'

export interface ICustomizationOptions {
  colorPrimary?: string
  colorBackground?: string
  colorText?: string
  borderRadius?: number
  fontFamily?: string
  inputBackgroundColor?: string
  inputBorderColor?: string
}

export type CreditCardProviders = 'PAPER'

interface CreditCardProviderProps {
  creditCardCheckoutComponent: JSX.Element | undefined
  callback: (status: `${CreditCardProviders}-${string}`) => void
}

export default ({
  creditCardCheckoutComponent,
  callback,
}: CreditCardProviderProps): JSX.Element | undefined => {
  const [stylingOptions, setStylingOptions] =
    useState<ICustomizationOptions | null>(null)

  useEffect(() => {
    const mockElementOne = window.document.createElement('div')

    mockElementOne.style.fontFamily = 'var(--rk-fonts-body)'
    mockElementOne.style.color = 'var(--rk-colors-textColor)'
    mockElementOne.style.backgroundColor = 'var(--rk-colors-inputBackground)'
    mockElementOne.style.borderRadius = 'var(--rk-radii-borderRadius)'

    window.document.body.appendChild(mockElementOne)

    setStylingOptions({
      fontFamily: window.getComputedStyle(mockElementOne).fontFamily,
      colorBackground: window.getComputedStyle(mockElementOne).background,
      colorPrimary: window.getComputedStyle(mockElementOne).color,
      colorText: window.getComputedStyle(mockElementOne).color,
      borderRadius: Number(
        window.getComputedStyle(mockElementOne).borderRadius
      ),
      inputBackgroundColor:
        window.getComputedStyle(mockElementOne).backgroundColor,
      inputBorderColor: 'transparent',
    })

    window.document.body.removeChild(mockElementOne)
  }, [])

  const CreditCardCheckoutComponent = useMemo(() => {
    if (!creditCardCheckoutComponent) return undefined

    const isPaperCheckoutComponent =
      creditCardCheckoutComponent?.props?.onPaymentSuccess

    if (isPaperCheckoutComponent !== undefined) {
      return cloneElement(creditCardCheckoutComponent, {
        options: stylingOptions,
        onPaymentSuccess: (event: { id: string; transactionId: string }) => {
          executePaperSteps(
            event.transactionId,
            creditCardCheckoutComponent?.props?.configs?.contractId,
            (_, status) => callback(`PAPER-${status}`)
          )
          creditCardCheckoutComponent?.props?.onPaymentSuccess(event)
        },
      } as ComponentProps<typeof CheckoutWithCard>)
    }

    return undefined
  }, [creditCardCheckoutComponent, stylingOptions])

  return CreditCardCheckoutComponent
}
