import React, {
  createContext,
  useReducer,
  ReactNode,
  useContext,
  Dispatch,
  useCallback,
  useRef,
} from 'react';
import { Product } from '../types';
import {
  fetchProducts,
  updateProduct,
  deleteProduct,
  updateProductImage,
} from '../data/api';
import { toast, ToastOptions } from 'react-toastify';

// Define el tipo de estado
interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

// Define los tipos de acciones
type ProductAction =
  | { type: 'FETCH_PRODUCTS_START' }
  | { type: 'FETCH_PRODUCTS_SUCCESS'; payload: Product[] }
  | { type: 'FETCH_PRODUCTS_FAILURE'; payload: string }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'REMOVE_PRODUCT'; payload: string }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'TOGGLE_PRODUCT_STATUS_START'; payload: string }
  | { type: 'TOGGLE_PRODUCT_STATUS_SUCCESS'; payload: Product[] }
  | { type: 'TOGGLE_PRODUCT_STATUS_FAILURE'; payload: string }
  | { type: 'UPDATE_PRODUCT_PRICE_START'; payload: { id: string; price: number } }
  | { type: 'UPDATE_PRODUCT_PRICE_SUCCESS'; payload: Product[] }
  | { type: 'UPDATE_PRODUCT_PRICE_FAILURE'; payload: string }
  | { type: 'TOGGLE_PRODUCT_OFFER_START'; payload: string }
  | { type: 'TOGGLE_PRODUCT_OFFER_SUCCESS'; payload: Product[] }
  | { type: 'TOGGLE_PRODUCT_OFFER_FAILURE'; payload: string }
  | { type: 'UPDATE_PRODUCT_NAME_START'; payload: { id: string; name: string } }
  | { type: 'UPDATE_PRODUCT_NAME_SUCCESS'; payload: Product[] }
  | { type: 'UPDATE_PRODUCT_NAME_FAILURE'; payload: string }
  | { type: 'DELETE_PRODUCT_START'; payload: string }
  | { type: 'DELETE_PRODUCT_SUCCESS'; payload: Product[] }
  | { type: 'DELETE_PRODUCT_FAILURE'; payload: string }
  | { type: 'UPDATE_PRODUCT_IMAGE_START'; payload: { id: string; imageFile: File } }
  | { type: 'UPDATE_PRODUCT_IMAGE_SUCCESS'; payload: Product[] }
  | { type: 'UPDATE_PRODUCT_IMAGE_FAILURE'; payload: string };

// Estado inicial
const initialState: ProductState = {
  products: [],
  loading: false,
  error: null,
  initialized: false,
};

// Reducer
function productReducer(state: ProductState, action: ProductAction): ProductState {
  switch (action.type) {
    case 'FETCH_PRODUCTS_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_PRODUCTS_SUCCESS':
      return { ...state, products: action.payload, loading: false, error: null, initialized: true };
    case 'FETCH_PRODUCTS_FAILURE':
      return { ...state, loading: false, error: action.payload };
    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.payload] };
    case 'REMOVE_PRODUCT':
      return { 
        ...state, 
        products: state.products.filter(p => p.id !== action.payload) 
      };
    case 'UPDATE_PRODUCT':
      return { 
        ...state, 
        products: state.products.map(p => 
          p.id === action.payload.id ? action.payload : p
        ) 
      };
    case 'TOGGLE_PRODUCT_STATUS_SUCCESS':
    case 'UPDATE_PRODUCT_PRICE_SUCCESS':
    case 'TOGGLE_PRODUCT_OFFER_SUCCESS':
    case 'UPDATE_PRODUCT_NAME_SUCCESS':
    case 'UPDATE_PRODUCT_IMAGE_SUCCESS':
    case 'DELETE_PRODUCT_SUCCESS':
      return { ...state, products: action.payload };
    default:
      return state;
  }
}

// Exportar la función safeToast de manera independiente
export const safeToast = (
  message: string, 
  type: 'success' | 'error' | 'info' = 'info'
) => {
  const toastConfig: ToastOptions = {
    position: "top-right",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  };

  switch (type) {
    case 'success':
      toast.success(message, toastConfig);
      break;
    case 'error':
      toast.error(message, toastConfig);
      break;
    default:
      toast.info(message, toastConfig);
  }
};

// Define el tipo del contexto
interface ProductContextType {
  state: ProductState;
  dispatch: Dispatch<ProductAction>;
  fetchProductsAction: () => Promise<void>;
  toggleProductStatusAction: (productId: string) => Promise<void>;
  updateProductPriceAction: (productId: string, newPrice: number) => Promise<void>;
  toggleProductOfferAction: (productId: string) => Promise<void>;
  updateProductNameAction: (productId: string, newName: string) => Promise<void>;
  updateProductImageAction: (productId: string, newImageFile: File) => Promise<void>;
  deleteProductAction: (productId: string) => Promise<void>;
  safeToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

// Crea el contexto con un valor por defecto
export const ProductContext = createContext<ProductContextType | undefined>(
  undefined
);

// Proveedor del contexto
export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(productReducer, initialState);
  const fetchPromiseRef = useRef<Promise<void> | null>(null);

