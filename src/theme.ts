import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  colors: {
    brand: {
      50: '#e6fffa',
      100: '#b2f5ea',
      200: '#81e6d9',
      300: '#4fd1c5',
      400: '#38b2ac',
      500: '#319795',
      600: '#2c7a7b',
      700: '#285e61',
      800: '#234e52',
      900: '#1d4044',
    },
  },
  styles: {
    global: {
      'html, body': {
        margin: 0,
        padding: 0,
        width: '100%',
        height: '100%',
        bg: 'gray.50',
        color: 'gray.800',
      },
      '#root': {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'bold',
        borderRadius: 'lg',
      },
      variants: {
        solid: {
          bg: 'brand.500',
          color: 'white',
          _hover: {
            bg: 'brand.600',
            transform: 'translateY(-2px)',
            boxShadow: 'lg',
          },
          _active: {
            bg: 'brand.700',
            transform: 'translateY(0)',
          },
          transition: 'all 0.2s',
        },
      },
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: 'xl',
          boxShadow: 'lg',
          overflow: 'hidden',
          transition: 'all 0.3s ease-in-out',
          _hover: {
            transform: 'translateY(-4px)',
            boxShadow: 'xl',
          },
        },
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