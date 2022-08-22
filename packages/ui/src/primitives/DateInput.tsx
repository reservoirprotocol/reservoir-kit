import Flatpickr from 'react-flatpickr'
import Input from './Input'
import React, {
  ComponentPropsWithoutRef,
  ComponentPropsWithRef,
  ElementRef,
  forwardRef,
} from 'react'

type FlatPickrProps = ComponentPropsWithoutRef<typeof Flatpickr>

type Props = Omit<ComponentPropsWithRef<typeof Input>, 'onChange' | 'value'> & {
  onChange: FlatPickrProps['onChange']
  value: FlatPickrProps['value']
  defaultValue: FlatPickrProps['defaultValue']
  options?: FlatPickrProps['options']
}

export default forwardRef<ElementRef<typeof Flatpickr>, Props>(
  ({ options, onChange, value, defaultValue, ...inputProps }, forwardedRef) => (
    <Flatpickr
      ref={forwardedRef}
      value={value}
      options={{ dateFormat: 'd/m/Y h:i K', ...options }}
      onChange={onChange}
      defaultValue={defaultValue}
      render={({ defaultValue }, ref) => {
        return <Input {...inputProps} ref={ref} defaultValue={defaultValue} />
      }}
    />
  )
)
