import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Search, 
  Plus,
  Package,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Product } from '../types';
import { useProductContext } from '../context/ProductContext';
import { toast } from 'react-toastify';

interface AddStockModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddStockModal: React.FC<AddStockModalProps> = ({ isOpen, onClose }) => {
  const { state, updateProductStockAction, fetchProductsAction } = useProductContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [stockUpdates, setStockUpdates] = useState<Map<string, number>>(new Map());
  const [isProcessing, setIsProcessing] = useState(false);

  // Función para formatear precios
  const formatPrice = (price: number | string): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return numPrice.toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Filtrar productos por búsqueda
  const filteredProducts = useMemo(() => {
    return state.products.filter(product => 
      product.active && 
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [state.products, searchTerm]);

  // Obtener cantidad a agregar para un producto
  const getStockToAdd = (productId: string): number => {
    return stockUpdates.get(productId) || 0;
  };

  // Actualizar cantidad a agregar
  const updateStockToAdd = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setStockUpdates(prev => {
        const newMap = new Map(prev);
        newMap.delete(productId);
        return newMap;
      });
    } else {
      setStockUpdates(prev => new Map(prev.set(productId, quantity)));
    }
  };

  // Procesar todas las actualizaciones de stock
  const processStockUpdates = async () => {
    if (stockUpdates.size === 0) {
      toast.error('No hay productos seleccionados para actualizar');
      return;
    }

    const confirmed = window.confirm(
      `¿Confirmar agregar stock a ${stockUpdates.size} producto(s)?`
    );

    if (!confirmed) return;

    setIsProcessing(true);

    try {
      const updatePromises = Array.from(stockUpdates.entries()).map(async ([productId, quantityToAdd]) => {
        const product = state.products.find(p => p.id === productId);
        if (product) {
          const currentStock = product.stock || 0;
          const newStock = currentStock + quantityToAdd;
          await updateProductStockAction(productId, newStock);
          
          console.log(`📦 Stock agregado: ${product.name} (${currentStock} + ${quantityToAdd} = ${newStock})`);
        }
      });

      await Promise.all(updatePromises);

      // Refrescar productos
      await fetchProductsAction();

      // Mostrar resumen
      const summary = Array.from(stockUpdates.entries())
        .map(([productId, quantity]) => {
          const product = state.products.find(p => p.id === productId);
          return `• ${product?.name || 'Producto'}: +${quantity}`;
        })
        .join('\n');

      toast.success(
        `✅ Stock agregado exitosamente!\n\nProductos actualizados:\n${summary}`,
        { autoClose: 4000 }
      );

      // Limpiar y cerrar
      setStockUpdates(new Map());
      setSearchTerm('');
      onClose();

    } catch (error) {
      console.error('Error al agregar stock:', error);
      toast.error('Error al agregar stock. Inténtalo nuevamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Cerrar modal y limpiar
  const handleClose = () => {
    setStockUpdates(new Map());
    setSearchTerm('');
    onClose();
  };

  // Manejar tecla Escape
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 md:p-4"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="bg-white rounded-xl md:rounded-2xl shadow-2xl w-full max-w-6xl max-h-[98vh] md:max-h-[95vh] flex flex-col">
        {/* Header - Optimizado para móvil */}
        <div className="flex items-center justify-between p-3 md:p-6 border-b border-gray-200">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-1.5 md:p-2 bg-blue-100 rounded-lg">
              <Package className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg md:text-2xl font-bold text-gray-900">Agregar Stock</h2>
              <p className="text-xs md:text-sm text-gray-600 hidden sm:block">Aumenta el inventario de productos existentes</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 md:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        {/* Content - Altura fija como SalesModal */}
        <div className="flex flex-col h-[calc(95vh-8rem)]">
          <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
          {/* Products List */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Search - Optimizado para móvil */}
            <div className="p-3 md:p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 md:pl-10 pr-4 py-2.5 md:py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Products Grid - Optimizado para móvil con altura fija */}
            <div className="flex-1 overflow-y-auto p-3 md:p-4 md:max-h-none max-h-64">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-8 md:py-12">
                  <Package className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-3 md:mb-4" />
                  <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">No hay productos</h3>
                  <p className="text-sm text-gray-500">
                    {searchTerm ? 'No se encontraron productos con ese nombre' : 'No hay productos disponibles'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-3">
                  {filteredProducts.map((product) => {
                    const stockToAdd = getStockToAdd(product.id);
                    const isSelected = stockToAdd > 0;

                    return (
                      <div 
                        key={product.id} 
                        className={`relative p-3 border-2 rounded-lg transition-all duration-200 ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        {/* Product Image - Más pequeña */}
                        <div className="relative mb-2 flex justify-center">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-16 h-16 object-contain rounded-md bg-gray-50"
                            loading="lazy"
                          />
                          {isSelected && (
                            <div className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full p-0.5">
                              <CheckCircle className="w-3 h-3" />
                            </div>
                          )}
                        </div>

                        {/* Product Info - Más compacto */}
                        <div className="space-y-1">
                          <h3 
                            className="font-semibold text-xs leading-tight text-gray-900 text-center min-h-[2rem] overflow-hidden"
                            style={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical'
                            }}
                          >
                            {product.name}
                          </h3>
                          <p className="text-xs text-gray-600 text-center font-medium">${formatPrice(product.price)}</p>
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-xs text-gray-500">Stock:</span>
                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                              (product.stock || 0) <= 5 
                                ? 'text-red-700 bg-red-100' 
                                : 'text-green-700 bg-green-100'
                            }`}>
                              {product.stock || 0}
                            </span>
                          </div>
                        </div>

                        {/* Stock Controls - Mejorados */}
                        <div className="mt-2 flex items-center gap-1">
                          <button
                            onClick={() => updateStockToAdd(product.id, Math.max(0, stockToAdd - 1))}
                            disabled={stockToAdd <= 0}
                            className={`flex-shrink-0 w-7 h-7 rounded border flex items-center justify-center text-sm font-medium transition-colors ${
                              stockToAdd <= 0 
                                ? 'border-gray-200 text-gray-300 cursor-not-allowed' 
                                : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-800 hover:bg-gray-50'
                            }`}
                          >
                            -
                          </button>
                          
                          <input
                            type="number"
                            min="0"
                            max="999"
                            value={stockToAdd || ''}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 0;
                              updateStockToAdd(product.id, Math.max(0, Math.min(999, value)));
                            }}
                            className="flex-1 min-w-0 text-center border border-gray-300 rounded px-1 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                            placeholder="0"
                            style={{ width: 'calc(100% - 3.5rem)' }}
                          />
                          
                          <button
                            onClick={() => updateStockToAdd(product.id, Math.min(999, stockToAdd + 1))}
                            className="flex-shrink-0 w-7 h-7 rounded border border-blue-300 text-blue-600 hover:border-blue-400 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 flex items-center justify-center text-sm font-medium transition-colors"
                          >
                            +
                          </button>
                        </div>

                        {/* Indicador de cantidad seleccionada */}
                        {isSelected && (
                          <div className="mt-1 text-center">
                            <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                              +{stockToAdd}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-gray-200 bg-gray-50 overflow-y-auto flex-shrink-0">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Resumen de Stock</h3>
              <p className="text-sm text-gray-600 mt-1">
                {stockUpdates.size} producto{stockUpdates.size !== 1 ? 's' : ''} seleccionado{stockUpdates.size !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {stockUpdates.size === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">
                    Selecciona productos para agregar stock
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {Array.from(stockUpdates.entries()).map(([productId, quantity]) => {
                    const product = state.products.find(p => p.id === productId);
                    if (!product) return null;

                    return (
                      <div key={productId} className="bg-white p-3 rounded-lg border border-gray-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm text-gray-900 truncate">
                              {product.name}
                            </h4>
                            <p className="text-xs text-gray-600 mt-1">
                              Stock actual: {product.stock || 0}
                            </p>
                            <p className="text-xs text-green-600 font-medium mt-1">
                              +{quantity} → {(product.stock || 0) + quantity}
                            </p>
                          </div>
                          <button
                            onClick={() => updateStockToAdd(productId, 0)}
                            className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Action Button */}
            {stockUpdates.size > 0 && (
              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={processStockUpdates}
                  disabled={isProcessing}
                  className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                    isProcessing
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 text-white hover:scale-105 shadow-lg hover:shadow-xl'
                  }`}
                >
                                          {isProcessing ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white border-opacity-30"></div>
                            <span className="hidden sm:inline">Procesando...</span>
                            <span className="sm:hidden">...</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Agregar Stock ({stockUpdates.size})</span>
                            <span className="sm:hidden">+{stockUpdates.size}</span>
                          </>
                        )}
                </button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Se actualizará el inventario automáticamente
                </p>
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

export default AddStockModal;