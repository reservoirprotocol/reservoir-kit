import { useEffect, useState } from 'react'

export default function (symbol?: string) {
  const [marketPrice, setMarketPrice] = useState<number | null>()

  useEffect(() => {
    if (symbol) {
      fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${symbol}&ids=ethereum`
      )
        .then((response) => response.json())
        .then((resp) => {
          setMarketPrice(resp[0].current_price)
        })
        .catch((err) => {
          console.error(err.message)
        })
    }
  }, [symbol])

  return marketPrice
}
