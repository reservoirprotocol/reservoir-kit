import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

type Props = {
  deeplinkQuery?: string
}

export default ({ deeplinkQuery }: Props) => {
  const router = useRouter()
  const [deeplink, setDeeplink] = useState(false)

  useEffect(() => {
    if (!deeplink && router.query.deeplink !== undefined) {
      setDeeplink(true)
    }
  }, [router.query])

  return (
    <div>
      <label>Deeplink: </label>
      <input
        type="checkbox"
        checked={deeplink}
        onChange={(e) => {
          setDeeplink(e.target.checked)
          if (e.target.checked) {
            router.query.deeplink = deeplinkQuery || 'true'
          } else {
            delete router.query.deeplink
          }
          router.push(router)
        }}
      />
    </div>
  )
}
