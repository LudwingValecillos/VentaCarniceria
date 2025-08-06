import React, {
  createContext,
  useReducer,
  ReactNode,
  useMemo,
} from 'react';
import { ProductContextType, initialState } from './types';
import { productReducer } from './productReducer';
import { useProductActions } from './productActions';
import { safeToast } from './utils';

// Crea el contexto con un valor por defecto
export const ProductContext = createContext<ProductContextType | undefined>(
  undefined
);

// Proveedor del contexto optimizado
export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(productReducer, initialState);

  // Usar el hook de acciones personalizado
  const actions = useProductActions(state, dispatch);

  // Memoizar el valor del contexto para evitar re-renders innecesarios
  const contextValue = useMemo<ProductContextType>(() => ({
    state,
    ...actions,
    safeToast,
  }), [state, actions]);

  return (
    <ProductContext.Provider value={contextValue}>
      {children}
    </ProductContext.Provider>
  );
};

// Re-exportar hooks y utilidades para compatibilidad
export {
  useProductContext,
  useProductState,
  useProductActionsHook,
  useFilteredProducts,
  useProductStats,
} from './hooks';

export { safeToast } from './utils';

export default ProductContext;