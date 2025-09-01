import { heroui } from '@heroui/react'

export default {
  content: [
    'index.html',
    './src/**/*.{js,jsx,ts,tsx,html}',
    './node_modules/@heroui/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        editor: '#F8FAFC',
      },
      textColor: {
        gray: '#6B7280',
      },
      borderColor: {
        gray: '#F0F0F0',
      },
    },
  },
  darkMode: 'class',
  plugins: [
    heroui({
      addCommonColors: true,
      defaultTheme: 'light',
      defaultExtendTheme: 'light',
      themes: {
        light: {
          layout: {
            radius: {
              small: '0.25rem',
              medium: '0.35rem',
              large: '0.5rem',
            },
          },
          colors: {
            primary: {
              DEFAULT: '#2563eb',
              foreground: '#ffffff',
            },
            secondary: {
              DEFAULT: '#EFF6FF',
              foreground: '#2563eb',
            },
            content1: {
              DEFAULT: '#ffffff',
              foreground: '#ffffff',
            },
            borderColor: '#F0F0F0',
            ['neutral-foreground']: '#64748b',
          },
        },
        dark: {
          layout: {},
          colors: {},
        },
      },
    }),
  ],
}
