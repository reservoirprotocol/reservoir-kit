import { getClient } from '@reservoir0x/reservoir-sdk'

export default () => {
  const client = getClient()
  let reservoirTitleEl = document.querySelector(
    "meta[property='reservoir:title']"
  )
  let title: null | string = null
  if (reservoirTitleEl) {
    title = reservoirTitleEl.getAttribute('content')
  }

  if (!title && client && client.source) {
    title = client.source
  } else if (!title) {
    title = location ? location.hostname.replace('www.', '') : ''
  }

  const reservoirIconEl = document.querySelector(
    "meta[property='reservoir:icon']"
  )
  let icon: null | string = null
  if (reservoirIconEl) {
    icon = reservoirIconEl.getAttribute('content')
  }

  if (!icon) {
    const favicon = document.querySelector("link[rel*='icon']")
    if (favicon) {
      icon = favicon.getAttribute('href')
    }
  }

  return {
    title,
    icon,
  }
}
