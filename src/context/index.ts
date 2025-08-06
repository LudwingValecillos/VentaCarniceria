// Exportaciones principales del contexto de productos
export {
  ProductProvider,
  ProductContext as default,
} from './ProductContext';

export {
  useProductContext,
  useProductState,
  useProductActionsHook,
  useFilteredProducts,
  useProductStats,
} from './hooks';

export { safeToast } from './utils';

// Exportar tipos para uso externo si es necesario
export type {
  ProductState,
  ProductAction,
  ProductContextType,
} from './types';

// Exportar utilidades
export {
  getErrorMessage,
  debounce,
  createSimpleCache,
} from './utils';