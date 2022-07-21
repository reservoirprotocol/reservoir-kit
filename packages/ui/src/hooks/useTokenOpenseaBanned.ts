import { isOpenSeaBanned } from '@reservoir0x/reservoir-kit-client'
import { useEffect, useState } from 'react'

export default function (contract?: string, token?: number | string) {
  const [isBanned, setIsBanned] = useState<boolean>(false)

  useEffect(() => {
    if (contract && token) {
      isOpenSeaBanned(contract, token)
        .then((isBanned) => {
          setIsBanned(isBanned)
        })
        .catch((e) => {
          console.error(e)
          setIsBanned(false)
        })
    } else {
      setIsBanned(false)
    }
  }, [contract, token])

  return isBanned
}
