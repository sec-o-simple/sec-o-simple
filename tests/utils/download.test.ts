import { describe, expect, it, vi, beforeEach } from 'vitest'

describe('download', () => {
  let download: (filename: string, text: string) => void
  let mockElement: any
  let mockDocument: any

  beforeEach(async () => {
    // Mock DOM element with all required methods
    mockElement = {
      setAttribute: vi.fn(),
      click: vi.fn(),
      style: {},
    }

    mockDocument = {
      createElement: vi.fn(() => mockElement),
      body: {
        appendChild: vi.fn(),
        removeChild: vi.fn(),
      },
    }

    global.document = mockDocument as any

    const { download: downloadFn } = await import('../../src/utils/download')
    download = downloadFn
  })

  it('should create anchor element with correct attributes', () => {
    download('test.txt', 'Hello World')

    expect(mockDocument.createElement).toHaveBeenCalledWith('a')
    expect(mockElement.setAttribute).toHaveBeenCalledWith(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent('Hello World'),
    )
    expect(mockElement.setAttribute).toHaveBeenCalledWith(
      'download',
      'test.txt',
    )
  })

  it('should set element display style to none', () => {
    download('test.txt', 'content')

    expect(mockElement.style.display).toBe('none')
  })

  it('should append element to document body', () => {
    download('test.txt', 'content')

    expect(mockDocument.body.appendChild).toHaveBeenCalledWith(mockElement)
  })

  it('should click the element to trigger download', () => {
    download('test.txt', 'content')

    expect(mockElement.click).toHaveBeenCalled()
  })

  it('should remove element from document body after clicking', () => {
    download('test.txt', 'content')

    expect(mockDocument.body.removeChild).toHaveBeenCalledWith(mockElement)
  })

  it('should handle empty filename', () => {
    download('', 'content')

    expect(mockElement.setAttribute).toHaveBeenCalledWith('download', '')
    expect(() => download('', 'content')).not.toThrow()
  })

  it('should handle empty content', () => {
    download('test.txt', '')

    expect(mockElement.setAttribute).toHaveBeenCalledWith(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(''),
    )
    expect(() => download('test.txt', '')).not.toThrow()
  })

  it('should handle special characters in filename', () => {
    const filename = 'test file (1).txt'
    download(filename, 'content')

    expect(mockElement.setAttribute).toHaveBeenCalledWith('download', filename)
    expect(() => download(filename, 'content')).not.toThrow()
  })

  it('should handle special characters in content', () => {
    const content = 'Special chars: & < > " \' \n \t 🚀 émoji'
    download('test.txt', content)

    expect(mockElement.setAttribute).toHaveBeenCalledWith(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(content),
    )
    expect(() => download('test.txt', content)).not.toThrow()
  })

  it('should handle JSON content', () => {
    const jsonContent = JSON.stringify({ key: 'value', number: 123 })
    download('data.json', jsonContent)

    expect(mockElement.setAttribute).toHaveBeenCalledWith(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(jsonContent),
    )
    expect(() => download('data.json', jsonContent)).not.toThrow()
  })

  it('should handle large content efficiently', () => {
    const largeContent = 'x'.repeat(10000)
    download('large.txt', largeContent)

    expect(mockElement.setAttribute).toHaveBeenCalledWith(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(largeContent),
    )
    expect(() => download('large.txt', largeContent)).not.toThrow()
  })

  it('should properly encode URI components', () => {
    const content = 'Hello%20World&test=123'
    download('encoded.txt', content)

    expect(mockElement.setAttribute).toHaveBeenCalledWith(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(content),
    )
  })

  it('should handle Unicode characters in content', () => {
    const content = '🌍 Hello 世界 नमस्ते мир'
    download('unicode.txt', content)

    expect(mockElement.setAttribute).toHaveBeenCalledWith(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(content),
    )
  })

  it('should complete full download workflow', () => {
    download('workflow.txt', 'test workflow')

    // Verify all steps were executed in order
    expect(mockDocument.createElement).toHaveBeenCalledWith('a')
    expect(mockElement.setAttribute).toHaveBeenCalledTimes(2)
    expect(mockElement.style.display).toBe('none')
    expect(mockDocument.body.appendChild).toHaveBeenCalledWith(mockElement)
    expect(mockElement.click).toHaveBeenCalled()
    expect(mockDocument.body.removeChild).toHaveBeenCalledWith(mockElement)
  })
})
