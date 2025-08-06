import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Search, 
  Plus, 
  Minus, 
  ShoppingCart, 
  DollarSign,
  Package,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Product } from '../types';
import { useProductContext, safeToast } from '../context/ProductContext';
import { createSaleAPI } from '../data/api';

// Tipo para items de venta
interface SaleItem extends Product {
  saleQuantity: number;
  saleTotal: number;
}

interface SalesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SalesModal: React.FC<SalesModalProps> = ({ isOpen, onClose }) => {
  const { state, updateProductStockAction, fetchProductsAction } = useProductContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<Map<string, SaleItem>>(new Map());
  const [isProcessing, setIsProcessing] = useState(false);
  const [tempQuantityInputs, setTempQuantityInputs] = useState<Map<string, string>>(new Map());

  // Función para formatear precios
  const formatPrice = (price: number): string => {
    return price.toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Función para obtener el precio como número
  const getNumericPrice = (price: number | string): number => {
    return typeof price === 'string' ? parseFloat(price.replace(/\./g, '')) : price;
  };

  // Filtrar productos por búsqueda
  const filteredProducts = useMemo(() => {
    return state.products.filter(product => 
      product.active && 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (product.stock || 0) > 0 // Solo mostrar productos con stock
    );
  }, [state.products, searchTerm]);

  // Calcular total de la venta
  const saleTotal = useMemo(() => {
    return Array.from(selectedItems.values()).reduce((sum, item) => sum + item.saleTotal, 0);
  }, [selectedItems]);

  // Agregar producto a la venta
  const addToSale = (product: Product) => {
    const numericPrice = getNumericPrice(product.price);
    const newItem: SaleItem = {
      ...product,
      saleQuantity: 1,
      saleTotal: numericPrice
    };

    setSelectedItems(prev => new Map(prev.set(product.id, newItem)));
  };

  // Actualizar cantidad de un producto
  const updateQuantity = (productId: string, quantity: number) => {
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
  };

  // Manejar entrada temporal mientras se escribe
  const handleQuantityInputChange = (productId: string, value: string) => {
    // Actualizar el valor temporal del input
    setTempQuantityInputs(prev => new Map(prev.set(productId, value)));
    
    // Si el valor es válido, actualizar la cantidad real
    const cleanValue = value.replace(/,/g, '.');
    const numericValue = parseFloat(cleanValue);
    
    if (!isNaN(numericValue) && numericValue > 0) {
      updateQuantity(productId, numericValue);
    }
  };

  // Manejar cuando el input pierde el foco
  const handleQuantityInputBlur = (productId: string, value: string) => {
    const cleanValue = value.replace(/,/g, '.');
    const numericValue = parseFloat(cleanValue);
    
    if (value === '' || isNaN(numericValue) || numericValue <= 0) {
      // Si el valor es inválido, usar 0.5 como mínimo
      updateQuantity(productId, 0.5);
      setTempQuantityInputs(prev => new Map(prev.set(productId, '0.5')));
    } else {
      // Sincronizar el valor temporal con el real
      const item = selectedItems.get(productId);
      if (item) {
        setTempQuantityInputs(prev => new Map(prev.set(productId, item.saleQuantity.toString())));
      }
    }
  };

  // Obtener el valor a mostrar en el input
  const getInputValue = (productId: string, actualQuantity: number): string => {
    const tempValue = tempQuantityInputs.get(productId);
    return tempValue !== undefined ? tempValue : actualQuantity.toString();
  };

  // Validar entrada de cantidad en tiempo real
  const validateQuantityInput = (value: string): boolean => {
    // Permitir números decimales con punto o coma, incluyendo valores vacíos temporalmente
    const regex = /^[0-9]*[.,]?[0-9]*$/;
    return regex.test(value);
  };

  // Remover producto de la venta
  const removeFromSale = (productId: string) => {
    setSelectedItems(prev => {
      const newMap = new Map(prev);
      newMap.delete(productId);
      return newMap;
    });
  };

  // Procesar venta
  const processSale = async () => {
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
      // Preparar datos de la venta para Firebase
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

      // Crear venta en Firebase
      await createSaleAPI(saleData);

      // Actualizar stock de todos los productos
      const updatePromises = Array.from(selectedItems.values()).map(async (item) => {
        const newStock = (item.stock || 0) - item.saleQuantity;
        await updateProductStockAction(item.id, Math.max(0, newStock));
      });

      await Promise.all(updatePromises);

      // Mostrar resumen de venta
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
      onClose();

      // Refrescar productos para mostrar stock actualizado
      await fetchProductsAction();

    } catch (error) {
      console.error('Error al procesar venta:', error);
      safeToast('Error al procesar la venta. Inténtalo nuevamente.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Limpiar al cerrar
  const handleClose = () => {
    setSelectedItems(new Map());
    setTempQuantityInputs(new Map());
    setSearchTerm('');
    onClose();
  };

  // Manejar tecla Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        handleClose();
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
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md flex items-center justify-center p-2 md:p-4 animate-fade-in"
      onClick={handleClose}
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}
    >
          <div 
      className="bg-white rounded-xl md:rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden animate-scale-in border border-gray-200"
      onClick={(e) => e.stopPropagation()}
    >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-500 p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold font-lobster flex items-center gap-2">
                <ShoppingCart className="w-7 h-7" />
                Nueva Venta
              </h2>
              <p className="text-white/90 text-sm">
                Busca y selecciona productos para vender
              </p>
            </div>
            <button 
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110"
              aria-label="Cerrar modal de ventas"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex flex-col h-[calc(95vh-8rem)]">
          {/* Search Bar */}
          <div className="p-4 md:p-6 border-b border-gray-200 bg-gray-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-sm"
                autoFocus
              />
            </div>
            {/* Selected items count on mobile */}
            {selectedItems.size > 0 && (
              <div className="mt-3 md:hidden">
                <div className="bg-green-100 border border-green-300 rounded-lg p-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-green-800">
                    {selectedItems.size} producto{selectedItems.size !== 1 ? 's' : ''} seleccionado{selectedItems.size !== 1 ? 's' : ''}
                  </span>
                  <span className="text-lg font-bold text-green-600">
                    ${formatPrice(saleTotal)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
            {/* Products List */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 md:max-h-none max-h-64">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  <span className="hidden md:inline">Productos Disponibles</span>
                  <span className="md:hidden">Productos</span>
                </h3>
                {filteredProducts.length > 0 && (
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {filteredProducts.length} disponible{filteredProducts.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              
              {state.loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2 text-sm">Cargando productos...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">
                    {searchTerm ? 'No se encontraron productos' : 'No hay productos disponibles'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  {filteredProducts.map((product) => {
                    const isSelected = selectedItems.has(product.id);
                    const stock = product.stock || 0;
                    
                    return (
                      <div
                        key={product.id}
                        className={`border-2 rounded-lg md:rounded-xl p-3 md:p-4 transition-all duration-200 cursor-pointer hover:shadow-md ${
                          isSelected 
                            ? 'border-green-500 bg-green-50 shadow-sm' 
                            : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                        }`}
                        onClick={() => !isSelected && addToSale(product)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative flex-shrink-0">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-lg shadow-soft"
                            />
                            {isSelected && (
                              <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                                <CheckCircle className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-800 text-sm md:text-base truncate leading-tight">
                              {product.name}
                            </h4>
                            <p className="text-xs md:text-sm text-gray-600 mt-1">
                              ${formatPrice(getNumericPrice(product.price))}/unidad
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                stock > 10 ? 'bg-green-100 text-green-800' :
                                stock > 5 ? 'bg-yellow-100 text-yellow-800' :
                                stock > 0 ? 'bg-orange-100 text-orange-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {stock} en stock
                              </span>
                              {!isSelected && (
                                <Plus className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Selected Items Sidebar */}
            <div className="w-full md:w-96 border-t md:border-t-0 md:border-l border-gray-200 bg-gray-50 overflow-y-auto flex-shrink-0">
              <div className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    <span className="hidden md:inline">Productos Seleccionados</span>
                    <span className="md:hidden">Seleccionados</span>
                  </h3>
                  {selectedItems.size > 0 && (
                    <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                      {selectedItems.size}
                    </span>
                  )}
                </div>

                {selectedItems.size === 0 ? (
                  <div className="text-center py-6 md:py-8">
                    <ShoppingCart className="w-10 h-10 md:w-12 md:h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">
                      Selecciona productos para agregar a la venta
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 md:space-y-4">
                    {Array.from(selectedItems.values()).map((item) => (
                      <div key={item.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        {/* Product Header */}
                        <div className="p-3 md:p-4 border-b border-gray-100">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-12 h-12 md:w-14 md:h-14 object-cover rounded-lg shadow-sm"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-800 text-sm md:text-base truncate leading-tight">
                                {item.name}
                              </h4>
                              <p className="text-xs md:text-sm text-gray-600 mt-1">
                                ${formatPrice(getNumericPrice(item.price))}/unidad
                              </p>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-xs text-gray-500">
                                  Stock disponible: {item.stock || 0}
                                </span>
                                <button
                                  onClick={() => removeFromSale(item.id)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                                  disabled={isProcessing}
                                  title="Eliminar producto"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="p-3 md:p-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-700">Cantidad:</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  const newQuantity = Math.max(0.5, item.saleQuantity - 0.5);
                                  updateQuantity(item.id, newQuantity);
                                  setTempQuantityInputs(prev => {
                                    const newMap = new Map(prev);
                                    newMap.delete(item.id);
                                    return newMap;
                                  });
                                }}
                                className="bg-gray-100 hover:bg-red-100 text-gray-700 hover:text-red-600 p-2 rounded-lg transition-colors flex-shrink-0"
                                disabled={isProcessing || item.saleQuantity <= 0.5}
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <input
                                type="text"
                                value={getInputValue(item.id, item.saleQuantity)}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (validateQuantityInput(value)) {
                                    handleQuantityInputChange(item.id, value);
                                  }
                                }}
                                onBlur={(e) => {
                                  handleQuantityInputBlur(item.id, e.target.value);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.currentTarget.blur();
                                  }
                                }}
                                className="font-medium text-sm w-16 md:w-20 text-center bg-white border-2 border-gray-300 px-2 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors hover:border-green-400"
                                disabled={isProcessing}
                                placeholder="0.5"
                                title="Editable: Escribe la cantidad o usa +/-"
                              />
                              <button
                                onClick={() => {
                                  const newQuantity = item.saleQuantity + 0.5;
                                  updateQuantity(item.id, newQuantity);
                                  setTempQuantityInputs(prev => {
                                    const newMap = new Map(prev);
                                    newMap.delete(item.id);
                                    return newMap;
                                  });
                                }}
                                className="bg-gray-100 hover:bg-green-100 text-gray-700 hover:text-green-600 p-2 rounded-lg transition-colors flex-shrink-0"
                                disabled={isProcessing || item.saleQuantity >= (item.stock || 0)}
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Stock Warning */}
                          {item.saleQuantity >= (item.stock || 0) && (
                            <div className="flex items-center gap-2 mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                              <span className="text-xs text-yellow-700 font-medium">
                                Has alcanzado el stock máximo disponible
                              </span>
                            </div>
                          )}
                          
                          {/* Total Price */}
                          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                            <span className="text-sm font-medium text-gray-600">Subtotal:</span>
                            <span className="text-lg font-bold text-green-600">
                              ${formatPrice(item.saleTotal)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer with Total and Actions */}
              {selectedItems.size > 0 && (
                <div className="border-t border-gray-200 bg-white">
                  {/* Summary */}
                  <div className="p-4 md:p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <span className="text-sm text-gray-600 block">Productos</span>
                        <span className="text-xl font-bold text-gray-800">{selectedItems.size}</span>
                      </div>
                      <div className="text-center">
                        <span className="text-sm text-gray-600 block">Unidades</span>
                        <span className="text-xl font-bold text-gray-800">
                          {Array.from(selectedItems.values()).reduce((sum, item) => sum + item.saleQuantity, 0)}
                        </span>
                      </div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg border-2 border-green-200">
                      <span className="text-sm text-gray-600 block mb-1">Total de la Venta</span>
                      <span className="text-3xl font-bold text-green-600">
                        ${formatPrice(saleTotal)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Action Button */}
                  <div className="p-4 md:p-6">
                    <button
                      onClick={processSale}
                      disabled={isProcessing}
                      className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-3 ${
                        isProcessing
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white hover:scale-105 shadow-lg hover:shadow-xl'
                      }`}
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
                          Procesando Venta...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-6 h-6" />
                          Confirmar Venta
                        </>
                      )}
                    </button>
                    <p className="text-xs text-gray-500 text-center mt-2">
                      Se actualizará el stock automáticamente
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SalesModal;