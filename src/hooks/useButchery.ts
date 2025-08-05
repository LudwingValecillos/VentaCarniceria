import { useState, useEffect } from 'react';
import { 
  getProductsByCurrentUrl, 
  getButcheryByCurrentUrl, 
  getButcheryAndProductsByUrl,
  Product, 
  Butchery 
} from '../services/butcheryService';

/**
 * Hook para obtener productos basándose en la URL actual
 * Hook to get products based on current URL
 */
export const useProductsByUrl = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedProducts = await getProductsByCurrentUrl();
      setProducts(fetchedProducts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar productos');
      console.error('Error en useProductsByUrl:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts
  };
};

/**
 * Hook para obtener información de la carnicería basándose en la URL actual
 * Hook to get butchery information based on current URL
 */
export const useButcheryByUrl = () => {
  const [butchery, setButchery] = useState<Butchery | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchButchery = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedButchery = await getButcheryByCurrentUrl();
      setButchery(fetchedButchery);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar información');
      console.error('Error en useButcheryByUrl:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchButchery();
  }, []);

  return {
    butchery,
    loading,
    error,
    refetch: fetchButchery
  };
};

/**
 * Hook completo que obtiene tanto la carnicería como sus productos
 * Complete hook that gets both butchery and its products
 */
export const useButcheryComplete = () => {
  const [butchery, setButchery] = useState<Butchery | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);
      const { butchery: fetchedButchery, products: fetchedProducts } = await getButcheryAndProductsByUrl();
      setButchery(fetchedButchery);
      setProducts(fetchedProducts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
      console.error('Error en useButcheryComplete:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return {
    butchery,
    products,
    loading,
    error,
    refetch: fetchAll,
    // Estados derivados útiles
    isButcheryFound: !!butchery,
    hasProducts: products.length > 0,
    productCount: products.length
  };
};