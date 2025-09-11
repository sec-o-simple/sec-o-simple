import { beforeEach, describe, expect, it } from 'vitest'

describe('download', () => {
  // Import dynamically to ensure proper setup
  let download: (filename: string, text: string) => void

  beforeEach(async () => {
    const module = await import('../../src/utils/download')
    download = module.download
  })

  it('should execute without throwing errors', () => {
    expect(() => download('test.txt', 'content')).not.toThrow()
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
})
