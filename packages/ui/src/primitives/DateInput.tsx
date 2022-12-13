import { default as FlatpickrModule } from 'react-flatpickr'
import Input from './Input'
import React, {
  ComponentPropsWithoutRef,
  ComponentPropsWithRef,
  ElementRef,
  forwardRef,
} from 'react'

//@ts-ignore
const Flatpickr = FlatpickrModule.default

type FlatPickrProps = ComponentPropsWithoutRef<typeof Flatpickr>

type Props = Omit<ComponentPropsWithRef<typeof Input>, 'onChange' | 'value'> & {
  onChange: FlatPickrProps['onChange']
  value: FlatPickrProps['value']
  defaultValue: FlatPickrProps['defaultValue']
  options?: FlatPickrProps['options']
}

export default forwardRef<ElementRef<typeof Flatpickr>, Props>(
  ({ options, onChange, value, defaultValue, ...inputProps }, forwardedRef) => {
    return (
      <Flatpickr
        ref={forwardedRef}
        value={value}
        options={{ dateFormat: 'm/d/Y h:i K', ...options }}
        onChange={onChange}
        defaultValue={defaultValue}
        render={({ defaultValue }: any, ref: any) => {
          return <Input {...inputProps} ref={ref} defaultValue={defaultValue} />
        }}
      />
    )
  }
)
