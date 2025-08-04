import { describe, it, expect } from 'vitest'
import { getParentPTB } from '../../../src/utils/csafImport/utils'
import type { TProductTreeBranch } from '../../../src/routes/products/types/tProductTreeBranch'

describe('utils - csafImport', () => {
  describe('getParentPTB', () => {
    // Helper function to create test branches
    const createBranch = (
      id: string,
      name: string,
      subBranches: TProductTreeBranch[] = []
    ): TProductTreeBranch => ({
      id,
      category: 'vendor',
      name,
      description: `Description for ${name}`,
      subBranches,
    })

    it('should return undefined when startingBranches is empty', () => {
      const result = getParentPTB('any-id', [])
      expect(result).toBeUndefined()
    })

    it('should return undefined when id is not found in any branch', () => {
      const branches = [
        createBranch('branch1', 'Branch 1'),
        createBranch('branch2', 'Branch 2'),
      ]

      const result = getParentPTB('non-existent-id', branches)
      expect(result).toBeUndefined()
    })

    it('should return currentParent when id is found in startingBranches (root level)', () => {
      const parentBranch = createBranch('parent', 'Parent Branch')
      const targetBranch = createBranch('target', 'Target Branch')
      const branches = [targetBranch, createBranch('other', 'Other Branch')]

      const result = getParentPTB('target', branches, parentBranch)
      expect(result).toBe(parentBranch)
    })

    it('should return undefined when searching for root level branch without currentParent', () => {
      const targetBranch = createBranch('target', 'Target Branch')
      const branches = [targetBranch, createBranch('other', 'Other Branch')]

      const result = getParentPTB('target', branches)
      expect(result).toBeUndefined()
    })

    it('should find parent in nested structure - one level deep', () => {
      const childBranch = createBranch('child', 'Child Branch')
      const parentBranch = createBranch('parent', 'Parent Branch', [childBranch])
      const branches = [parentBranch]

      const result = getParentPTB('child', branches)
      expect(result).toBe(parentBranch)
    })

    it('should find parent in nested structure - multiple levels deep', () => {
      const grandChildBranch = createBranch('grandchild', 'Grand Child Branch')
      const childBranch = createBranch('child', 'Child Branch', [grandChildBranch])
      const parentBranch = createBranch('parent', 'Parent Branch', [childBranch])
      const rootBranch = createBranch('root', 'Root Branch', [parentBranch])
      const branches = [rootBranch]

      const result = getParentPTB('grandchild', branches)
      expect(result).toBe(childBranch)
    })

    it('should return correct parent for deeply nested branch', () => {
      const level4Branch = createBranch('level4', 'Level 4')
      const level3Branch = createBranch('level3', 'Level 3', [level4Branch])
      const level2Branch = createBranch('level2', 'Level 2', [level3Branch])
      const level1Branch = createBranch('level1', 'Level 1', [level2Branch])
      const rootBranch = createBranch('root', 'Root', [level1Branch])
      const branches = [rootBranch]

      const result = getParentPTB('level4', branches)
      expect(result).toBe(level3Branch)
    })

    it('should handle multiple root branches and find target in second branch', () => {
      const targetBranch = createBranch('target', 'Target Branch')
      const secondRoot = createBranch('second-root', 'Second Root', [targetBranch])
      const firstRoot = createBranch('first-root', 'First Root')
      const branches = [firstRoot, secondRoot]

      const result = getParentPTB('target', branches)
      expect(result).toBe(secondRoot)
    })

    it('should handle complex tree structure with multiple branches at each level', () => {
      const target = createBranch('target', 'Target')
      const sibling1 = createBranch('sibling1', 'Sibling 1')
      const sibling2 = createBranch('sibling2', 'Sibling 2')
      const parent = createBranch('parent', 'Parent', [sibling1, target, sibling2])
      
      const otherChild = createBranch('other-child', 'Other Child')
      const otherParent = createBranch('other-parent', 'Other Parent', [otherChild])
      
      const branches = [otherParent, parent]

      const result = getParentPTB('target', branches)
      expect(result).toBe(parent)
    })

    it('should return first match when multiple branches have the same id', () => {
      const duplicateId = 'duplicate'
      const target1 = createBranch(duplicateId, 'Target 1')
      const target2 = createBranch(duplicateId, 'Target 2')
      const parent1 = createBranch('parent1', 'Parent 1', [target1])
      const parent2 = createBranch('parent2', 'Parent 2', [target2])
      const branches = [parent1, parent2]

      const result = getParentPTB(duplicateId, branches)
      expect(result).toBe(parent1)
    })

    it('should handle empty subBranches arrays', () => {
      const branchWithEmptySubBranches = createBranch('empty', 'Empty', [])
      const branches = [branchWithEmptySubBranches]

      const result = getParentPTB('non-existent', branches)
      expect(result).toBeUndefined()
    })

    it('should handle branches with mixed empty and non-empty subBranches', () => {
      const target = createBranch('target', 'Target')
      const emptyBranch = createBranch('empty', 'Empty Branch', [])
      const parentWithTarget = createBranch('parent-with-target', 'Parent With Target', [target])
      const branches = [emptyBranch, parentWithTarget]

      const result = getParentPTB('target', branches)
      expect(result).toBe(parentWithTarget)
    })

    it('should handle single branch without subBranches', () => {
      const singleBranch = createBranch('single', 'Single Branch')
      const branches = [singleBranch]

      const result = getParentPTB('single', branches, undefined)
      expect(result).toBeUndefined()
    })

    it('should work with different TProductTreeBranch categories', () => {
      const target = createBranch('target', 'Target')
      target.category = 'product_name'
      
      const parent = createBranch('parent', 'Parent', [target])
      parent.category = 'vendor'
      
      const branches = [parent]

      const result = getParentPTB('target', branches)
      expect(result).toBe(parent)
      expect(result?.category).toBe('vendor')
    })

    it('should handle branch with additional properties', () => {
      const target: TProductTreeBranch = {
        id: 'target',
        category: 'product_version',
        name: 'Target Version',
        description: 'Target Description',
        subBranches: [],
        type: 'Software',
        identificationHelper: {
          purl: 'pkg:npm/example@1.0.0'
        }
      }

      const parent = createBranch('parent', 'Parent', [target])
      const branches = [parent]

      const result = getParentPTB('target', branches)
      expect(result).toBe(parent)
    })

    it('should handle searching for branch that exists at root level with explicit currentParent', () => {
      const explicitParent = createBranch('explicit-parent', 'Explicit Parent')
      const rootBranch = createBranch('root-branch', 'Root Branch')
      const branches = [rootBranch]

      const result = getParentPTB('root-branch', branches, explicitParent)
      expect(result).toBe(explicitParent)
    })

    it('should handle recursive search through multiple levels with no match', () => {
      const deepChild = createBranch('deep-child', 'Deep Child')
      const midChild = createBranch('mid-child', 'Mid Child', [deepChild])
      const topParent = createBranch('top-parent', 'Top Parent', [midChild])
      const branches = [topParent]

      const result = getParentPTB('non-existent-deep', branches)
      expect(result).toBeUndefined()
    })

    it('should handle asymmetric tree structure', () => {
      const leftDeepChild = createBranch('left-deep', 'Left Deep')
      const leftChild = createBranch('left-child', 'Left Child', [leftDeepChild])
      
      const rightChild = createBranch('right-child', 'Right Child') // No subBranches
      
      const root = createBranch('root', 'Root', [leftChild, rightChild])
      const branches = [root]

      const result = getParentPTB('left-deep', branches)
      expect(result).toBe(leftChild)
    })

    it('should handle wide tree structure with many siblings', () => {
      const target = createBranch('target', 'Target')
      const siblings = Array.from({ length: 10 }, (_, i) => 
        createBranch(`sibling-${i}`, `Sibling ${i}`)
      )
      const parent = createBranch('parent', 'Parent', [...siblings, target])
      const branches = [parent]

      const result = getParentPTB('target', branches)
      expect(result).toBe(parent)
    })

    it('should handle empty string id', () => {
      const targetBranch = createBranch('', 'Empty ID Branch')
      const parent = createBranch('parent', 'Parent', [targetBranch])
      const branches = [parent]

      const result = getParentPTB('', branches)
      expect(result).toBe(parent)
    })

    it('should handle special character ids', () => {
      const specialId = 'special@#$%^&*()_+-={}[]|\\:";\'<>?,./'
      const targetBranch = createBranch(specialId, 'Special ID Branch')
      const parent = createBranch('parent', 'Parent', [targetBranch])
      const branches = [parent]

      const result = getParentPTB(specialId, branches)
      expect(result).toBe(parent)
    })

    it('should demonstrate the actual implementation behavior with edge case', () => {
      // This test demonstrates the current implementation behavior
      // The function checks if ANY branch in startingBranches has the target id
      // rather than checking the current branch being iterated
      const targetBranch = createBranch('target', 'Target')
      const otherBranch = createBranch('other', 'Other')
      const branches = [targetBranch, otherBranch]

      // When searching for 'target' at root level, it finds 'target' in startingBranches
      // and returns currentParent (undefined in this case)
      const result = getParentPTB('target', branches)
      expect(result).toBeUndefined()
    })

    it('should handle null-like values gracefully', () => {
      const branches: TProductTreeBranch[] = []
      const result = getParentPTB('any-id', branches, undefined)
      expect(result).toBeUndefined()
    })

    it('should work with large tree structures', () => {
      // Create a large tree structure to test performance and correctness
      const createLargeTree = (depth: number, breadth: number): TProductTreeBranch => {
        if (depth === 0) {
          return createBranch(`leaf-${Math.random()}`, 'Leaf')
        }
        
        const children = Array.from({ length: breadth }, (_, i) =>
          createLargeTree(depth - 1, breadth)
        )
        
        return createBranch(`node-${depth}-${Math.random()}`, `Node Depth ${depth}`, children)
      }

      const target = createBranch('findme', 'Find Me')
      const largeTree = createLargeTree(3, 3)
      largeTree.subBranches.push(target)
      
      const branches = [largeTree]

      const result = getParentPTB('findme', branches)
      expect(result).toBe(largeTree)
    })
  })
})
