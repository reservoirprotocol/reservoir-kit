import { useState } from 'react'

const useCopyToClipboard = (successTime: number = 1000) => {
  const [copied, setCopied] = useState(false)
  const copy = (content?: string) => {
    navigator.clipboard.writeText(content ? content : '')

    if (!copied) {
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
      }, successTime)
    }
  }

  return {
    copy,
    copied,
  }
}

export default useCopyToClipboard
