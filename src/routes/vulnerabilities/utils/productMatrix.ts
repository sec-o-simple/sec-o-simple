import { uid } from 'uid'
import { TVulnerability } from '../types/tVulnerability'
import {
  TProductStatus,
  TVulnerabilityProduct,
} from '../types/tVulnerabilityProduct'

export const matrixProductStatuses = [
  'known_affected',
  'known_not_affected',
  'fixed',
  'under_investigation',
] as const

export type TMatrixProductStatus = (typeof matrixProductStatuses)[number]
export type TMatrixProductStatusValue = TMatrixProductStatus | ''

const matrixStatusSet = new Set<string>(matrixProductStatuses)

function isMatrixStatus(status: string): status is TMatrixProductStatus {
  return matrixStatusSet.has(status)
}

export function getMatrixCellStatus(
  vulnerability: TVulnerability,
  productId: string,
): TMatrixProductStatusValue {
  for (let i = vulnerability.products.length - 1; i >= 0; i--) {
    const product = vulnerability.products[i]
    if (product.productId === productId && isMatrixStatus(product.status)) {
      return product.status
    }
  }

  return ''
}

export function hasVulnerabilityMatrixAssignment(
  vulnerability: TVulnerability,
): boolean {
  return vulnerability.products.some(
    (product) => !!product.productId && isMatrixStatus(product.status),
  )
}

export function updateVulnerabilityProductStatus(
  vulnerability: TVulnerability,
  productId: string,
  status: TMatrixProductStatusValue,
  idGenerator: () => string = uid,
): TVulnerability {
  const filteredProducts = vulnerability.products.filter(
    (product) => product.productId !== productId,
  )

  if (!status) {
    return {
      ...vulnerability,
      products: filteredProducts,
    }
  }

  return {
    ...vulnerability,
    products: [
      ...filteredProducts,
      {
        id: idGenerator(),
        productId,
        status: status as TProductStatus,
      } satisfies TVulnerabilityProduct,
    ],
  }
}

export function applyStatusToProductVersion(
  vulnerabilities: TVulnerability[],
  productId: string,
  status: TMatrixProductStatusValue,
  idGenerator: () => string = uid,
): TVulnerability[] {
  return vulnerabilities.map((vulnerability) =>
    updateVulnerabilityProductStatus(
      vulnerability,
      productId,
      status,
      idGenerator,
    ),
  )
}

export function applyStatusToVulnerability(
  vulnerability: TVulnerability,
  productIds: string[],
  status: TMatrixProductStatusValue,
  idGenerator: () => string = uid,
): TVulnerability {
  return productIds.reduce(
    (current, productId) =>
      updateVulnerabilityProductStatus(current, productId, status, idGenerator),
    vulnerability,
  )
}
