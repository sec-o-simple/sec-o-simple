import { heroui } from '@heroui/react'

export default {
  content: [
    'index.html',
    './src/**/*.{js,jsx,ts,tsx,html}',
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
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
            primary: '#2563eb',
            ['primary-foreground']: '#ffffff',
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
