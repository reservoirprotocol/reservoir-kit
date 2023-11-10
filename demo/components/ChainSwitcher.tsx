import { CSSProperties, useContext } from 'react'
import chains from 'utils/chains'
import { ChainSwitcherContext } from '../pages/_app'

export default ({ style }: { style?: CSSProperties }) => {
  const { setChain } = useContext(ChainSwitcherContext)

  return (
    <select
      onClick={(e) => {
        e.stopPropagation()
      }}
      onChange={(e) => {
        if (setChain) {
          setChain(+e.target.value)
        }
      }}
      style={{ position: 'fixed', top: 16, right: 125, ...style }}
    >
      {chains.map((chain) => (
        <option key={chain.id} value={chain.id}>{chain.name}</option>
      ))}
    </select>
  )
}
