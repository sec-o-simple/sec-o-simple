import {
  CSAFRelationship,
  TFullProductName,
} from '@/routes/products/types/tRelationship'
import axios from 'axios'
import { useCallback, useEffect } from 'react'
import { TCSAFDocument } from './csafExport/csafExport'
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

export interface TProductDatabaseCSAFProducttree {
  product_tree: {
    branches: TCSAFDocument['product_tree']['branches']
    full_product_names: TFullProductName
    relationships: CSAFRelationship[]
  }
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

  const fetchCSAFProducts = useCallback(
    async (ids: string[]): Promise<TProductDatabaseCSAFProducttree> => {
      const response = await client.post<TProductDatabaseCSAFProducttree>(
        '/products/export',
        {
          product_ids: ids,
        },
      )
      return response.data
    },
    [],
  )

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
    fetchCSAFProducts,
    fetchProductVersions,
    fetchIdentificationHelpers,
  }
}
