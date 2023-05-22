import { formatUnits } from 'viem'

const isSafariBrowser = () =>
  typeof window !== 'undefined' &&
  navigator.userAgent.indexOf('Safari') > -1 &&
  navigator.userAgent.indexOf('Chrome') <= -1

function toFixed(num: number, fixed: number) {
  const re = new RegExp('^-?\\d+(?:.\\d{0,' + (fixed || -1) + '})?')
  const fixedNum = num.toString().match(re)
  return fixedNum ? fixedNum[0] : num
}

function formatNumber(
  amount: number | null | undefined,
  maximumFractionDigits: number = 2
) {
  const { format } = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: maximumFractionDigits,
  })
  if (!amount) {
    return '-'
  }
  return format(amount)
}

const truncateFractionAndFormat = (
  parts: Intl.NumberFormatPart[],
  digits: number
) => {
  return parts
    .map(({ type, value }) => {
      if (type !== 'fraction' || !value || value.length < digits) {
        return value
      }

      let formattedValue = ''
      for (let idx = 0; idx < value.length && idx < digits; idx++) {
        formattedValue += value[idx]
      }
      return formattedValue
    })
    .reduce((string, part) => string + part)
}

/**
 *  Convert ETH values to human readable formats
 * @param amount An ETH amount
 * @param maximumFractionDigits Number of decimal digits
 * @returns returns the ETH value as a `string` or `-` if the amount is `null` or `undefined`
 */
function formatBN(
  amount: string | number | bigint | null | undefined,
  maximumFractionDigits: number,
  decimals: number = 18
) {
  if (typeof amount === 'undefined' || amount === null) return '-'

  const amountToFormat =
    typeof amount === 'number'
      ? amount
      : +formatUnits(BigInt(amount), decimals || 18)

  const amountFraction = `${amount}`.split('.')[1]
  const isSafari = isSafariBrowser()
  const formatOptions: Intl.NumberFormatOptions = {
    minimumFractionDigits: 0,
    maximumFractionDigits: 20,
    useGrouping: true,
    notation: 'compact',
    compactDisplay: 'short',
  }

  // New issue introduced in Safari v16 causes a regression and now need lessPrecision flagged in format options
  if (isSafari) {
    //@ts-ignore
    formatOptions.roundingPriority = 'lessPrecision'
  }

  const parts = new Intl.NumberFormat('en-US', formatOptions).formatToParts(
    amountToFormat
  )

  // Safari has a few bugs with the fraction part of formatToParts, sometimes rounding when unnecessary and
  // when amount is in the thousands not properly representing the value in compact display. Until the bug is fixed
  // this workaround should help. bugzilla bug report: https://bugs.webkit.org/show_bug.cgi?id=249231
  // Update: this has been fixed, but still applied for >v15.3 and <v16

  if (isSafari) {
    const partTypes = parts.map((part) => part.type)
    const partsIncludesFraction = partTypes.includes('fraction')
    const partsIncludeCompactIdentifier = partTypes.includes('compact')
    if (amountFraction) {
      if (!partsIncludesFraction && !partsIncludeCompactIdentifier) {
        const integerIndex = parts.findIndex((part) => part.type === 'integer')
        parts.splice(
          integerIndex + 1,
          0,
          {
            type: 'decimal',
            value: '.',
          },
          {
            type: 'fraction',
            value: amountFraction,
          }
        )
      }
    } else if (!partsIncludesFraction && partsIncludeCompactIdentifier) {
      const compactIdentifier = parts.find((part) => part.type === 'compact')
      const integerIndex = parts.findIndex((part) => part.type === 'integer')
      const integer = parts[integerIndex]
      if (compactIdentifier?.value === 'K' && integer) {
        const fraction = `${amount}`.replace(integer.value, '')[0]
        if (fraction && Number(fraction) > 0) {
          parts.splice(
            integerIndex + 1,
            0,
            {
              type: 'decimal',
              value: '.',
            },
            {
              type: 'fraction',
              value: fraction,
            }
          )
        }
      }
    }
  }

  if (parts && parts.length > 0) {
    const lowestValue = Number(
      `0.${new Array(maximumFractionDigits).join('0')}1`
    )

    if (amountToFormat > 1000) {
      return truncateFractionAndFormat(parts, 1)
    } else if (
      amountToFormat < 1 &&
      amountToFormat < lowestValue &&
      amountToFormat !== 0
    ) {
      return `< ${lowestValue}`
    } else {
      return truncateFractionAndFormat(parts, maximumFractionDigits)
    }
  } else {
    return typeof amount === 'string' || typeof amount === 'number'
      ? `${amount}`
      : ''
  }
}

export { formatBN, formatNumber, toFixed }
