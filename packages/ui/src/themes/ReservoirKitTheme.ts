export interface ReservoirKitTheme {
  borderRadius?: number
  font?: string
  buttonFont?: string
  headlineFont: string
  primaryColor?: string
  primaryHoverColor?: string
  wellBackground?: string
  textColor?: string
  headerBackground?: string
  contentBackground?: string
  footerBackground?: string
  overlayBackground?: string
  borderColor?: string
}

export const sharedThemeConfig = (overrides?: ReservoirKitTheme) => {
  return {
    borderRadius: overrides?.borderRadius || 4,

    fonts: {
      body: overrides?.font || 'sans-serif',
      button: overrides?.buttonFont || overrides?.font || 'sans-serif',
      headline: overrides?.headlineFont || overrides?.font || 'sans-serif',
    },
  }
}
