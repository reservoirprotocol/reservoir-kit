import { useEffect, useState } from 'react'

const useMutationObservable = (
  callback: MutationCallback,
  el?: HTMLElement | null,
  options?: MutationObserverInit
) => {
  const [observer, setObserver] = useState<MutationObserver | null>(null)

  useEffect(() => {
    if (observer) {
      observer.disconnect()
    }
    if (
      !el ||
      typeof window === 'undefined' ||
      !('MutationObserver' in window)
    ) {
      return
    }

    const obs = new MutationObserver(callback)
    obs.observe(el, options)
    setObserver(obs)

    return () => {
      obs.disconnect()
    }
  }, [el, callback, options])

  return observer
}

export default useMutationObservable
