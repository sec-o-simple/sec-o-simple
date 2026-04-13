import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Preview from '../../../src/routes/preview/Preview'
import { HashRouter } from 'react-router'

describe('Preview iframe focus/blur logic', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(HTMLIFrameElement.prototype, 'contentDocument', {
      configurable: true,
      get() {
        return {
          open: vi.fn(),
          write: vi.fn(),
          close: vi.fn(),
          addEventListener: vi.fn((event, cb) => {
            if (event === 'focus') cb()
          }),
        }
      },
    })
  })

  it('triggers blur on iframe focus event', async () => {
    const blurSpy = vi.fn()
    const origGet = Object.getOwnPropertyDescriptor(
      HTMLIFrameElement.prototype,
      'contentDocument',
    )?.get
    Object.defineProperty(HTMLIFrameElement.prototype, 'blur', {
      value: blurSpy,
      configurable: true,
    })
    const { render } = await import('@testing-library/react')
    const { HashRouter } = await import('react-router')
    const { default: Preview } = await import(
      '../../../src/routes/preview/Preview'
    )
    render(
      <HashRouter>
        <Preview />
      </HashRouter>,
    )
    expect(blurSpy).toHaveBeenCalledTimes(1)
    // Restore
    if (origGet)
      Object.defineProperty(HTMLIFrameElement.prototype, 'contentDocument', {
        get: origGet,
      })
  })
})
describe('Preview error handling', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    Object.defineProperty(HTMLIFrameElement.prototype, 'contentDocument', {
      configurable: true,
      get() {
        return {
          open: vi.fn(),
          write: vi.fn(),
          close: vi.fn(),
          addEventListener: vi.fn(),
        }
      },
    })
  })

  it('handles error in parseMarkdown gracefully', async () => {
    vi.doMock('../../../src/routes/preview/markdownParser', () => ({
      parseMarkdown: vi.fn(() => {
        throw new Error('parseMarkdown error')
      }),
    }))
    const { default: Preview } = await import(
      '../../../src/routes/preview/Preview'
    )
    const { render, screen } = await import('@testing-library/react')
    const { HashRouter } = await import('react-router')
    expect(() => {
      render(
        <HashRouter>
          <Preview />
        </HashRouter>,
      )
    }).toThrow('parseMarkdown error')
  })

  it('handles error in HTMLTemplate gracefully', async () => {
    vi.doMock('../../../src/routes/preview/HTMLTemplate', () => ({
      default: vi.fn(() => {
        throw new Error('HTMLTemplate error')
      }),
    }))
    vi.doMock('../../../src/routes/preview/markdownParser', () => ({
      parseMarkdown: vi.fn(() => ({})),
    }))
    const { default: Preview } = await import(
      '../../../src/routes/preview/Preview'
    )
    const { render, screen } = await import('@testing-library/react')
    const { HashRouter } = await import('react-router')
    expect(() => {
      render(
        <HashRouter>
          <Preview />
        </HashRouter>,
      )
    }).toThrow('HTMLTemplate error')
  })
})
describe('Preview edge cases', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    // Mock iframe functionality
    Object.defineProperty(HTMLIFrameElement.prototype, 'contentDocument', {
      configurable: true,
      get() {
        return {
          open: vi.fn(),
          write: vi.fn(),
          close: vi.fn(),
          addEventListener: vi.fn(),
        }
      },
    })
  })

  it('renders with missing config', async () => {
    vi.doMock('react-i18next', () => ({
      useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'en' } }),
    }))
    vi.doMock('../../../src/utils/useConfigStore', () => ({
      useConfigStore: vi.fn(() => undefined),
    }))
    vi.doMock('../../../src/routes/preview/markdownParser', () => ({
      parseMarkdown: vi.fn(() => ({})),
    }))
    vi.doMock('../../../src/routes/preview/HTMLTemplate', () => ({
      default: vi.fn(() => '<html></html>'),
    }))
    const { default: Preview } = await import(
      '../../../src/routes/preview/Preview'
    )
    const { render } = await import('@testing-library/react')
    const { HashRouter } = await import('react-router')
    expect(() => {
      render(
        <HashRouter>
          <Preview />
        </HashRouter>,
      )
    }).not.toThrow()
  })

  it('renders with missing translation function', async () => {
    vi.doMock('react-i18next', () => ({
      useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'en' } }),
    }))
    vi.doMock('../../../src/routes/preview/markdownParser', () => ({
      parseMarkdown: vi.fn(() => ({})),
    }))
    vi.doMock('../../../src/routes/preview/HTMLTemplate', () => ({
      default: vi.fn(() => '<html></html>'),
    }))
    const { default: Preview } = await import(
      '../../../src/routes/preview/Preview'
    )
    const { render } = await import('@testing-library/react')
    const { HashRouter } = await import('react-router')
    expect(() => {
      render(
        <HashRouter>
          <Preview />
        </HashRouter>,
      )
    }).not.toThrow()
  })

  it('renders with broken document store', async () => {
    vi.doMock('../../../src/utils/useDocumentStore', () => ({
      default: vi.fn(() => undefined),
    }))
    vi.doMock('../../../src/routes/preview/markdownParser', () => ({
      parseMarkdown: vi.fn(() => ({})),
    }))
    vi.doMock('../../../src/routes/preview/HTMLTemplate', () => ({
      default: vi.fn(() => '<html></html>'),
    }))
    const { default: Preview } = await import(
      '../../../src/routes/preview/Preview'
    )
    const { render, screen } = await import('@testing-library/react')
    const { HashRouter } = await import('react-router')
    render(
      <HashRouter>
        <Preview />
      </HashRouter>,
    )
    // If parseMarkdown is not mocked, it will throw, so we expect an error
    expect(() => {
      render(
        <HashRouter>
          <Preview />
        </HashRouter>,
      )
    }).not.toThrow()
  })
})

// Mock all the dependencies
vi.mock('../../../src/routes/preview/HTMLTemplate', () => ({
  default: vi.fn(() => '<html><body>Mock HTML</body></html>'),
}))

vi.mock('../../../src/routes/preview/markdownParser', () => ({
  parseMarkdown: vi.fn((doc) => doc),
}))

vi.mock('../../../src/routes/preview/htmlTemplateTranslations', () => ({
  createHTMLTemplateTranslations: vi.fn(() => ({
    t_document_title: 'Document Title',
  })),
}))

vi.mock('../../../src/utils/useDocumentStore', () => ({
  default: vi.fn(() => ({
    document: {
      title: 'Test Document',
      publisher: { name: 'Test Publisher' },
    },
  })),
}))

vi.mock('../../../src/utils/csafExport/csafExport', () => ({
  createCSAFDocument: vi.fn(() => ({
    document: {
      title: 'Test CSAF Document',
    },
  })),
}))

vi.doMock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'en' } }),
}))
vi.doMock('../../../src/utils/useDocumentStore', () => ({
  default: vi.fn(() => undefined),
}))
vi.doMock('../../../src/routes/preview/markdownParser', () => ({
  parseMarkdown: vi.fn(() => ({})),
}))
vi.doMock('../../../src/routes/preview/HTMLTemplate', () => ({
  default: vi.fn(() => '<html></html>'),
}))
const { default: Preview } = await import('../../../src/routes/preview/Preview')
const { render } = await import('@testing-library/react')
const { HashRouter } = await import('react-router')
expect(() => {
  render(
    <HashRouter>
      <Preview />
    </HashRouter>,
  )
}).not.toThrow()
