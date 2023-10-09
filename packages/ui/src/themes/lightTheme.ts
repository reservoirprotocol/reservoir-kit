import {
  red,
  indigo,
  indigoA,
  gray,
  whiteA,
  blackA,
  green,
} from '@radix-ui/colors'
import {
  sharedThemeConfig,
  ReservoirKitTheme,
  ReservoirKitOverrides,
} from './ReservoirKitTheme'

export default function (overrides?: ReservoirKitOverrides): ReservoirKitTheme {
  let sharedTheme = sharedThemeConfig(overrides)

  return {
    colors: {
      ...indigo,
      ...indigoA,
      ...red,
      ...gray,
      ...blackA,
      ...whiteA,
      ...green,

      // accent colors
      accentBase: '$indigo1',
      accentBgSubtle: '$indigo2',
      accentBg: '$indigo3',
      accentBgHover: '$indigo4',
      accentBgActive: '$indigo5',
      accentLine: '$indigo6',
      accentBorder: '$indigo7',
      accentBorderHover: overrides?.primaryColor || '$indigo8',
      accentSolid: overrides?.primaryColor || '$indigo9',
      accentSolidHover:
        overrides?.primaryHoverColor || overrides?.primaryColor || '$indigo10',
      accentText: '$indigo11',
      accentTextContrast: '$indigo12',

      // neutral colors
      neutralBase: '$gray1',
      neutralBgSubtle: 'white',
      neutralBg: '$gray3',
      neutralBgHover: '$gray2',
      neutralBgActive: '$gray5',
      neutralLine: '$gray6',
      neutralBorder: '$gray7',
      neutralBorderHover: '$gray8',
      neutralSolid: '$gray9',
      neutralSolidHover: '$gray10',
      neutralText: '$gray11',
      neutralTextContrast: '$gray12',

      // secondary colors
      secondaryBase: '$indigoA1',
      secondaryBgSubtle: '$indigoA2',
      secondaryBg: '$indigoA3',
      secondaryBgHover: '$indigoA4',
      secondaryBgActive: '$indigoA5',
      secondaryLine: '$indigoA6',
      secondaryBorder: '$indigoA7',
      secondaryBorderHover: '$indigoA8',
      secondarySolid: '$indigoA9',
      secondarySolidHover: '$indigoA10',
      secondaryText: '$indigoA11',
      secondaryTextContrast: '$indigoA12',

      // general colors
      borderColor: overrides?.borderColor || '$neutralBorder',
      textColor: overrides?.textColor || '$neutralTextContrast',
      focusColor: '$neutralTextContrast',
      errorText: '$red12',
      errorAccent: '$red10',
      successAccent: '$green10',

      // component colors
      reservoirLogoColor: '#11181C',
      buttonTextColor: overrides?.buttonTextColor || 'white',
      buttonTextHoverColor: overrides?.buttonTextHoverColor || 'white',
      inputBackground: '$neutralBgHover',
      overlayBackground: overrides?.overlayBackground || '$blackA10',
      headerBackground: overrides?.headerBackground || '$neutralBgHover',
      footerBackground: overrides?.footerBackground || '$neutralBgHover',
      contentBackground: overrides?.contentBackground || '$neutralBgSubtle',
      wellBackground: overrides?.wellBackground || '$gray3',
      popoverBackground: overrides?.popoverBackground || '$neutralBase',
    },
    assets: {
      ethIcon: overrides?.ethIcon || 'gray',
      chainIcon: overrides?.chainIcon || 'light',
    },
    ...sharedTheme,
  }
}
