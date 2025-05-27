import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  styles: {
    global: {
      'html, body': {
        margin: 0,
        padding: 0,
        width: '100%',
        height: '100%',
        bg: 'gray.50',
      },
      '#root': {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      },
    },
  },
  breakpoints: {
    sm: '320px',
    md: '768px',
    lg: '960px',
    xl: '1200px',
    '2xl': '1536px',
  },
})

export default theme 