import { useContext } from 'react'
import { ThemeSwitcherContext } from '../pages/_app'
import { lightTheme, darkTheme } from '@reservoir0x/reservoir-kit-ui'
import { useTheme } from 'next-themes'

const getDemoThemeFromOption = (option: string) => {
  switch (option) {
    case 'light': {
      return 'light'
    }
    case 'dark': {
      return 'dark'
    }
    case 'decent': {
      return 'light'
    }
    case 'reservoir': {
      return 'light'
    }
    default: {
      return 'dark'
    }
  }
}

const getThemeFromOption = (option: string) => {
  switch (option) {
    case 'light': {
      return lightTheme({
        ethIcon: 'glyph',
      })
    }
    case 'dark': {
      return darkTheme()
    }
    case 'decent': {
      return lightTheme({
        font: 'ABC Monument Grotesk',
        primaryColor: 'black',
        primaryHoverColor: 'rgb(153 105 255)',
        headerBackground: 'rgb(246, 234, 229)',
        contentBackground: '#fbf3f0',
        footerBackground: 'rgb(246, 234, 229)',
        textColor: 'rgb(55, 65, 81)',
        borderColor: 'rgba(0,0,0, 0)',
        overlayBackground: 'rgba(31, 41, 55, 0.75)',
      })
    }
    case 'reservoir': {
      return lightTheme({
        font: 'Inter',
        primaryColor: '#7000FF',
      })
    }
    default: {
      return darkTheme()
    }
  }
}

export default () => {
  const { setTheme } = useContext(ThemeSwitcherContext)
  const { setTheme: setDemoTheme } = useTheme()

  return (
    <select
      onClick={(e) => {
        e.stopPropagation()
      }}
      onChange={(e) => {
        setTheme(getThemeFromOption(e.target.value))
        setDemoTheme(getDemoThemeFromOption(e.target.value))
        localStorage.removeItem('demo-theme')
      }}
      style={{ position: 'fixed', top: 16, right: 16 }}
    >
      <option value="dark">Dark Theme</option>
      <option value="light">Light Theme</option>
      <option value="decent">Decent</option>
      <option value="reservoir">Reservoir</option>
    </select>
  )
}
