// import { default as FlatpickrModule } from 'react-flatpickr'
import { DayPicker } from 'react-day-picker'
import Input from './Input'
import React, {
  ComponentPropsWithoutRef,
  ComponentPropsWithRef,
  ElementRef,
  forwardRef,
} from 'react'
import Popover from './Popover'
import { PopoverTrigger } from '@radix-ui/react-popover'
import Flex from './Flex'
import Button from './Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendar } from '@fortawesome/free-solid-svg-icons'

//@ts-ignore
// const Flatpickr = FlatpickrModule.default

// type FlatPickrProps = ComponentPropsWithoutRef<typeof Flatpickr>

// type Props = Omit<ComponentPropsWithRef<typeof Input>, 'onChange' | 'value'> & {
//   onChange: FlatPickrProps['onChange']
//   value: FlatPickrProps['value']
//   defaultValue: FlatPickrProps['defaultValue']
//   options?: FlatPickrProps['options']
// }

export default () => {
  const [selected, setSelected] = React.useState<Date>()
  const [timeValue, setTimeValue] = React.useState<string>('')

  const handleTimeChange: React.ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    const time = event.target.value
    if (selected) {
      const [hours, minutes] = time.split(':').map((str) => parseInt(str, 10))
      const newDate = new Date(
        selected.getFullYear(),
        selected.getMonth(),
        selected.getDate(),
        hours,
        minutes
      )
      setSelected(newDate)
    } else {
      setTimeValue(time)
    }
  }

  const handleDaySelect = (date: Date | undefined) => {
    if (timeValue && date) {
      const [hours, minutes] = timeValue
        .split(':')
        .map((str) => parseInt(str, 10))
      const newDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        hours,
        minutes
      )
      setSelected(newDate)
    } else {
      setSelected(date)
    }
  }
  return (
    <Popover
      content={
        <Flex direction="column">
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={handleDaySelect}
          />
          <input type="time" onChange={handleTimeChange} />
        </Flex>
      }
    >
      <Button>
        <FontAwesomeIcon icon={faCalendar} width={14} height={16} />
        {/* <CalendarIcon className="mr-2 h-4 w-4" /> */}
        Pick a date
        {/* {date ? format(date, 'PPP') : <span>Pick a date</span>} */}
      </Button>
    </Popover>
  )
}
