export const paramsToQueryString = (params: {}) => {
  if (!params) {
    return ''
  }

  return (
    Object.keys(params)
      //@ts-ignore
      .map((key) => `${key}=${params[key]}`)
      .join('&')
  )
}
