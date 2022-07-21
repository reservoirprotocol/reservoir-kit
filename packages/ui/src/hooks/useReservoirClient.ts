import { ReservoirClientContext } from '../ReservoirClientProvider'
import { useContext } from 'react'

export default function () {
  return useContext(ReservoirClientContext)
}
