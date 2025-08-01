import axios from 'axios'
import { useCallback, useEffect } from 'react'
import useProductDatabase from './useProductDatabase'

export interface Vendor {
  id: string
  name: string
  description: string
  product_count: number
}

export interface Product {
  vendor_id: string
  type: string
  id: string
  name: string
  full_name: string
  description: string
}

export interface ProductVersion {
  id: string
  name: string
  description: string
}

export interface IdentificationHelper {
  id: string
  category: string
  metadata: string
}

const client = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
})

export function useDatabaseClient() {
  const { apiUrl: apiUrlDomain, url, enabled } = useProductDatabase()

  if (!enabled || !apiUrlDomain) {
    throw new Error('Product database is not enabled in the configuration.')
  }

  const apiUrl = `${apiUrlDomain}/api/v1`

  useEffect(() => {
    client.defaults.baseURL = apiUrl
  }, [apiUrl])

  const fetchVendors = useCallback(async (): Promise<Vendor[]> => {
    const response = await client.get<Vendor[]>('/vendors')
    return response.data
  }, [])

  const fetchProducts = useCallback(async (): Promise<Product[]> => {
    const response = await client.get<Product[]>('/products')
    return response.data
  }, [])

  const fetchProductVersions = useCallback(
    async (productId: string): Promise<ProductVersion[]> => {
      const response = await client.get<ProductVersion[]>(
        `/products/${productId}/versions`,
      )
      return response.data
    },
    [],
  )

  const fetchIdentificationHelpers = useCallback(
    async (versionId: string): Promise<IdentificationHelper[]> => {
      const response = await client.get<IdentificationHelper[]>(
        `/product-versions/${versionId}/identification-helpers`,
      )
      return response.data
    },
    [],
  )

  return {
    url: url,
    fetchVendors,
    fetchProducts,
    fetchProductVersions,
    fetchIdentificationHelpers,
  }
}
