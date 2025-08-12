import { useState, useEffect, useMemo, useCallback } from 'react';
import { Product } from '../types';
import { useProductContext } from '../context/ProductContext';
import { toast } from 'react-toastify';

// Tipo para items de stock
interface StockItem extends Product {
  stockToAdd: number;
}

interface UseAddStockModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const useAddStockModal = ({ isOpen, onClose }: UseAddStockModalProps) => {
  const { state, updateProductStockAction, fetchProductsAction } = useProductContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<Map<string, StockItem>>(new Map());
  const [isProcessing, setIsProcessing] = useState(false);
  const [tempQuantityInputs, setTempQuantityInputs] = useState<Map<string, string>>(new Map());
  const [currentStep, setCurrentStep] = useState<'select' | 'confirm'>('select');

  // Función para formatear precios
  const formatPrice = useCallback((price: number | string): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return numPrice.toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, []);

  // Función para obtener el precio como número
  const getNumericPrice = useCallback((price: number | string): number => {
    return typeof price === 'string' ? parseFloat(price.replace(/\./g, '')) : price;
  }, []);

  // Validar entrada de cantidad en tiempo real (solo números enteros para stock)
  const validateQuantityInput = useCallback((value: string): boolean => {
    const regex = /^[0-9]*$/;
    return regex.test(value);
  }, []);

  // Filtrar productos por búsqueda
  const filteredProducts = useMemo(() => {
    return state.products.filter(product => 
      product.active && 
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [state.products, searchTerm]);

  // Agregar producto a la selección
  const addToSelection = useCallback((product: Product) => {
    const newItem: StockItem = {
      ...product,
      stockToAdd: 1
    };
    setSelectedItems(prev => new Map(prev.set(product.id, newItem)));
  }, []);

  // Toggle selección de producto
  const toggleProductSelection = useCallback((product: Product) => {
    const isSelected = selectedItems.has(product.id);
    if (isSelected) {
      setSelectedItems(prev => {
        const newMap = new Map(prev);
        newMap.delete(product.id);
        return newMap;
      });
      setTempQuantityInputs(prev => {
        const newMap = new Map(prev);
        newMap.delete(product.id);
        return newMap;
      });
    } else {
      addToSelection(product);
    }
  }, [selectedItems, addToSelection]);

  // Actualizar cantidad de stock a agregar
  const updateStockQuantity = useCallback((productId: string, quantity: number) => {
    setSelectedItems(prev => {
      const newMap = new Map(prev);
      const item = newMap.get(productId);
      
      if (item && quantity > 0) {
        const finalQuantity = Math.max(1, Math.min(999, quantity)); // Min 1, Max 999
        
        newMap.set(productId, {
          ...item,
          stockToAdd: finalQuantity
        });
      } else if (quantity <= 0) {
        newMap.delete(productId);
      }
      
      return newMap;
    });
  }, []);

  // Manejar entrada temporal mientras se escribe
  const handleQuantityInputChange = useCallback((productId: string, value: string) => {
    setTempQuantityInputs(prev => new Map(prev.set(productId, value)));
    
    const numericValue = parseInt(value) || 0;
    
    if (numericValue > 0) {
      updateStockQuantity(productId, numericValue);
    }
  }, [updateStockQuantity]);

  // Manejar cuando el input pierde el foco
  const handleQuantityInputBlur = useCallback((productId: string, value: string) => {
    const numericValue = parseInt(value) || 0;
    
    if (value === '' || numericValue <= 0) {
      updateStockQuantity(productId, 1);
      setTempQuantityInputs(prev => new Map(prev.set(productId, '1')));
    } else {
      const item = selectedItems.get(productId);
      if (item) {
        setTempQuantityInputs(prev => new Map(prev.set(productId, item.stockToAdd.toString())));
      }
    }
  }, [updateStockQuantity, selectedItems]);

  // Limpiar valor temporal de un producto
  const clearTempQuantity = useCallback((productId: string) => {
    setTempQuantityInputs(prev => {
      const newMap = new Map(prev);
      newMap.delete(productId);
      return newMap;
    });
  }, []);

  // Remover producto de la selección
  const removeFromSelection = useCallback((productId: string) => {
    setSelectedItems(prev => {
      const newMap = new Map(prev);
      newMap.delete(productId);
      return newMap;
    });
    setTempQuantityInputs(prev => {
      const newMap = new Map(prev);
      newMap.delete(productId);
      return newMap;
    });
  }, []);

  // Procesar todas las actualizaciones de stock
  const processStockUpdates = useCallback(async () => {
    if (selectedItems.size === 0) {
      toast.error('No hay productos seleccionados para actualizar');
      return;
    }

    const confirmed = window.confirm(
      `¿Confirmar agregar stock a ${selectedItems.size} producto(s)?`
    );

    if (!confirmed) return;

    setIsProcessing(true);

    // Guardar datos para procesamiento en background
    const stockUpdatesToProcess = new Map(selectedItems);
    
    // Limpiar y cerrar modal inmediatamente
    setSelectedItems(new Map());
    setTempQuantityInputs(new Map());
    setSearchTerm('');
    setCurrentStep('select');
    onClose();

    // Procesar en background después de cerrar el modal
    try {
      const updatePromises = Array.from(stockUpdatesToProcess.values()).map(async (item) => {
        const currentStock = item.stock || 0;
        const newStock = currentStock + item.stockToAdd;
        await updateProductStockAction(item.id, newStock);
        
       
      });

      await Promise.all(updatePromises);

      // Refrescar productos
      await fetchProductsAction();

      const itemsSummary = Array.from(stockUpdatesToProcess.values())
        .map(item => `• ${item.name}: +${item.stockToAdd} unidades`)
        .join('\n');

      toast.success(
        `✅ Stock agregado exitosamente!\n\nProductos actualizados:\n${itemsSummary}`,
        { autoClose: 5000 }
      );

    } catch (error) {
      console.error('Error al agregar stock:', error);
      toast.error('Error al agregar stock. Inténtalo nuevamente.');
    } finally {
      setIsProcessing(false);
    }
  }, [selectedItems, updateProductStockAction, fetchProductsAction, onClose]);

  // Limpiar al cerrar
  const handleClose = useCallback(() => {
    setSelectedItems(new Map());
    setTempQuantityInputs(new Map());
    setSearchTerm('');
    setCurrentStep('select');
    onClose();
  }, [onClose]);

  // Navegación de pasos
  const handleNextStep = useCallback(() => {
    if (selectedItems.size > 0) {
      setCurrentStep('confirm');
    } else {
      toast.error('Selecciona al menos un producto para continuar');
    }
  }, [selectedItems.size]);

  const handleBackStep = useCallback(() => {
    setCurrentStep('select');
  }, []);

  // Resetear paso cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('select');
    }
  }, [isOpen]);

  // Manejar tecla Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        if (currentStep === 'confirm') {
          setCurrentStep('select');
        } else {
          handleClose();
        }
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, currentStep, handleClose]);

  return {
    // State
    state,
    searchTerm,
    selectedItems,
    isProcessing,
    tempQuantityInputs,
    currentStep,
    filteredProducts,
    
    // Actions
    setSearchTerm,
    toggleProductSelection,
    updateStockQuantity,
    handleQuantityInputChange,
    handleQuantityInputBlur,
    clearTempQuantity,
    removeFromSelection,
    processStockUpdates,
    handleClose,
    handleNextStep,
    handleBackStep,
    
    // Utils
    formatPrice,
    getNumericPrice,
    validateQuantityInput
  };
};

export default useAddStockModal;