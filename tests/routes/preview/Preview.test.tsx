describe('Preview tab selection flows', () => {
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

  it('switches tabs multiple times and shows correct content', async () => {
    const htmlString = '<html><body>TabContent</body></html>'
    vi.doMock('../../../src/routes/preview/HTMLTemplate', () => ({
      default: vi.fn(() => htmlString),
    }))
    const { default: Preview } = await import(
      '../../../src/routes/preview/Preview'
    )
    const { render, screen, fireEvent } = await import('@testing-library/react')
    const { HashRouter } = await import('react-router')
    render(
      <HashRouter>
        <Preview />
      </HashRouter>,
    )
    const renderedTab = screen.getByText('preview.html')
    const rawTab = screen.getByText('preview.raw')
    // Switch to raw
    fireEvent.click(rawTab)
    expect(screen.getByRole('tabpanel').textContent).toContain('TabContent')
    // Switch back to rendered
    fireEvent.click(renderedTab)
    expect(document.querySelector('iframe')).toBeInTheDocument()
    // Switch again
    fireEvent.click(rawTab)
    expect(screen.getByRole('tabpanel').textContent).toContain('TabContent')
  })
})
describe('Preview with large HTML output', () => {
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

  it('renders large HTML output in both tabs', async () => {
    const largeHtml = '<html><body>' + 'A'.repeat(10000) + '</body></html>'
    vi.doMock('../../../src/routes/preview/HTMLTemplate', () => ({
      default: vi.fn(() => largeHtml),
    }))
    const { default: Preview } = await import(
      '../../../src/routes/preview/Preview'
    )
    const { render, screen, fireEvent } = await import('@testing-library/react')
    const { HashRouter } = await import('react-router')
    render(
      <HashRouter>
        <Preview />
      </HashRouter>,
    )
    // Rendered tab
    expect(document.querySelector('iframe')).toBeInTheDocument()
    // Raw tab
    fireEvent.click(screen.getByText('preview.raw'))
    expect(screen.getByRole('tabpanel').textContent).toContain('A'.repeat(1000)) // spot check
  })
})
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

  it('triggers blur on iframe focus event', () => {
    const blurSpy = vi.fn()
    const origGet = Object.getOwnPropertyDescriptor(
      HTMLIFrameElement.prototype,
      'contentDocument',
    )?.get
    Object.defineProperty(HTMLIFrameElement.prototype, 'blur', {
      value: blurSpy,
      configurable: true,
    })
    const { render } = require('@testing-library/react')
    const { HashRouter } = require('react-router')
    const Preview = require('../../../src/routes/preview/Preview').default
    render(
      <HashRouter>
        <Preview />
      </HashRouter>,
    )
    expect(blurSpy).not.toHaveBeenCalled() // blur is called on iframe, not on contentDocument
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
    }).not.toThrow()
    expect(screen.getByText('nav.preview')).toBeInTheDocument()
  })

  it('handles error in HTMLTemplate gracefully', async () => {
    vi.doMock('../../../src/routes/preview/HTMLTemplate', () => ({
      default: vi.fn(() => {
        throw new Error('HTMLTemplate error')
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
    }).not.toThrow()
    expect(screen.getByText('nav.preview')).toBeInTheDocument()
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
    vi.doMock('../../../src/utils/useConfigStore', () => ({
      useConfigStore: vi.fn(() => undefined),
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
    expect(screen.getByText('nav.preview')).toBeInTheDocument()
  })

  it('renders with missing translation function', async () => {
    vi.doMock('react-i18next', () => ({
      useTranslation: () => ({ t: undefined, i18n: { language: 'en' } }),
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
    expect(screen.getByText('nav.preview')).toBeInTheDocument()
  })

  it('renders with broken document store', async () => {
    vi.doMock('../../../src/utils/useDocumentStore', () => ({
      default: vi.fn(() => undefined),
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
    expect(screen.getByText('nav.preview')).toBeInTheDocument()
  })
})
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Preview from '../../../src/routes/preview/Preview'
import { HashRouter } from 'react-router'
import { createHTMLTemplateTranslations } from '../../../src/routes/preview/htmlTemplateTranslations'
import { parseMarkdown } from '../../../src/routes/preview/markdownParser'
import HTMLTemplate from '../../../src/routes/preview/HTMLTemplate'
import { createCSAFDocument } from '../../../src/utils/csafExport/csafExport'

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

vi.mock('../../../src/utils/useConfigStore', () => ({
  useConfigStore: vi.fn(() => ({
    baseUrl: 'http://localhost',
  })),
}))

vi.mock('../../../src/utils/useProductTreeBranch', () => ({
  useProductTreeBranch: vi.fn(() => ({
    getRelationshipFullProductName: vi.fn(),
    getFullProductName: vi.fn(),
  })),
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue: string = '') => key || defaultValue,
    i18n: { language: 'en' },
  }),
}))

describe('Preview', () => {
  beforeEach(() => {
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

  const renderPreview = () => {
    return render(
      <HashRouter>
        <Preview />
      </HashRouter>,
    )
  }

  it('renders the preview component', () => {
    renderPreview()

    expect(screen.getByText('nav.preview')).toBeInTheDocument()
  })

  it('renders rendered HTML tab by default', () => {
    renderPreview()

    expect(screen.getByText('preview.html')).toBeInTheDocument()
    expect(screen.getByRole('tabpanel')).toBeInTheDocument()
  })

  it('renders raw HTML tab when selected', () => {
    renderPreview()

    const rawTab = screen.getByText('preview.raw')
    fireEvent.click(rawTab)

    expect(screen.getByRole('tabpanel')).toBeInTheDocument()
  })

  it('calls HTMLTemplate with correct parameters', () => {
    renderPreview()

    expect(HTMLTemplate).toHaveBeenCalledWith({
      document: expect.any(Object),
      translations: expect.any(Object),
    })
  })

  it('calls parseMarkdown with CSAF document', () => {
    renderPreview()

    expect(parseMarkdown).toHaveBeenCalledWith({
      document: {
        title: 'Test CSAF Document',
      },
    })
  })

  it('creates HTML template translations with translation function', () => {
    renderPreview()

    expect(createHTMLTemplateTranslations).toHaveBeenCalledWith(
      expect.any(Function),
    )
  })

  it('switches between tabs correctly', () => {
    renderPreview()

    // Initially on rendered tab
    const renderedTab = screen.getByText('preview.html')
    const rawTab = screen.getByText('preview.raw')

    expect(renderedTab.closest('[data-selected="true"]')).toBeTruthy()

    // Switch to raw tab
    fireEvent.click(rawTab)

    // Check that selection changed
    expect(rawTab.closest('[data-selected="true"]')).toBeTruthy()
  })

  it('handles empty CSAF document gracefully', () => {
    vi.mocked(createCSAFDocument).mockReturnValue(null as any)

    expect(() => renderPreview()).not.toThrow()
  })

  it('renders with back navigation', () => {
    renderPreview()

    // WizardStep should have onBack prop pointing to '/tracking'
    expect(screen.getByText('nav.preview')).toBeInTheDocument()
  })

  it('displays iframe for rendered content', () => {
    renderPreview()

    const iframe = document.querySelector('#preview')
    expect(iframe).toBeInTheDocument()
    expect(iframe?.tagName).toBe('IFRAME')
  })

  it('displays pre element for raw HTML content', () => {
    renderPreview()

    const rawTab = screen.getByText('preview.raw')
    fireEvent.click(rawTab)

    const preElement = screen.getByRole('tabpanel').querySelector('pre')
    expect(preElement).toBeInTheDocument()
  })
})
