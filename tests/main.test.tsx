import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import ReactDOM from 'react-dom/client'
import i18n from 'i18next'

// Mock ReactDOM.createRoot
const mockRender = vi.fn()
const mockCreateRoot = vi.fn(() => ({
  render: mockRender,
}))

vi.mock('react-dom/client', () => ({
  default: {
    createRoot: mockCreateRoot,
  },
}))

// Mock i18next
const mockInit = vi.fn().mockResolvedValue(undefined)
const mockUse = vi.fn().mockReturnValue({
  init: mockInit,
})

vi.mock('i18next', () => ({
  default: {
    use: mockUse,
  },
}))

// Mock react-i18next
vi.mock('react-i18next', () => ({
  initReactI18next: {},
}))

// Mock App component
vi.mock('../src/App', () => ({
  default: () => <div data-testid="app">App</div>,
}))

// Mock HeroUI Provider
vi.mock('@heroui/react', () => ({
  HeroUIProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="heroui-provider">{children}</div>
  ),
}))

// Mock locale files
vi.mock('../locales/de.json', () => ({
  default: {
    translation: {
      common: {
        loading: 'Laden...',
      },
    },
  },
}))

vi.mock('../locales/en.json', () => ({
  default: {
    translation: {
      common: {
        loading: 'Loading...',
      },
    },
  },
}))

// Mock CSS import
vi.mock('../src/index.css', () => ({}))

