import { useContext, useMemo } from 'react';
import { ProductContext } from './ProductContext';
import { ProductContextType } from './types';

// Hook personalizado optimizado para usar el contexto
export const useProductContext = (): ProductContextType => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProductContext must be used within a ProductProvider');
  }
  return context;
};

// Hooks especializados para mejor rendimiento
export const useProductState = () => {
  const { state } = useProductContext();
  return state;
};

export const useProductActionsHook = () => {
  const context = useProductContext();
  return {
    fetchProductsAction: context.fetchProductsAction,
    addProductAction: context.addProductAction,
    toggleProductStatusAction: context.toggleProductStatusAction,
    updateProductPriceAction: context.updateProductPriceAction,
    updateProductStockAction: context.updateProductStockAction,
    toggleProductOfferAction: context.toggleProductOfferAction,
    updateProductNameAction: context.updateProductNameAction,
    updateProductImageAction: context.updateProductImageAction,
    deleteProductAction: context.deleteProductAction,
  };
};

// Hook para productos filtrados (optimizado)
export const useFilteredProducts = (
  searchTerm: string = '',
  selectedCategory: string | null = null
) => {
  const { products } = useProductState();
  
  return useMemo(() => {
    return products.filter((product) => 
      (selectedCategory === null || product.category === selectedCategory) &&
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm, selectedCategory]);
};

// Hook para estadísticas de productos
export const useProductStats = () => {
  const { products } = useProductState();
  
  return useMemo(() => ({
    total: products.length,
    active: products.filter(p => p.active).length,
    inactive: products.filter(p => !p.active).length,
    onOffer: products.filter(p => p.offer).length,
    lowStock: products.filter(p => (p.stock || 0) < 5).length,
    outOfStock: products.filter(p => (p.stock || 0) === 0).length,
  }), [products]);
};