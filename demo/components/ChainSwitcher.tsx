import { useContext } from 'react'
import chains from 'utils/chains'
import { ChainSwitcherContext } from '../pages/_app'

export default () => {
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
        // localStorage.removeItem('demo-theme')
      }}
      style={{ position: 'fixed', top: 16, right: 125 }}
    >
      {chains.map((chain) => (
        <option value={chain.id}>{chain.name}</option>
      ))}
    </select>
  )
}
