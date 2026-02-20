import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('download', () => {
  // Import dynamically to ensure proper setup
  let download: (filename: string, text: string) => void

  beforeEach(async () => {
    // Mock DOM methods
    const createElementSpy = vi.spyOn(document, 'createElement')
    const appendChildSpy = vi.spyOn(document.body, 'appendChild')
    const removeChildSpy = vi.spyOn(document.body, 'removeChild')

    // Create mock element with necessary methods
    const mockElement = {
      setAttribute: vi.fn(),
      click: vi.fn(),
      style: { display: '' },
    }

    createElementSpy.mockReturnValue(mockElement as any)
    appendChildSpy.mockImplementation(() => mockElement as any)
    removeChildSpy.mockImplementation(() => mockElement as any)

    const module = await import('../../src/utils/download')
    download = module.download
  })

  it('should create anchor element and trigger download', () => {
    const createElementSpy = vi.spyOn(document, 'createElement')
    const appendChildSpy = vi.spyOn(document.body, 'appendChild')
    const removeChildSpy = vi.spyOn(document.body, 'removeChild')

    const mockElement = {
      setAttribute: vi.fn(),
      click: vi.fn(),
      style: { display: '' },
    }

    createElementSpy.mockReturnValue(mockElement as any)

    download('test.txt', 'content')

    expect(createElementSpy).toHaveBeenCalledWith('a')
    expect(mockElement.setAttribute).toHaveBeenCalledWith(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent('content')
    )
    expect(mockElement.setAttribute).toHaveBeenCalledWith('download', 'test.txt')
    expect(mockElement.style.display).toBe('none')
    expect(appendChildSpy).toHaveBeenCalledWith(mockElement)
    expect(mockElement.click).toHaveBeenCalled()
    expect(removeChildSpy).toHaveBeenCalledWith(mockElement)
  })

  it('should handle various filename formats', () => {
    const filenames = [
      'simple.txt',
      'file-with-dashes.json',
      'file_with_underscores.csv',
      'file.with.dots.xml',
      'file with spaces.txt',
    ]

    filenames.forEach((filename) => {
      expect(() => download(filename, 'test content')).not.toThrow()
    })
  })

  it('should handle special characters in content', () => {
    const specialContent =
      'Content with special chars: !@#$%^&*()_+{}[]|\\:";\'<>?,./'
    expect(() => download('special.txt', specialContent)).not.toThrow()
  })

  it('should handle empty filename and content', () => {
    expect(() => download('', '')).not.toThrow()
  })

  it('should handle JSON content', () => {
    const jsonContent = JSON.stringify({ test: 'data', number: 42 })
    expect(() => download('data.json', jsonContent)).not.toThrow()
  })

  it('should handle large content', () => {
    const largeContent = 'x'.repeat(10000)
    expect(() => download('large.txt', largeContent)).not.toThrow()
  })

  it('should handle unicode content', () => {
    const unicodeContent = 'Hello 🌍 Unicode ñáéíóú'
    expect(() => download('unicode.txt', unicodeContent)).not.toThrow()
  })

  it('should properly encode content with special characters', () => {
    const mockElement = {
      setAttribute: vi.fn(),
      click: vi.fn(),
      style: { display: '' },
    }

    const createElementSpy = vi.spyOn(document, 'createElement')
    createElementSpy.mockReturnValue(mockElement as any)

    const content = 'Special: & < > " \' \n \t'
    download('test.txt', content)

    expect(mockElement.setAttribute).toHaveBeenCalledWith(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(content)
    )
  })
})
