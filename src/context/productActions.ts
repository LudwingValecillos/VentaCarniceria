import { useCallback } from 'react';
import { Product } from '../types';
import { ProductState, ProductAction } from './types';
import {
  fetchProducts,
  updateProduct,
  deleteProduct,
  updateProductImage,
  updateProductStock,
  addNewProduct,
} from '../data/api';

// Hook personalizado para acciones de productos
export const useProductActions = (
  state: ProductState,
  dispatch: React.Dispatch<ProductAction>
) => {
  // Función helper para encontrar producto
  const findProduct = useCallback((productId: string) => {
    return state.products.find(p => p.id === productId);
  }, [state.products]);

  // Función helper para actualización optimista
  const updateOptimistic = useCallback((productId: string, updates: Partial<Product>) => {
    dispatch({
      type: 'UPDATE_PRODUCT_OPTIMISTIC',
      payload: { id: productId, updates }
    });
  }, [dispatch]);

  // Función helper para revertir cambios
  const revertOptimistic = useCallback((productId: string, originalProduct: Product) => {
    dispatch({
      type: 'UPDATE_PRODUCT_OPTIMISTIC',
      payload: { id: productId, updates: originalProduct }
    });
  }, [dispatch]);

  // Fetch products
  const fetchProductsAction = useCallback(async () => {
    dispatch({ type: 'FETCH_PRODUCTS_START' });
    
    try {
      const products = await fetchProducts();
      dispatch({ type: 'FETCH_PRODUCTS_SUCCESS', payload: products });
    } catch (error) {
      dispatch({ 
        type: 'FETCH_PRODUCTS_FAILURE', 
        payload: error instanceof Error ? error.message : 'Error desconocido' 
      });
    }
  }, [dispatch]);

  // Add product
  const addProductAction = useCallback(async (
    product: Omit<Product, 'id' | 'active' | 'offer' | 'image'> & { image: File; offer?: boolean }
  ) => {
    // Crear producto temporal para vista previa optimista
    const tempProduct: Product = {
      id: crypto.randomUUID(),
      name: product.name,
      price: typeof product.price === 'string' 
        ? parseFloat(product.price.replace(/\./g, ''))
        : product.price,
      category: product.category,
      image: URL.createObjectURL(product.image),
      active: true,
      offer: product.offer || false,
      stock: 10, // Stock por defecto
    };

    try {
      // Agregar producto optimista inmediato
      dispatch({ type: 'ADD_PRODUCT', payload: tempProduct });

      // Agregar producto en backend
      const newProduct = await addNewProduct(product);
      
      if (newProduct) {
        // Limpiar URL temporal
        URL.revokeObjectURL(tempProduct.image);
        
        // Actualizar con el producto real del backend
        dispatch({ type: 'UPDATE_PRODUCT', payload: newProduct });
        
        console.log('Producto agregado exitosamente');
      } else {
        throw new Error('Error al agregar producto');
      }
    } catch (error) {
      // Limpiar URL temporal en caso de error
      URL.revokeObjectURL(tempProduct.image);
      
      // Revertir adición optimista
      dispatch({ type: 'REMOVE_PRODUCT', payload: tempProduct.id });
      console.error('Error al agregar el producto');
      throw error;
    }
  }, [dispatch]);

  // Toggle product status
  const toggleProductStatusAction = useCallback(async (productId: string) => {
    const currentProduct = findProduct(productId);
    if (!currentProduct) return;

    try {
      // Actualización optimista
      updateOptimistic(productId, { active: !currentProduct.active });

      // Actualizar en backend
      await updateProduct(productId, { active: !currentProduct.active });
      
    } catch (error) {
      // Revertir en caso de error
      revertOptimistic(productId, currentProduct);
      dispatch({ 
        type: 'TOGGLE_PRODUCT_STATUS_FAILURE', 
        payload: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }, [findProduct, updateOptimistic, revertOptimistic, dispatch]);

  // Update product price
  const updateProductPriceAction = useCallback(async (productId: string, newPrice: number) => {
    const currentProduct = findProduct(productId);
    if (!currentProduct) return;

    try {
      // Actualización optimista
      updateOptimistic(productId, { price: newPrice });

      // Actualizar en backend
      await updateProduct(productId, { price: newPrice });
      
    } catch (error) {
      // Revertir en caso de error
      revertOptimistic(productId, currentProduct);
      dispatch({ 
        type: 'UPDATE_PRODUCT_PRICE_FAILURE', 
        payload: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }, [findProduct, updateOptimistic, revertOptimistic, dispatch]);

  // Update product stock
  const updateProductStockAction = useCallback(async (productId: string, newStock: number) => {
    const currentProduct = findProduct(productId);
    if (!currentProduct) return;

    try {
      // Actualización optimista
      updateOptimistic(productId, { stock: newStock });

      // Actualizar en backend
      await updateProductStock(productId, newStock);
      
    } catch (error) {
      // Revertir en caso de error
      revertOptimistic(productId, currentProduct);
      console.error('Error al actualizar el stock:', error);
      dispatch({ 
        type: 'UPDATE_PRODUCT_STOCK_FAILURE', 
        payload: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }, [findProduct, updateOptimistic, revertOptimistic, dispatch]);

  // Toggle product offer
  const toggleProductOfferAction = useCallback(async (productId: string) => {
    const currentProduct = findProduct(productId);
    if (!currentProduct) return;

    try {
      // Actualización optimista
      updateOptimistic(productId, { offer: !currentProduct.offer });

      // Actualizar en backend
      await updateProduct(productId, { offer: !currentProduct.offer });
      
    } catch (error) {
      // Revertir en caso de error
      revertOptimistic(productId, currentProduct);
      dispatch({ 
        type: 'TOGGLE_PRODUCT_OFFER_FAILURE', 
        payload: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }, [findProduct, updateOptimistic, revertOptimistic, dispatch]);

  // Update product name
  const updateProductNameAction = useCallback(async (productId: string, newName: string) => {
    const currentProduct = findProduct(productId);
    if (!currentProduct) return;

    try {
      // Actualización optimista
      updateOptimistic(productId, { name: newName });

      // Actualizar en backend
      await updateProduct(productId, { name: newName });
      
      console.log('Nombre actualizado');
    } catch (error) {
      // Revertir en caso de error
      revertOptimistic(productId, currentProduct);
      console.error('Error al actualizar el nombre');
      dispatch({ 
        type: 'UPDATE_PRODUCT_NAME_FAILURE', 
        payload: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }, [findProduct, updateOptimistic, revertOptimistic, dispatch]);

  // Update product image
  const updateProductImageAction = useCallback(async (productId: string, newImageFile: File) => {
    const currentProduct = findProduct(productId);
    if (!currentProduct) return;

    // Crear URL temporal para vista previa
    const tempImageUrl = URL.createObjectURL(newImageFile);
    
    try {
      // Actualización optimista con imagen temporal
      updateOptimistic(productId, { image: tempImageUrl });

      // Subir imagen y actualizar en backend
      const updatedProducts = await updateProductImage(productId, newImageFile);
      
      // Limpiar URL temporal
      URL.revokeObjectURL(tempImageUrl);
      
      // Obtener imagen real del backend
      const updatedProduct = updatedProducts.find(p => p.id === productId);
      if (updatedProduct) {
        updateOptimistic(productId, { image: updatedProduct.image });
      }
      
    } catch (error) {
      // Limpiar URL temporal y revertir
      URL.revokeObjectURL(tempImageUrl);
      revertOptimistic(productId, currentProduct);
      
      dispatch({ 
        type: 'UPDATE_PRODUCT_IMAGE_FAILURE', 
        payload: error instanceof Error ? error.message : 'Error desconocido'
      });
      console.error('Error al actualizar la imagen');
    }
  }, [findProduct, updateOptimistic, revertOptimistic, dispatch]);

  // Delete product
  const deleteProductAction = useCallback(async (productId: string) => {
    const currentProduct = findProduct(productId);
    if (!currentProduct) return;

    try {
      // Eliminación optimista
      dispatch({ type: 'REMOVE_PRODUCT', payload: productId });

      // Eliminar en backend
      await deleteProduct(productId);
      
      console.log('Producto eliminado');
    } catch (error) {
      // Revertir eliminación optimista
      dispatch({ type: 'ADD_PRODUCT', payload: currentProduct });
      console.error('Error al eliminar el producto');
      dispatch({ 
        type: 'DELETE_PRODUCT_FAILURE', 
        payload: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }, [findProduct, dispatch]);

  return {
    fetchProductsAction,
    addProductAction,
    toggleProductStatusAction,
    updateProductPriceAction,
    updateProductStockAction,
    toggleProductOfferAction,
    updateProductNameAction,
    updateProductImageAction,
    deleteProductAction,
  };
};