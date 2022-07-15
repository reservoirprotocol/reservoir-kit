import { useEffect, useState } from 'react'

export default function (price: number, symbol: string) {
  const [convertedPrice, setConvertedPrice] = useState<string | null>()

  useEffect(() => {
    fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${symbol}&ids=ethereum`
    )
      .then((response) => response.json())
      .then((resp) => {
        const data = resp[0]
        const formattedPrice = new Intl.NumberFormat(undefined, {
          style: 'currency',
          currency: symbol,
        }).format(price * data.current_price)
        setConvertedPrice(formattedPrice)
      })
      .catch((err) => {
        console.error(err.message)
      })
  }, [price, symbol])

  return convertedPrice
}
