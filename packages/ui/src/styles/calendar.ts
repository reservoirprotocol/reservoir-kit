import { globalCss, keyframes } from '../../stitches.config'

const fpFadeInDown = keyframes({
  '0%': {
    opacity: 0,
    transform: 'translate3d(0, -20px, 0)',
  },
  '100%': {
    opacity: 1,
    transform: 'translate3d(0, 0, 0)',
  },
})

const calendarCss = globalCss({
  '.flatpickr-calendar': {
    opacity: 0,
    display: 'none',
    textAlign: 'center',
    visibility: 'hidden',
    padding: 20,
    animation: 'none',
    direction: 'ltr',
    fontSize: 14,
    lineHeight: '24px',
    borderRadius: 5,
    position: 'absolute',
    width: 307.875,
    boxSizing: 'border-box',
    touchAction: 'manipulation',
    backgroundColor: '$contentBackground',
    boxShadow:
      '1px 0 0 #20222c, -1px 0 0 #20222c, 0 1px 0 #20222c, 0 -1px 0 #20222c, 0 3px 13px rgba(0,0,0,0.08)',
    border: '1px solid $borderColor',
    fontFamily: '$body',
  },
  '.flatpickr-calendar.open': {
    opacity: 1,
    maxHeight: 640,
    visibility: 'visible',
    display: 'inline-block',
    zIndex: 99999,
    pointerEvents: 'all',
  },
  '.flatpickr-calendar.inline': {
    opacity: 1,
    maxHeight: 640,
    visibility: 'visible',
    display: 'block',
    position: 'relative',
    top: 2,
  },
  '.flatpickr-calendar.animate.open': {
    animation: `${fpFadeInDown} 300ms cubic-bezier(0.23, 1, 0.32, 1)`,
  },
  '.flatpickr-calendar.static': {
    position: 'absolute',
    top: 'calc(100% + 2px)',
  },
  '.flatpickr-calendar.static.open': {
    zIndex: 999,
    display: 'block',
  },
  '.flatpickr-calendar.multiMonth .flatpickr-days .dayContainer:nth-child(n+1) .flatpickr-day.inRange:nth-child(7n+7)':
    {
      boxShadow: 'none !important',
    },
  '.flatpickr-calendar.multiMonth .flatpickr-days .dayContainer:nth-child(n+2) .flatpickr-day.inRange:nth-child(7n+1)':
    {
      boxShadow: '-2px 0 0 #e6e6e6, 5px 0 0 #e6e6e6',
    },
  '.flatpickr-calendar .hasWeeks .dayContainer': {
    borderBottom: 0,
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderLeft: 0,
  },
  '.flatpickr-calendar .hasTime .dayContainer': {
    borderBottom: 0,
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
  },
  '.flatpickr-calendar.hasTime .flatpickr-time': {
    height: 40,
  },
  '.flatpickr-calendar.noCalendar.hasTime .flatpickr-time': {
    height: 'auto',
  },
  '.flatpickr-calendar:before': {
    position: 'absolute',
    display: 'block',
    pointerEvents: 'none',
    border: 'solid transparent',
    content: '',
    height: 0,
    width: 0,
    left: 22,
    borderWidth: 5,
    margin: '0 -5px',
  },
  '.flatpickr-calendar:after': {
    position: 'absolute',
    display: 'block',
    pointerEvents: 'none',
    border: 'solid transparent',
    content: '',
    height: 0,
    width: 0,
    left: 22,
    borderWidth: 4,
    margin: '0 -4px',
  },
  '.flatpickr-calendar.rightMost:before, .flatpickr-calendar.arrowRight:before, .flatpickr-calendar.rightMost:after, .flatpickr-calendar.arrowRight:after':
    {
      left: 'auto',
      right: 22,
    },
  '.flatpickr-calendar.arrowCenter:before, .flatpickr-calendar.arrowCenter:after':
    {
      left: '50%',
      right: '50%',
    },
  '.flatpickr-calendar.arrowTop:before, .flatpickr-calendar.arrowTop:after': {
    bottom: '100%',
  },
  '.flatpickr-calendar.arrowTop:before': {
    display: 'none',
  },
  '.flatpickr-calendar.arrowTop:after': {
    display: 'none',
  },
  '.flatpickr-calendar.arrowBottom:before, .flatpickr-calendar.arrowBottom:after':
    {
      top: '100%',
    },
  '.flatpickr-calendar.arrowBottom:before': {
    display: 'none',
  },
  '.flatpickr-calendar.arrowBottom:after': {
    display: 'none',
  },
  '.flatpickr-calendar:focus': {
    outline: 0,
  },
  '.flatpickr-wrapper': {
    position: 'relative',
    display: 'inline-block',
  },
  '.flatpickr-months': {
    display: 'flex',
  },
  '.flatpickr-months .flatpickr-month': {
    backgroundColor: '$contentBackground',
    color: '$neutralTextContrast',
    fill: '$neutralTextContrast',
    height: 34,
    lineHeight: '1px',
    textAlign: 'center',
    position: 'relative',
    userSelect: 'none',
    overflow: 'hidden',
    flex: 1,
    marginBottom: 8,
  },
  '.flatpickr-months .flatpickr-prev-month, .flatpickr-months .flatpickr-next-month':
    {
      userSelect: 'none',
      textDecoration: 'none',
      cursor: 'pointer',
      position: 'absolute',
      top: 20,
      height: 34,
      padding: 10,
      zIndex: 3,
      color: '$neutralText',
      fill: '$neutralText',
    },
  '.flatpickr-months .flatpickr-prev-month.flatpickr-disabled, .flatpickr-months .flatpickr-next-month.flatpickr-disabled':
    {
      display: 'none',
    },
  '.flatpickr-months .flatpickr-prev-month i, .flatpickr-months .flatpickr-next-month i':
    {
      position: 'relative',
    },
  '.flatpickr-months .flatpickr-prev-month.flatpickr-prev-month, .flatpickr-months .flatpickr-next-month.flatpickr-prev-month':
    {
      left: 0,
    },
  '.flatpickr-months .flatpickr-prev-month.flatpickr-next-month, .flatpickr-months .flatpickr-next-month.flatpickr-next-month':
    {
      right: 0,
    },
  '.flatpickr-months .flatpickr-prev-month:hover, .flatpickr-months .flatpickr-next-month:hover':
    {
      color: '$neutralText',
    },
  '.flatpickr-months .flatpickr-prev-month:hover svg, .flatpickr-months .flatpickr-next-month:hover svg':
    {
      fill: '$neutralTextContrast',
    },
  '.flatpickr-months .flatpickr-prev-month svg, .flatpickr-months .flatpickr-next-month svg':
    {
      width: 14,
      height: 14,
    },
  '.flatpickr-months .flatpickr-prev-month svg path, .flatpickr-months .flatpickr-next-month svg path':
    {
      transition: 'fill 0.1s',
      fill: 'inherit',
    },
  '.numInputWrapper': {
    position: 'relative',
    height: 'auto',
  },
  '.numInputWrapper input, .numInputWrapper span': {
    display: 'inline-block',
  },
  '.numInputWrapper input': {
    width: '100%',
  },
  '.numInputWrapper input::-ms-clear': {
    display: 'none',
  },
  '.numInputWrapper input::-webkit-outer-spin-button, .numInputWrapper input::-webkit-inner-spin-button':
    {
      margin: 0,
      '-webkit-appearance': 'none',
    },
  '.numInputWrapper span': {
    position: 'absolute',
    right: 0,
    width: 14,
    padding: '0 4px 0 2px',
    height: '50%',
    lineHeight: '50%',
    opacity: 0,
    cursor: 'pointer',
    boxSizing: 'border-box',
  },
  '.numInputWrapper span:hover': {
    background: '$neutralBgHover',
  },
  '.numInputWrapper span:active': {
    background: '$neutralBgActive',
  },
  '.numInputWrapper span:after': {
    display: 'block',
    content: '',
    position: 'absolute',
  },
  '.numInputWrapper span.arrowUp': {
    top: 0,
    borderBottom: 0,
  },
  '.numInputWrapper span.arrowUp:after': {
    borderLeft: '4px solid transparent',
    borderRight: '4px solid transparent',
    borderBottom: '4px solid $neutralText',
    top: '26%',
  },
  '.numInputWrapper span.arrowDown': {
    top: '50%',
  },
  '.numInputWrapper span.arrowDown:after': {
    borderLeft: '4px solid transparent',
    borderRight: '4px solid transparent',
    borderTop: '4px solid $neutralText',
    top: '40%',
  },
  '.numInputWrapper span svg': {
    width: 'inherit',
    height: 'auto',
  },
  '.numInputWrapper span svg path': {
    fill: '$neutralBgHover',
  },
  '.numInputWrapper:hover': {
    background: '$neutralBgHover',
  },
  '.numInputWrapper:hover span': {
    opacity: 1,
  },
  '.flatpickr-current-month': {
    fontSize: '135%',
    fontWeight: 300,
    color: '$neutralText',
    position: 'absolute',
    width: '83%',
    left: '12.5%',
    lineHeight: '1px',
    height: 34,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    textAlign: 'center',
    transform: 'translate3d(0px, 0px, 0px)',
  },
  '.flatpickr-current-month span.cur-month': {
    fontFamily: 'inherit',
    fontWeight: 700,
    color: '$neutralText',
    display: 'inline-block',
    marginLeft: '0.5ch',
    padding: 0,
  },
  '.flatpickr-current-month span.cur-month:hover': {
    background: 'rgba(192,187,167,0.05)',
  },
  '.flatpickr-current-month .numInputWrapper': {
    width: '7ch\0',
    display: 'inline-block',
  },
  '.flatpickr-current-month .numInputWrapper span.arrowUp:after': {
    borderBottomColor: '$neutralText',
  },
  '.flatpickr-current-month .numInputWrapper span.arrowDown:after': {
    borderTopColor: '$neutralText',
  },
  '.flatpickr-current-month input.cur-year': {
    backgroundColor: 'transparent',
    boxSizing: 'border-box',
    color: '$neutralText',
    cursor: 'text',
    margin: 0,
    display: 'inline-block',
    fontSize: 'inherit',
    fontFamily: 'inherit',
    lineHeight: 'inherit',
    height: 'auto',
    border: 0,
    borderRadius: 0,
    verticalAlign: 'initial',
    appearance: 'textfield',
    padding: '4px 0px',
  },
  '.flatpickr-current-month input.cur-year:focus': {
    outline: 0,
  },
  '.flatpickr-current-month input.cur-year[disabled], .flatpickr-current-month input.cur-year[disabled]:hover':
    {
      fontSize: '100%',
      color: '$neutralText',
      background: 'transparent',
      pointerEvents: 'none',
    },
  '.flatpickr-current-month .flatpickr-monthDropdown-months': {
    appearance: 'menulist',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: 0,
    boxSizing: 'border-box',
    color: '$neutralText',
    cursor: 'pointer',
    fontSize: 'inherit',
    fontFamily: 'inherit',
    height: 'auto',
    lineHeight: 'inherit',
    outline: 'none',
    position: 'relative',
    verticalAlign: 'initial',
    width: 'auto',
    padding: '4px 8px',
  },
  '.flatpickr-current-month .flatpickr-monthDropdown-months:focus, .flatpickr-current-month .flatpickr-monthDropdown-months:active':
    {
      outline: 'none',
    },
  '.flatpickr-current-month .flatpickr-monthDropdown-months:hover': {
    backgroundColor: '$neutralBgHover',
  },
  '.flatpickr-current-month .flatpickr-monthDropdown-months .flatpickr-monthDropdown-month':
    {
      backgroundColor: '$neutralBg',
      outline: 'none',
      padding: 0,
    },
  '.flatpickr-weekdays': {
    backgroundColor: 'transparent',
    color: '$neutralText',
    textAlign: 'center',
    overflow: 'hidden',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    height: 28,
    border: 'transparent',
    marginBottom: 8,
  },
  '.flatpickr-weekdays .flatpickr-weekdaycontainer': {
    display: 'flex',
    flex: 1,
  },
  'span.flatpickr-weekday': {
    cursor: 'default',
    fontSize: '90%',
    background: 'transparent',
    color: '$neutralText',
    lineHeight: '1px',
    margin: 0,
    textAlign: 'center',
    display: 'block',
    flex: 1,
    fontWeight: 'bolder',
  },
  '.dayContainer, .flatpickr-weeks': {
    padding: '1px 0 0 0',
  },
  '.flatpickr-days': {
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'flex-start',
    width: 307.875,
    marginBottom: 12,
  },
  '.flatpickr-days:focus': {
    outline: 0,
  },
  '.dayContainer': {
    padding: 0,
    outline: 0,
    textAlign: 'left',
    width: 307.875,
    minWidth: 307.875,
    maxWidth: 307.875,
    boxSizing: 'border-box',
    display: 'flex',
    flexWrap: 'wrap',
    '-ms-flex-pack': 'justify',
    justifyContent: 'space-around',
    transform: 'translate3d(0px, 0px, 0px)',
    opacity: 1,
  },
  '.dayContainer + .dayContainer': {
    boxShadow: '-1px 0 0 #20222c',
  },
  '.flatpickr-day': {
    background: 'none',
    border: '1px solid transparent',
    borderRadius: 150,
    boxSizing: 'border-box',
    color: '$neutralText',
    cursor: 'pointer',
    fontWeight: 400,
    width: '14.2857143%',
    flexBasis: '14.2857143%',
    maxWidth: 39,
    height: 39,
    lineHeight: '39px',
    margin: 0,
    display: 'inline-block',
    position: 'relative',
    '-webkit-box-pack': 'center',
    '-ms-flex-pack': 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  '.flatpickr-day.inRange, .flatpickr-day.prevMonthDay.inRange, .flatpickr-day.nextMonthDay.inRange, .flatpickr-day.today.inRange, .flatpickr-day.prevMonthDay.today.inRange, .flatpickr-day.nextMonthDay.today.inRange, .flatpickr-day:hover, .flatpickr-day.prevMonthDay:hover, .flatpickr-day.nextMonthDay:hover, .flatpickr-day:focus, .flatpickr-day.prevMonthDay:focus, .flatpickr-day.nextMonthDay:focus':
    {
      cursor: 'pointer',
      outline: 0,
      backgroundColor: '$accentBg',
      borderColor: '$neutralBorder',
    },
  '.flatpickr-day.today': {
    borderColor: '$neutralBorder',
  },
  '.flatpickr-day.today:hover, .flatpickr-day.today:focus': {
    borderColor: '$neutralBorder',
    backgroundColor: '$neutralBg',
    color: '$buttonTextColor',
  },
  '.flatpickr-day.selected, .flatpickr-day.startRange, .flatpickr-day.endRange, .flatpickr-day.selected.inRange, .flatpickr-day.startRange.inRange, .flatpickr-day.endRange.inRange, .flatpickr-day.selected:focus, .flatpickr-day.startRange:focus, .flatpickr-day.endRange:focus, .flatpickr-day.selected:hover, .flatpickr-day.startRange:hover, .flatpickr-day.endRange:hover, .flatpickr-day.selected.prevMonthDay, .flatpickr-day.startRange.prevMonthDay, .flatpickr-day.endRange.prevMonthDay, .flatpickr-day.selected.nextMonthDay, .flatpickr-day.startRange.nextMonthDay, .flatpickr-day.endRange.nextMonthDay':
    {
      backgroundColor: '$accentBg',
      boxShadow: 'none',
      color: '$neutralTextContrast',
      borderColor: '$borderColor',
    },
  '.flatpickr-day.selected.startRange, .flatpickr-day.startRange.startRange, .flatpickr-day.endRange.startRange':
    {
      borderRadius: '50px 0 0 50px',
    },
  '.flatpickr-day.selected.endRange, .flatpickr-day.startRange.endRange, .flatpickr-day.endRange.endRange':
    {
      borderRadius: '0 50px 50px 0',
    },
  '.flatpickr-day.selected.startRange + .endRange:not(:nth-child(7n+1)), .flatpickr-day.startRange.startRange + .endRange:not(:nth-child(7n+1)), .flatpickr-day.endRange.startRange + .endRange:not(:nth-child(7n+1))':
    {
      boxShadow: '-10px 0 0 #80cbc4',
    },
  '.flatpickr-day.selected.startRange.endRange, .flatpickr-day.startRange.startRange.endRange, .flatpickr-day.endRange.startRange.endRange':
    {
      borderRadius: 50,
    },
  '.flatpickr-day.inRange': {
    borderRadius: 0,
    boxShadow: '-5px 0 0 #646c8c, 5px 0 0 #646c8c',
  },
  '.flatpickr-day.flatpickr-disabled, .flatpickr-day.flatpickr-disabled:hover, .flatpickr-day.prevMonthDay, .flatpickr-day.nextMonthDay, .flatpickr-day.notAllowed, .flatpickr-day.notAllowed.prevMonthDay, .flatpickr-day.notAllowed.nextMonthDay':
    {
      color: '$neutralText',
      background: 'transparent',
      borderColor: 'transparent',
      cursor: 'default',
    },
  '.flatpickr-day.flatpickr-disabled, .flatpickr-day.flatpickr-disabled:hover':
    {
      cursor: 'not-allowed',
      color: '$neutralText',
      opacity: 0.5,
    },
  '.flatpickr-day.week.selected': {
    borderRadius: 0,
    boxShadow: '-5px 0 0 #80cbc4, 5px 0 0 #80cbc4',
  },
  '.flatpickr-day.hidden': {
    visibility: 'hidden',
  },
  '.rangeMode .flatpickr-day': {
    marginTop: 1,
  },
  '.flatpickr-weekwrapper': {
    float: 'left',
  },
  '.flatpickr-weekwrapper .flatpickr-weeks': {
    padding: '0 12px',
    boxShadow: '1px 0 0 #20222c',
  },
  '.flatpickr-weekwrapper .flatpickr-weekday': {
    float: 'none',
    width: '100%',
    lineHeight: '28px',
  },
  '.flatpickr-weekwrapper span.flatpickr-day, .flatpickr-weekwrapper span.flatpickr-day:hover':
    {
      display: 'block',
      width: '100%',
      maxWidth: 'none',
      color: '$neutralText',
      background: 'transparent',
      cursor: 'default',
      border: 'none',
    },
  '.flatpickr-innerContainer': {
    display: 'flex',
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  '.flatpickr-rContainer': {
    display: 'inline-block',
    padding: 0,
    boxSizing: 'border-box',
  },
  '.flatpickr-time': {
    textAlign: 'center',
    outline: 0,
    height: 0,
    lineHeight: '40px',
    maxHeight: 40,
    boxSizing: 'border-box',
    overflow: 'hidden',
    display: 'flex',
  },
  '.flatpickr-time:after': {
    content: '',
    display: 'table',
    clear: 'both',
  },
  '.flatpickr-time .numInputWrapper': {
    flex: 1,
    width: '40%',
    height: 40,
    float: 'left',
  },
  '.flatpickr-time .numInputWrapper span.arrowUp:after': {
    borderBottomColor: '$neutralText',
  },
  '.flatpickr-time .numInputWrapper span.arrowDown:after': {
    borderTopColor: '$neutralText',
  },
  '.flatpickr-time.hasSeconds .numInputWrapper': {
    width: '26%',
  },
  '.flatpickr-time.time24hr .numInputWrapper': {
    width: '49%',
  },
  '.flatpickr-time input': {
    background: 'transparent',
    boxShadow: 'none',
    border: 0,
    borderRadius: 0,
    textAlign: 'center',
    margin: 0,
    padding: 0,
    height: 'inherit',
    lineHeight: 'inherit',
    color: '$neutralText',
    fontSize: 14,
    position: 'relative',
    boxSizing: 'border-box',
    appearance: 'textfield',
  },
  '.flatpickr-time input.flatpickr-hour': {},
  '.flatpickr-time input.flatpickr-minute, .flatpickr-time input.flatpickr-second':
    {
      fontWeight: 400,
    },
  '.flatpickr-time input:focus': {
    outline: 0,
    border: 0,
  },
  '.flatpickr-time .flatpickr-time-separator, .flatpickr-time .flatpickr-am-pm':
    {
      height: 'inherit',
      float: 'left',
      lineHeight: 'inherit',
      color: '$neutralText',
      fontWeight: 'bold',
      width: '2%',
      userSelect: 'none',
      '-ms-flex-item-align': 'center',
      alignSelf: 'center',
    },
  '.flatpickr-time .flatpickr-am-pm': {
    outline: 0,
    width: '18%',
    cursor: 'pointer',
    textAlign: 'center',
    fontWeight: 400,
  },
  '.flatpickr-time input:hover, .flatpickr-time .flatpickr-am-pm:hover, .flatpickr-time input:focus, .flatpickr-time .flatpickr-am-pm:focus':
    {
      background: '$neutralBgHover',
    },
  '.flatpickr-input[readonly]': {
    cursor: 'pointer',
  },
  '.flatpickr-input.flatpickr-mobile': {
    '&::-webkit-inner-spin-button': {
      display: 'none',
      '-webkit-appearance': 'none',
    },
    '&::-webkit-calendar-picker-indicator': {
      position: 'absolute',
      left: 0,
      top: 0,
      width: '100%',
      height: '100%',
      backgroundImage: 'none',
    },
    '&::-webkit-datetime-edit': {
      display: 'none',
      '-webkit-appearance': 'none',
    },
    '&::-webkit-date-and-time-value': {
      display: 'none',
      '-webkit-appearance': 'none',
    },
  },
  '@-moz-document url-prefix()': {
    '@media only screen and (max-width: 600px)': {
      '.flatpickr-input[type="text"]': {
        color: 'transparent',
      },
    },
  },
})

export default calendarCss
