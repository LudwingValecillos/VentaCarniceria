import { ProductState, ProductAction } from './types';

// Reducer optimizado con mejor organización
export function productReducer(state: ProductState, action: ProductAction): ProductState {
  switch (action.type) {
    // Fetch operations
    case 'FETCH_PRODUCTS_START':
      return { 
        ...state, 
        loading: true, 
        error: null 
      };
    
    case 'FETCH_PRODUCTS_SUCCESS':
      return { 
        ...state, 
        products: action.payload, 
        loading: false, 
        error: null, 
        initialized: true 
      };
    
    case 'FETCH_PRODUCTS_FAILURE':
      return { 
        ...state, 
        loading: false, 
        error: action.payload 
      };

    // Product CRUD operations
    case 'ADD_PRODUCT':
      return { 
        ...state, 
        products: [...state.products, action.payload] 
      };
    
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
          p.id === action.payload.id 
            ? { ...p, ...action.payload.updates } 
            : p
        ) 
      };

    // Batch updates from server
    case 'TOGGLE_PRODUCT_STATUS_SUCCESS':
    case 'UPDATE_PRODUCT_PRICE_SUCCESS':
    case 'TOGGLE_PRODUCT_OFFER_SUCCESS':
    case 'UPDATE_PRODUCT_NAME_SUCCESS':
    case 'UPDATE_PRODUCT_IMAGE_SUCCESS':
    case 'UPDATE_PRODUCT_STOCK_SUCCESS':
    case 'DELETE_PRODUCT_SUCCESS':
      return { 
        ...state, 
        products: action.payload 
      };

    // Error handling for specific operations
    case 'TOGGLE_PRODUCT_STATUS_FAILURE':
    case 'UPDATE_PRODUCT_PRICE_FAILURE':
    case 'TOGGLE_PRODUCT_OFFER_FAILURE':
    case 'UPDATE_PRODUCT_NAME_FAILURE':
    case 'UPDATE_PRODUCT_IMAGE_FAILURE':
    case 'UPDATE_PRODUCT_STOCK_FAILURE':
    case 'DELETE_PRODUCT_FAILURE':
      return {
        ...state,
        error: action.payload
      };

    default:
      return state;
  }
}