  const fetchProductsAction = useCallback(async () => {
    // Only fetch if not already initialized or if products are empty
    if (state.initialized && state.products.length > 0) {
      return;
    }
    
    // If there's already a fetch in progress, return the existing promise
    if (fetchPromiseRef.current) {
      return fetchPromiseRef.current;
    }
    
    // Create a new fetch promise
    fetchPromiseRef.current = (async () => {
      dispatch({ type: 'FETCH_PRODUCTS_START' });
      
      try {
        const products = await fetchProducts();
        dispatch({ type: 'FETCH_PRODUCTS_SUCCESS', payload: products });
      } catch (error) {
        dispatch({ 
          type: 'FETCH_PRODUCTS_FAILURE', 
          payload: error instanceof Error ? error.message : 'Error desconocido' 
        });
      } finally {
        fetchPromiseRef.current = null;
      }
    })();
    
    return fetchPromiseRef.current;
  }, [state.initialized, state.products.length]);

  const toggleProductStatusAction = useCallback(async (productId: string) => {
    try {
      const currentProduct = state.products.find(p => p.id === productId);
      if (!currentProduct) return;

      const updatedProducts = await updateProduct(productId, { 
        active: !currentProduct.active 
      });
      
      dispatch({ 
        type: 'TOGGLE_PRODUCT_STATUS_SUCCESS', 
        payload: updatedProducts 
      });
    } catch (error) {
      dispatch({ 
        type: 'TOGGLE_PRODUCT_STATUS_FAILURE', 
        payload: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }, [state.products]);

  const updateProductPriceAction = useCallback(async (productId: string, newPrice: number) => {
    try {
      const updatedProducts = await updateProduct(productId, { price: newPrice });
      
      dispatch({ 
        type: 'UPDATE_PRODUCT_PRICE_SUCCESS', 
        payload: updatedProducts 
      });
    } catch (error) {
      dispatch({ 
        type: 'UPDATE_PRODUCT_PRICE_FAILURE', 
        payload: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }, []);

  const toggleProductOfferAction = useCallback(async (productId: string) => {
    try {
      const currentProduct = state.products.find(p => p.id === productId);
      if (!currentProduct) return;

      const updatedProducts = await updateProduct(productId, { 
        offer: !currentProduct.offer 
      });
      
      dispatch({ 
        type: 'TOGGLE_PRODUCT_OFFER_SUCCESS', 
        payload: updatedProducts 
      });
    } catch (error) {
      dispatch({ 
        type: 'TOGGLE_PRODUCT_OFFER_FAILURE', 
        payload: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }, [state.products]);

  const updateProductNameAction = useCallback(async (productId: string, newName: string) => {
    try {
      const updatedProducts = await updateProduct(productId, { name: newName });
      
      dispatch({ 
        type: 'UPDATE_PRODUCT_NAME_SUCCESS', 
        payload: updatedProducts 
      });
      safeToast('Nombre actualizado', 'success');
    } catch (error) {
      safeToast('Error al actualizar el nombre', 'error');
      dispatch({ 
        type: 'UPDATE_PRODUCT_NAME_FAILURE', 
        payload: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }, []);

  const updateProductImageAction = useCallback(async (productId: string, newImageFile: File) => {
    try {
      const updatedProducts = await updateProductImage(productId, newImageFile);
      
      dispatch({ 
        type: 'UPDATE_PRODUCT_IMAGE_SUCCESS', 
        payload: updatedProducts 
      });
      safeToast('Imagen actualizada exitosamente', 'success');
    } catch (error) {
      dispatch({ 
        type: 'UPDATE_PRODUCT_IMAGE_FAILURE', 
        payload: error instanceof Error ? error.message : 'Error desconocido'
      });
      safeToast('Error al actualizar la imagen', 'error');
    }
  }, []);

  const deleteProductAction = useCallback(async (productId: string) => {
    try {
      const updatedProducts = await deleteProduct(productId);
      
      dispatch({ 
        type: 'DELETE_PRODUCT_SUCCESS', 
        payload: updatedProducts 
      });
      safeToast('Producto eliminado', 'success');
    } catch (error) {
      safeToast('Error al eliminar el producto', 'error');
      dispatch({ 
        type: 'DELETE_PRODUCT_FAILURE', 
        payload: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }, []);

  const contextValue: ProductContextType = {
    state,
    dispatch,
    fetchProductsAction,
    toggleProductStatusAction,
    updateProductPriceAction,
    toggleProductOfferAction,
    updateProductNameAction,
    updateProductImageAction,
    deleteProductAction,
    safeToast,
  };

  return (
    <ProductContext.Provider value={contextValue}>
      {children}
    </ProductContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useProductContext = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProductContext must be used within a ProductProvider');
  }
  return context;
};

export default ProductContext;
