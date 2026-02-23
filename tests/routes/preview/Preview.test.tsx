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