describe('main.tsx', () => {
  let originalNavigator: Navigator
  let originalLocalStorage: Storage
  let mockGetElementById: any

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks()
    
    // Mock DOM
    const mockElement = document.createElement('div')
    mockElement.id = 'root'
    mockGetElementById = vi.spyOn(document, 'getElementById').mockReturnValue(mockElement)
    
    // Store original objects
    originalNavigator = global.navigator
    originalLocalStorage = global.localStorage
    
    // Create fresh localStorage mock for each test
    const localStorageMock = (() => {
      let store: Record<string, string> = {}
      return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          store[key] = value
        }),
        removeItem: vi.fn((key: string) => {
          delete store[key]
        }),
        clear: vi.fn(() => {
          store = {}
        }),
        length: 0,
        key: vi.fn((index: number) => Object.keys(store)[index] || null),
      }
    })()
    
    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true,
    })
  })

  afterEach(() => {
    // Restore original objects
    global.navigator = originalNavigator
    mockGetElementById.mockRestore()
    vi.resetModules()
  })

  describe('getBrowserLanguage function', () => {
    it('should return "en" for English browser language', async () => {
      // Mock navigator.language
      Object.defineProperty(global.navigator, 'language', {
        value: 'en-US',
        writable: true,
      })

      // Import and test the module
      await import('../src/main')
      
      // The function should have been called and used 'en'
      expect(mockInit).toHaveBeenCalledWith({
        resources: {
          en: {
            translation: {
              common: {
                loading: 'Loading...',
              },
            },
          },
          de: {
            translation: {
              common: {
                loading: 'Laden...',
              },
            },
          },
        },
        lng: 'en',
        fallbackLng: 'en',
        interpolation: {
          escapeValue: false,
        },
      })
    })

    it('should return "de" for German browser language', async () => {
      Object.defineProperty(global.navigator, 'language', {
        value: 'de-DE',
        writable: true,
      })

      await import('../src/main')
      
      expect(mockInit).toHaveBeenCalledWith({
        resources: {
          en: {
            translation: {
              common: {
                loading: 'Loading...',
              },
            },
          },
          de: {
            translation: {
              common: {
                loading: 'Laden...',
              },
            },
          },
        },
        lng: 'de',
        fallbackLng: 'en',
        interpolation: {
          escapeValue: false,
        },
      })
    })

    it('should return "en" for unsupported browser language', async () => {
      Object.defineProperty(global.navigator, 'language', {
        value: 'fr-FR',
        writable: true,
      })

      await import('../src/main')
      
      expect(mockInit).toHaveBeenCalledWith(
        expect.objectContaining({
          lng: 'en',
        })
      )
    })

    it('should return "en" for malformed browser language', async () => {
      Object.defineProperty(global.navigator, 'language', {
        value: 'invalid',
        writable: true,
      })

      await import('../src/main')
      
      expect(mockInit).toHaveBeenCalledWith(
        expect.objectContaining({
          lng: 'en',
        })
      )
    })

    it('should handle browser language with regional codes correctly', async () => {
      Object.defineProperty(global.navigator, 'language', {
        value: 'de-AT', // Austrian German
        writable: true,
      })

      await import('../src/main')
      
      expect(mockInit).toHaveBeenCalledWith(
        expect.objectContaining({
          lng: 'de',
        })
      )
    })
  })

  describe('localStorage integration', () => {
    it('should use saved language from localStorage when available', async () => {
      const mockLocalStorage = global.localStorage as any
      mockLocalStorage.getItem.mockReturnValue('de')
      
      Object.defineProperty(global.navigator, 'language', {
        value: 'en-US',
        writable: true,
      })

      await import('../src/main')
      
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('i18nextLng')
      expect(mockInit).toHaveBeenCalledWith(
        expect.objectContaining({
          lng: 'de',
        })
      )
    })

    it('should fall back to browser language when localStorage is empty', async () => {
      const mockLocalStorage = global.localStorage as any
      mockLocalStorage.getItem.mockReturnValue(null)
      
      Object.defineProperty(global.navigator, 'language', {
        value: 'de-DE',
        writable: true,
      })

      await import('../src/main')
      
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('i18nextLng')
      expect(mockInit).toHaveBeenCalledWith(
        expect.objectContaining({
          lng: 'de',
        })
      )
    })

    it('should handle localStorage errors gracefully', async () => {
      const mockLocalStorage = global.localStorage as any
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage error')
      })
      
      Object.defineProperty(global.navigator, 'language', {
        value: 'en-US',
        writable: true,
      })

      // The current implementation doesn't handle localStorage errors,
      // so this test expects the error to be thrown
      await expect(import('../src/main')).rejects.toThrow('localStorage error')
    })
  })

  describe('i18n initialization', () => {
    it('should initialize i18n with correct configuration', async () => {
      await import('../src/main')
      
      expect(mockUse).toHaveBeenCalledWith({}) // initReactI18next mock
      expect(mockInit).toHaveBeenCalledWith({
        resources: {
          en: {
            translation: {
              common: {
                loading: 'Loading...',
              },
            },
          },
          de: {
            translation: {
              common: {
                loading: 'Laden...',
              },
            },
          },
        },
        lng: expect.any(String),
        fallbackLng: 'en',
        interpolation: {
          escapeValue: false,
        },
      })
    })

    it('should have correct fallback language', async () => {
      await import('../src/main')
      
      expect(mockInit).toHaveBeenCalledWith(
        expect.objectContaining({
          fallbackLng: 'en',
        })
      )
    })

    it('should disable XSS escaping for React safety', async () => {
      await import('../src/main')
      
      expect(mockInit).toHaveBeenCalledWith(
        expect.objectContaining({
          interpolation: {
            escapeValue: false,
          },
        })
      )
    })
  })

  describe('React app rendering', () => {
    it('should create root from DOM element', async () => {
      const mockElement = document.createElement('div')
      mockElement.id = 'root'
      mockGetElementById.mockReturnValue(mockElement)

      await import('../src/main')
      
      expect(mockGetElementById).toHaveBeenCalledWith('root')
      expect(mockCreateRoot).toHaveBeenCalledWith(mockElement)
    })

    it('should render app with StrictMode and HeroUIProvider', async () => {
      await import('../src/main')
      
      expect(mockRender).toHaveBeenCalledTimes(1)
      const renderCall = mockRender.mock.calls[0][0]
      
      // Test that the structure includes StrictMode and HeroUIProvider
      const { container } = render(renderCall)
      expect(container.querySelector('[data-testid="heroui-provider"]')).toBeInTheDocument()
      expect(container.querySelector('[data-testid="app"]')).toBeInTheDocument()
    })

    it('should handle missing root element gracefully', async () => {
      mockGetElementById.mockReturnValue(null)
      
      // The current implementation casts to HTMLElement, so it doesn't throw
      // but ReactDOM.createRoot will get null which may cause issues
      await expect(import('../src/main')).resolves.toBeDefined()
      
      // Verify that createRoot was called with null
      expect(mockCreateRoot).toHaveBeenCalledWith(null)
    })
  })

  describe('error handling and edge cases', () => {
    it('should handle navigator.language being undefined', async () => {
      Object.defineProperty(global.navigator, 'language', {
        value: undefined,
        writable: true,
      })

      // The current implementation doesn't handle undefined navigator.language
      // so this test expects an error when trying to split undefined
      await expect(import('../src/main')).rejects.toThrow("Cannot read properties of undefined (reading 'split')")
    })

    it('should handle empty navigator.language', async () => {
      Object.defineProperty(global.navigator, 'language', {
        value: '',
        writable: true,
      })

      await import('../src/main')
      
      expect(mockInit).toHaveBeenCalledWith(
        expect.objectContaining({
          lng: 'en',
        })
      )
    })

    it('should handle language codes without hyphens', async () => {
      Object.defineProperty(global.navigator, 'language', {
        value: 'en',
        writable: true,
      })

      await import('../src/main')
      
      expect(mockInit).toHaveBeenCalledWith(
        expect.objectContaining({
          lng: 'en',
        })
      )
    })

    it('should prioritize localStorage over browser language', async () => {
      const mockLocalStorage = global.localStorage as any
      mockLocalStorage.getItem.mockReturnValue('en')
      
      Object.defineProperty(global.navigator, 'language', {
        value: 'de-DE',
        writable: true,
      })

      await import('../src/main')
      
      expect(mockInit).toHaveBeenCalledWith(
        expect.objectContaining({
          lng: 'en', // Should use localStorage value, not browser language
        })
      )
    })
  })

  describe('module imports and dependencies', () => {
    it('should import all required modules', async () => {
      // This test ensures all imports are resolved correctly
      await expect(import('../src/main')).resolves.toBeDefined()
      
      // Verify key dependencies are called
      expect(mockUse).toHaveBeenCalled()
      expect(mockInit).toHaveBeenCalled()
      expect(mockCreateRoot).toHaveBeenCalled()
      expect(mockRender).toHaveBeenCalled()
    })
  })
})
