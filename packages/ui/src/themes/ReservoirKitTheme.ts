export interface ReservoirKitTheme {
  borderRadius?: number
  font?: string
  primaryColor?: string
}

export const defaultTheme = (overrides?: ReservoirKitTheme): any => {
  return {
    borderRadius: overrides?.borderRadius || 4,
    colors: {
      primary9: overrides?.primaryColor,
      primary10: overrides?.primaryColor,
    },
    fonts: {
      body: overrides?.font || 'san-serif',
      button: overrides?.font || 'sans-serif',
    },
  }
}
