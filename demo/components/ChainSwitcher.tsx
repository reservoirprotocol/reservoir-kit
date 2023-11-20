import { CSSProperties, useContext, useEffect } from 'react'
import chains from 'utils/chains'
import { ChainSwitcherContext } from '../pages/_app'
import { useRouter } from 'next/router'

export default ({ style }: { style?: CSSProperties }) => {
  const { chain, setChain } = useContext(ChainSwitcherContext)
  const router = useRouter()

  useEffect(() => {
    if (chain && router.query.chainId != chain?.toString()) {
      router.query.chainId = chain?.toString()
      router.push(router, undefined, { shallow: true })
    }
  }, [chain])

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
      value={chain || 1}
    >
      {chains.map((chain) => (
        <option value={chain.id} key={chain.id}>{chain.name}</option>
      ))}
    </select>
  )
}
