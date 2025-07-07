import { useCallback, useEffect } from "react";
import { useConfigStore } from "./useConfigStore";
import axios from "axios";

export interface Vendor {
  id: string;
  name: string;
  description: string;
  product_count: number;
}

export interface Product {
  vendor_id: string;
  type: string;
  id: string;
  name: string;
  full_name: string;
  description: string;
}

export interface ProductVersion {
  id: string;
  name: string;
  description: string;
}

const client = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

export function useDatabaseClient() {
  const config = useConfigStore((state) => state.config);

  if (!config?.productDatabase?.enabled || !config?.productDatabase?.apiUrl) {
    throw new Error("Product database is not enabled in the configuration.");
  }

  const apiUrl = `${config.productDatabase.apiUrl}/api/v1`;

  useEffect(() => {
    client.defaults.baseURL = apiUrl;
  }, [apiUrl]);

  const fetchVendors = useCallback(async (): Promise<Vendor[]> => {
    const response = await client.get<Vendor[]>('/vendors');
    return response.data;
  }, []);

  const fetchProducts = useCallback(async (): Promise<Product[]> => {
    const response = await client.get<Product[]>('/products');
    return response.data;
  }, []);

  const fetchProductVersions = useCallback(async (productId: string): Promise<ProductVersion[]> => {
    const response = await client.get<ProductVersion[]>(`/products/${productId}/versions`);
    return response.data;
  }, []);

  return {
    url: config.productDatabase.url,
    fetchVendors,
    fetchProducts,
    fetchProductVersions,
  }
}