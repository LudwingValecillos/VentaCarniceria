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
  addNewProduct,
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
  | { type: 'UPDATE_PRODUCT_OPTIMISTIC'; payload: { id: string; updates: Partial<Product> } }
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
    case 'UPDATE_PRODUCT_OPTIMISTIC':
      return { 
        ...state, 
        products: state.products.map(p => 
          p.id === action.payload.id ? { ...p, ...action.payload.updates } : p
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
  addProductAction: (product: Omit<Product, 'id' | 'active' | 'offer' | 'image'> & { image: File; offer?: boolean }) => Promise<void>;
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
    // Always allow fetching for admin operations
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
  }, []);

  const addProductAction = useCallback(async (product: Omit<Product, 'id' | 'active' | 'offer' | 'image'> & { image: File; offer?: boolean }) => {
    // Crear un producto temporal para vista previa optimista
    const tempProduct: Product = {
      id: crypto.randomUUID(),
      name: product.name,
      price: typeof product.price === 'string' 
        ? parseFloat(product.price.replace(/\./g, ''))
        : product.price,
      category: product.category,
      image: URL.createObjectURL(product.image), // Vista previa temporal
      active: true,
      offer: product.offer || false,
    };

    try {
      // Agregar producto optimista inmediato
      dispatch({ 
        type: 'ADD_PRODUCT', 
        payload: tempProduct 
      });

      // Agregar producto en backend
      const newProduct = await addNewProduct(product);
      
      if (newProduct) {
        // Limpiar URL temporal
        URL.revokeObjectURL(tempProduct.image);
        
        // Actualizar con el producto real del backend
        dispatch({ 
          type: 'UPDATE_PRODUCT', 
          payload: newProduct 
        });
        
        safeToast('Producto agregado exitosamente', 'success');
      } else {
        throw new Error('Error al agregar producto');
      }
    } catch (error) {
      // Limpiar URL temporal en caso de error también
      URL.revokeObjectURL(tempProduct.image);
      
      // Revertir adición optimista en caso de error
      dispatch({ 
        type: 'REMOVE_PRODUCT', 
        payload: tempProduct.id 
      });
      safeToast('Error al agregar el producto', 'error');
      throw error;
    }
  }, []);

  const toggleProductStatusAction = useCallback(async (productId: string) => {
    try {
      const currentProduct = state.products.find(p => p.id === productId);
      if (!currentProduct) return;

      // Actualización optimista inmediata
      dispatch({ 
        type: 'UPDATE_PRODUCT_OPTIMISTIC', 
        payload: { id: productId, updates: { active: !currentProduct.active } }
      });

      // Actualizar en backend en segundo plano
      await updateProduct(productId, { 
        active: !currentProduct.active 
      });
      
    } catch (error) {
      // Revertir cambio optimista en caso de error
      dispatch({ 
        type: 'UPDATE_PRODUCT_OPTIMISTIC', 
        payload: { id: productId, updates: { active: currentProduct.active } }
      });
      dispatch({ 
        type: 'TOGGLE_PRODUCT_STATUS_FAILURE', 
        payload: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }, [state.products]);

  const updateProductPriceAction = useCallback(async (productId: string, newPrice: number) => {
    try {
      const currentProduct = state.products.find(p => p.id === productId);
      if (!currentProduct) return;

      // Actualización optimista inmediata
      dispatch({ 
        type: 'UPDATE_PRODUCT_OPTIMISTIC', 
        payload: { id: productId, updates: { price: newPrice } }
      });

      // Actualizar en backend en segundo plano
      await updateProduct(productId, { price: newPrice });
      
    } catch (error) {
      // Revertir cambio optimista en caso de error
      dispatch({ 
        type: 'UPDATE_PRODUCT_OPTIMISTIC', 
        payload: { id: productId, updates: { price: currentProduct.price } }
      });
      dispatch({ 
        type: 'UPDATE_PRODUCT_PRICE_FAILURE', 
        payload: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }, [state.products]);

  const toggleProductOfferAction = useCallback(async (productId: string) => {
    try {
      const currentProduct = state.products.find(p => p.id === productId);
      if (!currentProduct) return;

      // Actualización optimista inmediata
      dispatch({ 
        type: 'UPDATE_PRODUCT_OPTIMISTIC', 
        payload: { id: productId, updates: { offer: !currentProduct.offer } }
      });

      // Actualizar en backend en segundo plano
      await updateProduct(productId, { 
        offer: !currentProduct.offer 
      });
      
    } catch (error) {
      // Revertir cambio optimista en caso de error
      dispatch({ 
        type: 'UPDATE_PRODUCT_OPTIMISTIC', 
        payload: { id: productId, updates: { offer: currentProduct.offer } }
      });
      dispatch({ 
        type: 'TOGGLE_PRODUCT_OFFER_FAILURE', 
        payload: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }, [state.products]);

  const updateProductNameAction = useCallback(async (productId: string, newName: string) => {
    try {
      const currentProduct = state.products.find(p => p.id === productId);
      if (!currentProduct) return;

      // Actualización optimista inmediata
      dispatch({ 
        type: 'UPDATE_PRODUCT_OPTIMISTIC', 
        payload: { id: productId, updates: { name: newName } }
      });

      // Actualizar en backend en segundo plano
      await updateProduct(productId, { name: newName });
      
      safeToast('Nombre actualizado', 'success');
    } catch (error) {
      // Revertir cambio optimista en caso de error
      dispatch({ 
        type: 'UPDATE_PRODUCT_OPTIMISTIC', 
        payload: { id: productId, updates: { name: currentProduct.name } }
      });
      safeToast('Error al actualizar el nombre', 'error');
      dispatch({ 
        type: 'UPDATE_PRODUCT_NAME_FAILURE', 
        payload: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }, [state.products]);

  const updateProductImageAction = useCallback(async (productId: string, newImageFile: File) => {
    try {
      const currentProduct = state.products.find(p => p.id === productId);
      if (!currentProduct) return;

      // Crear URL temporal para vista previa inmediata
      const tempImageUrl = URL.createObjectURL(newImageFile);
      
      // Actualización optimista inmediata con imagen temporal
      dispatch({ 
        type: 'UPDATE_PRODUCT_OPTIMISTIC', 
        payload: { id: productId, updates: { image: tempImageUrl } }
      });

      // Subir imagen y actualizar en backend
      const updatedProducts = await updateProductImage(productId, newImageFile);
      
      // Limpiar URL temporal
      URL.revokeObjectURL(tempImageUrl);
      
      // Obtener la imagen real actualizada del backend
      const updatedProduct = updatedProducts.find(p => p.id === productId);
      if (updatedProduct) {
        dispatch({ 
          type: 'UPDATE_PRODUCT_OPTIMISTIC', 
          payload: { id: productId, updates: { image: updatedProduct.image } }
        });
      }
      
    } catch (error) {
      // Revertir cambio optimista en caso de error
      const currentProduct = state.products.find(p => p.id === productId);
      if (currentProduct) {
        dispatch({ 
          type: 'UPDATE_PRODUCT_OPTIMISTIC', 
          payload: { id: productId, updates: { image: currentProduct.image } }
        });
      }
      dispatch({ 
        type: 'UPDATE_PRODUCT_IMAGE_FAILURE', 
        payload: error instanceof Error ? error.message : 'Error desconocido'
      });
      safeToast('Error al actualizar la imagen', 'error');
    }
  }, [state.products]);

  const deleteProductAction = useCallback(async (productId: string) => {
    try {
      const currentProduct = state.products.find(p => p.id === productId);
      if (!currentProduct) return;

      // Eliminación optimista inmediata
      dispatch({ 
        type: 'REMOVE_PRODUCT', 
        payload: productId 
      });

      // Eliminar en backend en segundo plano
      await deleteProduct(productId);
      
      safeToast('Producto eliminado', 'success');
    } catch (error) {
      // Revertir eliminación optimista en caso de error
      if (currentProduct) {
        dispatch({ 
          type: 'ADD_PRODUCT', 
          payload: currentProduct 
        });
      }
      safeToast('Error al eliminar el producto', 'error');
      dispatch({ 
        type: 'DELETE_PRODUCT_FAILURE', 
        payload: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }, [state.products]);

  const contextValue: ProductContextType = {
    state,
    dispatch,
    fetchProductsAction,
    addProductAction,
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
