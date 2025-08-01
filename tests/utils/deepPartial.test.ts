import { describe, it, expect } from 'vitest'
import type { DeepPartial } from '../../src/utils/deepPartial'

describe('DeepPartial', () => {
  interface TestObject {
    name: string
    age: number
    address: {
      street: string
      city: string
      coordinates: {
        lat: number
        lng: number
      }
    }
    hobbies: string[]
    metadata?: {
      created: Date
      tags: string[]
    }
  }

  it('should make all properties optional at all levels', () => {
    // This test verifies type compatibility at compile time
    const partial: DeepPartial<TestObject> = {}
    expect(partial).toEqual({})
  })

  it('should allow partial nested objects', () => {
    const partial: DeepPartial<TestObject> = {
      name: 'John',
      address: {
        city: 'New York'
        // street and coordinates are optional
      }
    }
    
    expect(partial.name).toBe('John')
    expect(partial.address?.city).toBe('New York')
    expect(partial.address?.street).toBeUndefined()
  })

  it('should allow deeply nested partial objects', () => {
    const partial: DeepPartial<TestObject> = {
      address: {
        coordinates: {
          lat: 40.7128
          // lng is optional
        }
      }
    }
    
    expect(partial.address?.coordinates?.lat).toBe(40.7128)
    expect(partial.address?.coordinates?.lng).toBeUndefined()
  })

  it('should work with arrays', () => {
    const partial: DeepPartial<TestObject> = {
      hobbies: ['reading']
    }
    
    expect(partial.hobbies).toEqual(['reading'])
  })

  it('should work with optional properties', () => {
    const partial: DeepPartial<TestObject> = {
      metadata: {
        tags: ['important']
        // created is optional
      }
    }
    
    expect(partial.metadata?.tags).toEqual(['important'])
    expect(partial.metadata?.created).toBeUndefined()
  })

  it('should work with primitive types', () => {
    type PrimitivePartial = DeepPartial<string>
    type NumberPartial = DeepPartial<number>
    type BooleanPartial = DeepPartial<boolean>
    
    const stringPartial: PrimitivePartial = 'test'
    const numberPartial: NumberPartial = 42
    const booleanPartial: BooleanPartial = true
    
    expect(stringPartial).toBe('test')
    expect(numberPartial).toBe(42)
    expect(booleanPartial).toBe(true)
  })

  it('should allow completely empty object', () => {
    const empty: DeepPartial<TestObject> = {}
    
    expect(Object.keys(empty)).toHaveLength(0)
  })

  it('should allow mix of provided and omitted properties', () => {
    const mixed: DeepPartial<TestObject> = {
      name: 'Alice',
      age: 30,
      address: {
        street: '123 Main St'
        // city and coordinates omitted
      }
      // hobbies and metadata omitted
    }
    
    expect(mixed.name).toBe('Alice')
    expect(mixed.age).toBe(30)
    expect(mixed.address?.street).toBe('123 Main St')
    expect(mixed.address?.city).toBeUndefined()
    expect(mixed.hobbies).toBeUndefined()
  })
})
