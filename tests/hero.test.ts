import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock the heroui import to avoid dependency issues
vi.mock('@heroui/react', () => ({
  heroui: vi.fn((config) => config),
}))

describe('hero configuration', () => {
  let heroConfig: any

  beforeEach(async () => {
    // Import the actual hero configuration
    const module = await import('../hero')
    heroConfig = module.default
  })

  it('should export a valid heroui configuration', () => {
    expect(heroConfig).toBeDefined()
    expect(typeof heroConfig).toBe('object')
  })

  it('should have correct top-level configuration properties', () => {
    expect(heroConfig).toHaveProperty('addCommonColors', true)
    expect(heroConfig).toHaveProperty('defaultTheme', 'light')
    expect(heroConfig).toHaveProperty('defaultExtendTheme', 'light')
    expect(heroConfig).toHaveProperty('themes')
    expect(typeof heroConfig.themes).toBe('object')
  })

  it('should have both light and dark themes defined', () => {
    expect(heroConfig.themes).toHaveProperty('light')
    expect(heroConfig.themes).toHaveProperty('dark')
    expect(typeof heroConfig.themes.light).toBe('object')
    expect(typeof heroConfig.themes.dark).toBe('object')
  })

  it('should have complete light theme structure', () => {
    const lightTheme = heroConfig.themes.light

    expect(lightTheme).toHaveProperty('layout')
    expect(lightTheme).toHaveProperty('colors')
    expect(lightTheme.layout).toHaveProperty('radius')
    expect(typeof lightTheme.layout.radius).toBe('object')
    expect(typeof lightTheme.colors).toBe('object')
  })

  it('should have all required radius values with correct units', () => {
    const radius = heroConfig.themes.light.layout.radius

    expect(radius).toHaveProperty('small', '0.25rem')
    expect(radius).toHaveProperty('medium', '0.35rem')
    expect(radius).toHaveProperty('large', '0.5rem')

    // Validate format
    expect(radius.small).toMatch(/^[\d.]+rem$/)
    expect(radius.medium).toMatch(/^[\d.]+rem$/)
    expect(radius.large).toMatch(/^[\d.]+rem$/)

    // Test progressive sizing
    const small = parseFloat(radius.small)
    const medium = parseFloat(radius.medium)
    const large = parseFloat(radius.large)

    expect(small).toBeLessThan(medium)
    expect(medium).toBeLessThan(large)
  })

  it('should have complete color palette defined', () => {
    const colors = heroConfig.themes.light.colors

    expect(colors).toHaveProperty('primary')
    expect(colors).toHaveProperty('secondary')
    expect(colors).toHaveProperty('content1')
    expect(colors).toHaveProperty('borderColor')
    expect(colors).toHaveProperty('neutral-foreground')
  })

  it('should have valid primary color configuration', () => {
    const primary = heroConfig.themes.light.colors.primary

    expect(primary).toHaveProperty('DEFAULT', '#2563eb')
    expect(primary).toHaveProperty('foreground', '#ffffff')

    // Validate hex color format
    expect(primary.DEFAULT).toMatch(/^#[0-9a-fA-F]{6}$/)
    expect(primary.foreground).toMatch(/^#[0-9a-fA-F]{6}$/)
  })

  it('should have valid secondary color configuration', () => {
    const secondary = heroConfig.themes.light.colors.secondary

    expect(secondary).toHaveProperty('DEFAULT', '#EFF6FF')
    expect(secondary).toHaveProperty('foreground', '#2563eb')

    // Validate hex color format
    expect(secondary.DEFAULT).toMatch(/^#[0-9a-fA-F]{6}$/)
    expect(secondary.foreground).toMatch(/^#[0-9a-fA-F]{6}$/)
  })

  it('should have valid content1 color configuration', () => {
    const content1 = heroConfig.themes.light.colors.content1

    expect(content1).toHaveProperty('DEFAULT', '#ffffff')
    expect(content1).toHaveProperty('foreground', '#ffffff')

    // Validate hex color format
    expect(content1.DEFAULT).toMatch(/^#[0-9a-fA-F]{6}$/)
    expect(content1.foreground).toMatch(/^#[0-9a-fA-F]{6}$/)
  })

  it('should have valid border and neutral colors', () => {
    const colors = heroConfig.themes.light.colors

    expect(colors.borderColor).toBe('#F0F0F0')
    expect(colors['neutral-foreground']).toBe('#64748b')

    // Validate hex color format
    expect(colors.borderColor).toMatch(/^#[0-9a-fA-F]{6}$/)
    expect(colors['neutral-foreground']).toMatch(/^#[0-9a-fA-F]{6}$/)
  })

  it('should have consistent color relationships', () => {
    const colors = heroConfig.themes.light.colors

    // Primary blue should be used in multiple places
    expect(colors.primary.DEFAULT).toBe('#2563eb')
    expect(colors.secondary.foreground).toBe('#2563eb')

    // White should be consistently used
    expect(colors.primary.foreground).toBe('#ffffff')
    expect(colors.content1.DEFAULT).toBe('#ffffff')
    expect(colors.content1.foreground).toBe('#ffffff')
  })

  it('should have proper dark theme structure', () => {
    const darkTheme = heroConfig.themes.dark

    expect(darkTheme).toHaveProperty('layout')
    expect(darkTheme).toHaveProperty('colors')
    expect(typeof darkTheme.layout).toBe('object')
    expect(typeof darkTheme.colors).toBe('object')
  })

  it('should have meaningful color contrast for accessibility', () => {
    const colors = heroConfig.themes.light.colors

    // Primary: dark blue background with white text
    expect(colors.primary.DEFAULT).toBe('#2563eb') // Dark blue
    expect(colors.primary.foreground).toBe('#ffffff') // White

    // Secondary: light blue background with dark blue text
    expect(colors.secondary.DEFAULT).toBe('#EFF6FF') // Light blue
    expect(colors.secondary.foreground).toBe('#2563eb') // Dark blue

    // Ensure contrasting combinations
    expect(colors.primary.DEFAULT).not.toBe(colors.primary.foreground)
    expect(colors.secondary.DEFAULT).not.toBe(colors.secondary.foreground)
  })

  it('should handle special character in property name', () => {
    const colors = heroConfig.themes.light.colors

    // Test the bracket notation property
    expect(colors).toHaveProperty('neutral-foreground')
    expect(colors['neutral-foreground']).toBe('#64748b')
  })

  it('should maintain color value consistency across theme', () => {
    const colors = heroConfig.themes.light.colors

    // All colors should be 6-character hex codes
    const colorValues = [
      colors.primary.DEFAULT,
      colors.primary.foreground,
      colors.secondary.DEFAULT,
      colors.secondary.foreground,
      colors.content1.DEFAULT,
      colors.content1.foreground,
      colors.borderColor,
      colors['neutral-foreground'],
    ]

    colorValues.forEach((color) => {
      expect(color).toMatch(/^#[0-9a-fA-F]{6}$/)
    })
  })

  it('should have proper boolean configuration values', () => {
    expect(heroConfig.addCommonColors).toBe(true)
    expect(typeof heroConfig.addCommonColors).toBe('boolean')
  })

  it('should have valid theme name strings', () => {
    expect(heroConfig.defaultTheme).toBe('light')
    expect(heroConfig.defaultExtendTheme).toBe('light')
    expect(typeof heroConfig.defaultTheme).toBe('string')
    expect(typeof heroConfig.defaultExtendTheme).toBe('string')

    // Ensure default themes exist in themes object
    expect(heroConfig.themes).toHaveProperty(heroConfig.defaultTheme)
    expect(heroConfig.themes).toHaveProperty(heroConfig.defaultExtendTheme)
  })

  it('should export configuration that matches expected structure', () => {
    // Instead of checking the mock call, verify the structure matches what heroui expects
    expect(heroConfig).toEqual({
      addCommonColors: true,
      defaultTheme: 'light',
      defaultExtendTheme: 'light',
      themes: {
        light: {
          layout: {
            radius: { small: '0.25rem', medium: '0.35rem', large: '0.5rem' },
          },
          colors: {
            primary: { DEFAULT: '#2563eb', foreground: '#ffffff' },
            secondary: { DEFAULT: '#EFF6FF', foreground: '#2563eb' },
            content1: { DEFAULT: '#ffffff', foreground: '#ffffff' },
            borderColor: '#F0F0F0',
            'neutral-foreground': '#64748b',
          },
        },
        dark: { layout: {}, colors: {} },
      },
    })
  })
})
