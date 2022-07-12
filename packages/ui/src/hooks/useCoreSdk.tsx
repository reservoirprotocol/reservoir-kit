import { ReservoirCoreContext } from '../ReservoirCoreProvider'
import { useContext } from 'react'

export default function () {
  return useContext(ReservoirCoreContext)
}
