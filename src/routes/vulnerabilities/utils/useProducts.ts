import { TProductTreeBranch } from '@/routes/products/types/tProductTreeBranch'
import useDocumentStore from '@/utils/useDocumentStore'
import { useMemo } from 'react'

export default function useProducts() {
  const productTree = useDocumentStore((state) => state.products)
  const productDetails = useMemo(
    () => Object.values(productTree)?.flatMap((ptb) => getProductDetails(ptb)),
    [productTree],
  )

  const getProductVersions = (productId: string) =>
    getProductVersionsOfBranch(Object.values(productTree), productId)

  return { productDetails, getProductVersions }
}

export type TProductDetails = {
  vendorName?: string
  productName: string
  productId: string
}

function getProductDetails(
  branch: TProductTreeBranch,
  vendorLabel?: string,
): TProductDetails[] {
  if (branch.category === 'vendor') {
    return branch.subBranches.flatMap((b) => getProductDetails(b, branch.name))
  } else if (branch.category === 'product_name') {
    return [
      {
        vendorName: vendorLabel,
        productName: branch.name,
        productId: branch.id,
      },
    ]
  } else {
    return []
  }
}

function getProductVersionsOfBranch(
  productTree: TProductTreeBranch[],
  productId: string,
): TProductTreeBranch[] | undefined {
  for (let branch of productTree) {
    if (branch.category === 'product_name' && branch.id === productId) {
      return branch.subBranches
    } else {
      const versions = getProductVersionsOfBranch(branch.subBranches, productId)
      if (versions) {
        return versions
      }
    }
  }
}
