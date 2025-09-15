import {
  TProductFamily,
  TProductTreeBranch,
  getDefaultProductTreeBranch,
} from '@/routes/products/types/tProductTreeBranch'
import { uid } from 'uid'
import { TCSAFDocument } from '../csafExport/csafExport'
import { TParsedProductTreeBranch } from '../csafExport/parseProductTreeBranches'
import { DeepPartial } from '../deepPartial'

export type ProductTreeParseResult = {
  products: TProductTreeBranch[]
  families: TProductFamily[]
}

function convertCSAFProductTreeBranches(
  csafPTBs: TParsedProductTreeBranch[],
  extractedFamilies: Map<string, TProductFamily>,
  familyMap: Map<string, string>, // Maps family name chains to family IDs
  currentFamilyPath: string[] = [], // Track the current family path
): TProductTreeBranch[] {
  return (
    csafPTBs
      ?.map((csafPTB) => {
        // Handle product_family branches - extract them and continue with children
        if (csafPTB.category === 'product_family') {
          // Build the new family path
          const newFamilyPath = [...currentFamilyPath, csafPTB.name]

          // Return the children branches, continuing with the new family path
          return convertCSAFProductTreeBranches(
            csafPTB.branches ?? [],
            extractedFamilies,
            familyMap,
            newFamilyPath,
          )
        }

        // For products, link to the most specific family in the current path
        let familyId: string | undefined
        if (currentFamilyPath.length > 0) {
          const familyKey = currentFamilyPath.join('/')
          familyId = familyMap.get(familyKey)
        }

        const defaultPTB = getDefaultProductTreeBranch(csafPTB.category)
        return {
          id: csafPTB.product?.product_id ?? defaultPTB.id,
          category: csafPTB.category,
          name: csafPTB.name || defaultPTB.name,
          productName: csafPTB.product?.name,
          description: csafPTB.product?.name ?? defaultPTB.description,
          identificationHelper: csafPTB.product?.product_identification_helper,
          subBranches: convertCSAFProductTreeBranches(
            csafPTB.branches ?? [],
            extractedFamilies,
            familyMap,
            currentFamilyPath,
          ),
          familyId: familyId,
          // We don't have a type for imported Files, so we set it to undefined
          type: undefined,
        } as TProductTreeBranch
      })
      .flat() || [] // Flatten because product_family processing can return arrays
  )
}

function extractFamilyFromBranch(
  branch: TParsedProductTreeBranch,
  extractedFamilies: Map<string, TProductFamily>,
  familyMap: Map<string, string>,
  familyPath: string[], // Use path array instead of parentFamilyId
): TProductFamily {
  // Create a key for this family position using the full path
  const familyKey = familyPath.join('/')

  // Check if we already have this family
  let existingFamilyId = familyMap.get(familyKey)
  if (existingFamilyId && extractedFamilies.has(existingFamilyId)) {
    return extractedFamilies.get(existingFamilyId)!
  }

  // Get parent family if exists
  let parentFamily: TProductFamily | null = null
  if (familyPath.length > 1) {
    const parentPath = familyPath.slice(0, -1).join('/')
    const parentFamilyId = familyMap.get(parentPath)
    if (parentFamilyId) {
      parentFamily = extractedFamilies.get(parentFamilyId) || null
    }
  }

  // Create new family
  const familyId = uid()
  console.log('branch', branch)
  const family: TProductFamily = {
    id: familyId,
    name: branch.name,
    parent: parentFamily,
  }

  // Store in maps
  extractedFamilies.set(familyId, family)
  familyMap.set(familyKey, familyId)

  return family
}

function extractFamiliesFromTree(
  branches: TParsedProductTreeBranch[],
  extractedFamilies: Map<string, TProductFamily>,
  familyMap: Map<string, string>,
  currentFamilyPath: string[] = [],
): void {
  for (const branch of branches) {
    if (branch.category === 'product_family') {
      // Build the family path
      const newPath = [...currentFamilyPath, branch.name]

      // Extract this family
      extractFamilyFromBranch(branch, extractedFamilies, familyMap, newPath)

      // Continue with children
      extractFamiliesFromTree(
        branch.branches ?? [],
        extractedFamilies,
        familyMap,
        newPath,
      )
    } else if (branch.branches) {
      // Continue with children for non-family branches
      extractFamiliesFromTree(
        branch.branches,
        extractedFamilies,
        familyMap,
        currentFamilyPath,
      )
    }
  }
}

export function parseProductTree(
  csafDocument: DeepPartial<TCSAFDocument>,
): ProductTreeParseResult {
  const parsedBranches = csafDocument.product_tree
    ?.branches as TParsedProductTreeBranch[]

  if (!parsedBranches) {
    return { products: [], families: [] }
  }

  // First pass: extract all families
  const extractedFamilies = new Map<string, TProductFamily>()
  const familyMap = new Map<string, string>() // Maps family name paths to IDs

  extractFamiliesFromTree(parsedBranches, extractedFamilies, familyMap)

  // Second pass: convert tree structure, removing family branches and linking products to families
  const products = convertCSAFProductTreeBranches(
    parsedBranches,
    extractedFamilies,
    familyMap,
    [], // Start with empty family path
  )

  const families = Array.from(extractedFamilies.values())

  return { products, families }
}
