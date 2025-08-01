import { describe, it, expect } from 'vitest'
import {
  MButtonInitial,
  MButtonLeftFinal,
  MButtonRightFinal,
  MButtonIconInitial,
  MButtonIconFinal
} from '../../../src/routes/document-selection/categorySelection.motions'

describe('categorySelection.motions', () => {
  describe('MButtonInitial', () => {
    it('should have correct initial button styling', () => {
      expect(MButtonInitial).toEqual({
        marginLeft: 20,
        marginRight: 20,
        borderRadius: 20,
        fontSize: '25px',
        padding: '2rem',
      })
    })

    it('should be an object with all required properties', () => {
      expect(MButtonInitial).toHaveProperty('marginLeft')
      expect(MButtonInitial).toHaveProperty('marginRight')
      expect(MButtonInitial).toHaveProperty('borderRadius')
      expect(MButtonInitial).toHaveProperty('fontSize')
      expect(MButtonInitial).toHaveProperty('padding')
    })

    it('should have numeric margin values', () => {
      expect(typeof MButtonInitial.marginLeft).toBe('number')
      expect(typeof MButtonInitial.marginRight).toBe('number')
      expect(typeof MButtonInitial.borderRadius).toBe('number')
    })

    it('should have string values for size properties', () => {
      expect(typeof MButtonInitial.fontSize).toBe('string')
      expect(typeof MButtonInitial.padding).toBe('string')
    })
  })

  describe('MButtonLeftFinal', () => {
    it('should extend base final properties with left-specific border radius', () => {
      expect(MButtonLeftFinal).toHaveProperty('borderTopRightRadius', 0)
      expect(MButtonLeftFinal).toHaveProperty('borderBottomRightRadius', 0)
      expect(MButtonLeftFinal).toHaveProperty('borderRadius', 20)
    })

    it('should have final button state properties', () => {
      expect(MButtonLeftFinal).toHaveProperty('marginLeft', 0)
      expect(MButtonLeftFinal).toHaveProperty('marginRight', 0)
      expect(MButtonLeftFinal).toHaveProperty('marginTop', '2rem')
      expect(MButtonLeftFinal).toHaveProperty('fontSize', '0px')
      expect(MButtonLeftFinal).toHaveProperty('lineHeight', '0px')
      expect(MButtonLeftFinal).toHaveProperty('gap', 0)
      expect(MButtonLeftFinal).toHaveProperty('padding', '1rem')
    })
  })

  describe('MButtonRightFinal', () => {
    it('should extend base final properties with right-specific border radius', () => {
      expect(MButtonRightFinal).toHaveProperty('borderBottomLeftRadius', 0)
      expect(MButtonRightFinal).toHaveProperty('borderTopLeftRadius', 0)
      expect(MButtonRightFinal).toHaveProperty('borderRadius', 20)
    })

    it('should have final button state properties', () => {
      expect(MButtonRightFinal).toHaveProperty('marginLeft', 0)
      expect(MButtonRightFinal).toHaveProperty('marginRight', 0)
      expect(MButtonRightFinal).toHaveProperty('marginTop', '2rem')
      expect(MButtonRightFinal).toHaveProperty('fontSize', '0px')
      expect(MButtonRightFinal).toHaveProperty('lineHeight', '0px')
      expect(MButtonRightFinal).toHaveProperty('gap', 0)
      expect(MButtonRightFinal).toHaveProperty('padding', '1rem')
    })
  })

  describe('MButtonIconInitial', () => {
    it('should have correct initial icon styling', () => {
      expect(MButtonIconInitial).toEqual({
        fontSize: '4rem',
      })
    })

    it('should have large font size for initial state', () => {
      expect(MButtonIconInitial.fontSize).toBe('4rem')
    })
  })

  describe('MButtonIconFinal', () => {
    it('should have correct final icon styling', () => {
      expect(MButtonIconFinal).toEqual({
        fontSize: '1.5rem',
      })
    })

    it('should have smaller font size for final state', () => {
      expect(MButtonIconFinal.fontSize).toBe('1.5rem')
    })

    it('should be smaller than initial state', () => {
      const initialSize = parseFloat(MButtonIconInitial.fontSize.replace('rem', ''))
      const finalSize = parseFloat(MButtonIconFinal.fontSize.replace('rem', ''))
      expect(finalSize).toBeLessThan(initialSize)
    })
  })

  describe('Animation consistency', () => {
    it('should have consistent border radius in left and right final states', () => {
      expect(MButtonLeftFinal.borderRadius).toBe(MButtonRightFinal.borderRadius)
    })

    it('should have consistent margin and padding values in left and right final states', () => {
      expect(MButtonLeftFinal.marginLeft).toBe(MButtonRightFinal.marginLeft)
      expect(MButtonLeftFinal.marginRight).toBe(MButtonRightFinal.marginRight)
      expect(MButtonLeftFinal.marginTop).toBe(MButtonRightFinal.marginTop)
      expect(MButtonLeftFinal.padding).toBe(MButtonRightFinal.padding)
    })

    it('should have consistent text properties in left and right final states', () => {
      expect(MButtonLeftFinal.fontSize).toBe(MButtonRightFinal.fontSize)
      expect(MButtonLeftFinal.lineHeight).toBe(MButtonRightFinal.lineHeight)
      expect(MButtonLeftFinal.gap).toBe(MButtonRightFinal.gap)
    })
  })

  describe('Type safety', () => {
    it('should export objects that can be used as TargetAndTransition', () => {
      // These objects should be usable with framer-motion
      expect(typeof MButtonInitial).toBe('object')
      expect(typeof MButtonLeftFinal).toBe('object')
      expect(typeof MButtonRightFinal).toBe('object')
      expect(typeof MButtonIconInitial).toBe('object')
      expect(typeof MButtonIconFinal).toBe('object')
    })
  })
})
