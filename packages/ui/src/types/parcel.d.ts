declare module 'data-url:*' {
  const value: string
  export default value
}

declare module 'url:*' {
  const value: string
  export default value
}

declare module '*.jpg'
declare module '*.gif'
declare module '*.css'

declare module JSX {
  interface IntrinsicElements {
    'model-viewer': any
  }
}
