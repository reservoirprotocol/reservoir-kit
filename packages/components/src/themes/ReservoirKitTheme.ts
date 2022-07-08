export interface ReservoirKitTheme {
  borderRadius?: number
  font?: string
}

export const defaultTheme = (
  overrides?: ReservoirKitTheme
): ReservoirKitTheme => {
  return {
    borderRadius: overrides?.borderRadius || 4,
    font: overrides?.font || 'Inter',
  }
}
