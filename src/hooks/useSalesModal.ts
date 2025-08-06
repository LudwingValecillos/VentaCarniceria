import { useState, useEffect, useMemo, useCallback } from 'react';
import { Product } from '../types';
import { useProductContext, safeToast } from '../context/ProductContext';
import { createSaleAPI } from '../data/api';

// Tipo para items de venta
interface SaleItem extends Product {
  saleQuantity: number;
  saleTotal: number;
}

interface UseSalesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const useSalesModal = ({ isOpen, onClose }: UseSalesModalProps) => {
  const { state, updateProductStockAction, fetchProductsAction } = useProductContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<Map<string, SaleItem>>(new Map());
  const [isProcessing, setIsProcessing] = useState(false);
  const [tempQuantityInputs, setTempQuantityInputs] = useState<Map<string, string>>(new Map());
  const [currentStep, setCurrentStep] = useState<'select' | 'confirm'>('select');

  // Función para formatear precios
  const formatPrice = useCallback((price: number): string => {
    return price.toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, []);

  // Función para obtener el precio como número
  const getNumericPrice = useCallback((price: number | string): number => {
    return typeof price === 'string' ? parseFloat(price.replace(/\./g, '')) : price;
  }, []);

  // Validar entrada de cantidad en tiempo real
  const validateQuantityInput = useCallback((value: string): boolean => {
    const regex = /^[0-9]*[.,]?[0-9]*$/;
    return regex.test(value);
  }, []);

  // Filtrar productos por búsqueda
  const filteredProducts = useMemo(() => {
    return state.products.filter(product => 
      product.active && 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (product.stock || 0) > 0
    );
  }, [state.products, searchTerm]);

  // Calcular total de la venta
  const saleTotal = useMemo(() => {
    return Array.from(selectedItems.values()).reduce((sum, item) => sum + item.saleTotal, 0);
  }, [selectedItems]);

  // Agregar producto a la venta
  const addToSale = useCallback((product: Product) => {
    const numericPrice = getNumericPrice(product.price);
    const newItem: SaleItem = {
      ...product,
      saleQuantity: 1,
      saleTotal: numericPrice
    };
    setSelectedItems(prev => new Map(prev.set(product.id, newItem)));
  }, [getNumericPrice]);

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
      addToSale(product);
    }
  }, [selectedItems, addToSale]);

  // Actualizar cantidad de un producto
  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setSelectedItems(prev => {
      const newMap = new Map(prev);
      const item = newMap.get(productId);
      
      if (item && quantity > 0) {
        const maxStock = item.stock || 0;
        const finalQuantity = Math.min(quantity, maxStock);
        const numericPrice = getNumericPrice(item.price);
        
        newMap.set(productId, {
          ...item,
          saleQuantity: finalQuantity,
          saleTotal: numericPrice * finalQuantity
        });
      } else if (quantity <= 0) {
        newMap.delete(productId);
      }
      
      return newMap;
    });
  }, [getNumericPrice]);

  // Manejar entrada temporal mientras se escribe
  const handleQuantityInputChange = useCallback((productId: string, value: string) => {
    setTempQuantityInputs(prev => new Map(prev.set(productId, value)));
    
    const cleanValue = value.replace(/,/g, '.');
    const numericValue = parseFloat(cleanValue);
    
    if (!isNaN(numericValue) && numericValue > 0) {
      updateQuantity(productId, numericValue);
    }
  }, [updateQuantity]);

  // Manejar cuando el input pierde el foco
  const handleQuantityInputBlur = useCallback((productId: string, value: string) => {
    const cleanValue = value.replace(/,/g, '.');
    const numericValue = parseFloat(cleanValue);
    
    if (value === '' || isNaN(numericValue) || numericValue <= 0) {
      updateQuantity(productId, 0.5);
      setTempQuantityInputs(prev => new Map(prev.set(productId, '0.5')));
    } else {
      const item = selectedItems.get(productId);
      if (item) {
        setTempQuantityInputs(prev => new Map(prev.set(productId, item.saleQuantity.toString())));
      }
    }
  }, [updateQuantity, selectedItems]);

  // Limpiar valor temporal de un producto
  const clearTempQuantity = useCallback((productId: string) => {
    setTempQuantityInputs(prev => {
      const newMap = new Map(prev);
      newMap.delete(productId);
      return newMap;
    });
  }, []);

  // Remover producto de la venta
  const removeFromSale = useCallback((productId: string) => {
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

  // Procesar venta
  const processSale = useCallback(async () => {
    if (selectedItems.size === 0) {
      safeToast('No hay productos seleccionados para la venta', 'error');
      return;
    }

    const confirmed = window.confirm(
      `¿Confirmar venta por $${formatPrice(saleTotal)}?\n\n` +
      `Se actualizará el stock de ${selectedItems.size} producto(s).`
    );

    if (!confirmed) return;

    setIsProcessing(true);

    try {
      const saleData = {
        items: Array.from(selectedItems.values()).map(item => ({
          productId: item.id,
          productName: item.name,
          quantity: item.saleQuantity,
          unitPrice: getNumericPrice(item.price),
          category: item.category || 'general'
        })),
        notes: `Venta con ${selectedItems.size} productos diferentes`
      };

      await createSaleAPI(saleData);

      const updatePromises = Array.from(selectedItems.values()).map(async (item) => {
        const newStock = (item.stock || 0) - item.saleQuantity;
        await updateProductStockAction(item.id, Math.max(0, newStock));
      });

      await Promise.all(updatePromises);

      const itemsSummary = Array.from(selectedItems.values())
        .map(item => `• ${item.name}: ${item.saleQuantity} unidades`)
        .join('\n');

      safeToast(
        `✅ Venta registrada y procesada exitosamente!\n\nTotal: $${formatPrice(saleTotal)}\n\nProductos:\n${itemsSummary}`,
        'success',
        { autoClose: 5000 }
      );

      // Limpiar y cerrar
      setSelectedItems(new Map());
      setTempQuantityInputs(new Map());
      setSearchTerm('');
      setCurrentStep('select');
      onClose();
      
      await fetchProductsAction();

    } catch (error) {
      console.error('Error al procesar venta:', error);
      safeToast('Error al procesar la venta. Inténtalo nuevamente.', 'error');
    } finally {
      setIsProcessing(false);
    }
  }, [selectedItems, saleTotal, formatPrice, getNumericPrice, updateProductStockAction, fetchProductsAction, onClose]);

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
      safeToast('Selecciona al menos un producto para continuar', 'error');
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
    saleTotal,
    
    // Actions
    setSearchTerm,
    toggleProductSelection,
    updateQuantity,
    handleQuantityInputChange,
    handleQuantityInputBlur,
    clearTempQuantity,
    removeFromSale,
    processSale,
    handleClose,
    handleNextStep,
    handleBackStep,
    
    // Utils
    formatPrice,
    getNumericPrice,
    validateQuantityInput
  };
};

export default useSalesModal;