import { describe, it, expect } from 'vitest'
import { getDynamicObjectValue, type DynamicObjectValueKey } from '../../src/utils/dynamicObjectValue'

describe('dynamicObjectValue', () => {
  const testObject = {
    name: 'John',
    age: 30,
    city: 'New York',
  }

  describe('getDynamicObjectValue', () => {
    it('should return value when key is a string property', () => {
      const result = getDynamicObjectValue(testObject, 'name')
      expect(result).toBe('John')
    })

    it('should return value when key is another string property', () => {
      const result = getDynamicObjectValue(testObject, 'age')
      expect(result).toBe(30)
    })

    it('should return value when key is a function', () => {
      const keyFunction = (obj: typeof testObject) => `${obj.name} from ${obj.city}`
      const result = getDynamicObjectValue(testObject, keyFunction)
      expect(result).toBe('John from New York')
    })

    it('should return transformed value when key function returns different type', () => {
      const keyFunction = (obj: typeof testObject) => obj.age * 2
      const result = getDynamicObjectValue(testObject, keyFunction)
      expect(result).toBe(60)
    })

    it('should work with nested object access in function', () => {
      const nestedObject = {
        user: {
          profile: {
            firstName: 'Jane',
            lastName: 'Doe',
          },
        },
      }
      const keyFunction = (obj: typeof nestedObject) => 
        `${obj.user.profile.firstName} ${obj.user.profile.lastName}`
      
      const result = getDynamicObjectValue(nestedObject, keyFunction)
      expect(result).toBe('Jane Doe')
    })

    it('should handle boolean return types', () => {
      const keyFunction = (obj: typeof testObject) => obj.age >= 18
      const result = getDynamicObjectValue(testObject, keyFunction)
      expect(result).toBe(true)
    })
  })

  describe('DynamicObjectValueKey type', () => {
    it('should accept string keys', () => {
      const key: DynamicObjectValueKey<typeof testObject> = 'name'
      const result = getDynamicObjectValue(testObject, key)
      expect(result).toBe('John')
    })

    it('should accept function keys', () => {
      const key: DynamicObjectValueKey<typeof testObject, number> = (obj) => obj.age
      const result = getDynamicObjectValue(testObject, key)
      expect(result).toBe(30)
    })
  })
})
