import { toast, ToastOptions } from 'react-toastify';

// Configuración optimizada de toast con mejores defaults
const defaultToastConfig: ToastOptions = {
  position: "top-right",
  autoClose: 2000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
};

// Función safeToast optimizada y reutilizable
export const safeToast = (
  message: string, 
  type: 'success' | 'error' | 'info' = 'info',
  customConfig?: Partial<ToastOptions>
) => {
  const config = { ...defaultToastConfig, ...customConfig };

  try {
    switch (type) {
      case 'success':
        toast.success(message, config);
        break;
      case 'error':
        toast.error(message, config);
        break;
      default:
        toast.info(message, config);
    }
  } catch (error) {
    // Fallback en caso de error con toast
    console.log(`Toast ${type.toUpperCase()}: ${message}`);
  }
};

// Utilidades para manejo de errores
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Error desconocido';
};

// Utilidades para optimización
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Cache simple para evitar re-renders innecesarios
export const createSimpleCache = <T>() => {
  const cache = new Map<string, T>();
  
  return {
    get: (key: string): T | undefined => cache.get(key),
    set: (key: string, value: T): void => { cache.set(key, value); },
    has: (key: string): boolean => cache.has(key),
    clear: (): void => cache.clear(),
  };
};