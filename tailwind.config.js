import { heroui } from '@heroui/react'

export default {
  content: [
    'index.html',
    './src/**/*.{js,jsx,ts,tsx,html}',
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        secondary: '#64748b',
        'neutral-foreground': '#64748b',
      },
      borderColor: {
        gray: '#F3F4F6',
      },
    },
  },
  plugins: [
    heroui({
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
            content1: {
              DEFAULT: '#F8FAFC',
              foreground: '#F8FAFC',
            },
            ['neutral-foreground']: '#64748b',
          },
        },
      },
    }),
  ],
}
