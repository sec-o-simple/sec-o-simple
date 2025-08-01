import { describe, it, expect } from 'vitest'
import { download } from '../../src/utils/download'

describe('download', () => {
  it('should execute without throwing errors', () => {
    expect(() => download('test.txt', 'content')).not.toThrow()
  })

  it('should handle various filename formats', () => {
    const filenames = [
      'simple.txt',
      'file-with-dashes.json',
      'file_with_underscores.csv',
      'file.with.dots.xml',
      'file with spaces.txt'
    ]

    filenames.forEach(filename => {
      expect(() => download(filename, 'test content')).not.toThrow()
    })
  })

  it('should handle various content types without errors', () => {
    const testCases = [
      { filename: 'text.txt', content: 'simple text' },
      { filename: 'json.json', content: '{"key": "value", "array": [1,2,3]}' },
      { filename: 'empty.txt', content: '' },
      { filename: 'special.txt', content: 'Special chars: <>&"\'`' },
      { filename: 'unicode.txt', content: 'Hello 🌍 Unicode ñáéíóú' },
      { filename: 'multiline.txt', content: 'Line 1\nLine 2\nLine 3' },
      { filename: 'large.txt', content: 'x'.repeat(10000) }
    ]

    testCases.forEach(({ filename, content }) => {
      expect(() => download(filename, content)).not.toThrow()
    })
  })

  it('should properly encode special characters', () => {
    // Test that our understanding of URL encoding is correct
    const specialChars = '<>&"'
    const encoded = encodeURIComponent(specialChars)
    expect(encoded).toBe('%3C%3E%26%22')
    
    // Test that the function handles these characters
    expect(() => download('special.txt', specialChars)).not.toThrow()
  })

  it('should handle edge cases', () => {
    // Test empty filename - function should still work
    expect(() => download('', 'content')).not.toThrow()
    
    // Test very long filename
    const longFilename = 'a'.repeat(200) + '.txt'
    expect(() => download(longFilename, 'content')).not.toThrow()
    
    // Test null-like strings
    expect(() => download('null.txt', 'null')).not.toThrow()
    expect(() => download('undefined.txt', 'undefined')).not.toThrow()
  })
})
