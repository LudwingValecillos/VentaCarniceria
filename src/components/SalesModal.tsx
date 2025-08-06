import React from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Search, 
  ShoppingCart, 
  Package,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Edit3
} from 'lucide-react';
import { useSalesModal } from '../hooks/useSalesModal';
import { ProductSelectionCard } from './ProductSelectionCard';
import { SaleItemCard } from './SaleItemCard';

interface SalesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SalesModal: React.FC<SalesModalProps> = ({ isOpen, onClose }) => {
  const {
    state,
    searchTerm,
    selectedItems,
    isProcessing,
    tempQuantityInputs,
    currentStep,
    filteredProducts,
    saleTotal,
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
    formatPrice,
    getNumericPrice,
    validateQuantityInput
  } = useSalesModal({ isOpen, onClose });

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md flex items-center justify-center p-2 md:p-4 animate-fade-in"
      onClick={() => currentStep === 'select' ? handleClose() : handleBackStep()}
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}
    >
      <div 
        className="bg-white rounded-xl md:rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden animate-scale-in border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Optimizado para pasos móviles */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-500 p-3 md:p-6 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              {/* Botón back solo en móvil en step confirm */}
              {currentStep === 'confirm' && (
                <button 
                  onClick={handleBackStep}
                  className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200 md:hidden"
                  aria-label="Volver al paso anterior"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div>
                <h2 className="text-lg md:text-2xl font-bold font-lobster flex items-center gap-1.5 md:gap-2">
                  <ShoppingCart className="w-5 h-5 md:w-7 md:h-7" />
                  {currentStep === 'select' ? 'Seleccionar Productos' : 'Confirmar Venta'}
                </h2>
                <p className="text-white/90 text-xs md:text-sm">
                  {currentStep === 'select' 
                    ? 'Busca y selecciona productos para vender' 
                    : 'Ajusta cantidades y confirma la venta'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Step indicator - Mejorado */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentStep === 'select' 
                      ? 'bg-white scale-110' 
                      : 'bg-white/60'
                  }`}></div>
                  <div className={`w-8 h-0.5 transition-all duration-300 ${
                    currentStep === 'confirm' 
                      ? 'bg-white' 
                      : 'bg-white/30'
                  }`}></div>
                  <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentStep === 'confirm' 
                      ? 'bg-white scale-110' 
                      : 'bg-white/60'
                  }`}></div>
                </div>
                <span className="text-xs text-white/80 ml-2 hidden sm:inline">
                  {currentStep === 'select' ? '1/2' : '2/2'}
                </span>
              </div>
              <button 
                onClick={handleClose}
                className="p-1.5 md:p-2 hover:bg-white/20 rounded-lg md:rounded-xl transition-all duration-200 hover:scale-110"
                aria-label="Cerrar modal de ventas"
              >
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* STEP 1: SELECCIÓN DE PRODUCTOS */}
        {currentStep === 'select' && (
          <div className="flex flex-col h-[calc(95vh-8rem)]">
            {/* Search Bar */}
            <div className="p-3 md:p-4 lg:p-6 border-b border-gray-200 bg-gray-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 md:pl-10 pr-4 py-2.5 md:py-3 border border-gray-300 rounded-lg md:rounded-xl text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-sm"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
              {/* Products List */}
              <div className="flex-1 overflow-y-auto p-4 md:p-4 lg:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Productos Disponibles
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
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-3">
                    {filteredProducts.map((product) => (
                      <ProductSelectionCard
                        key={product.id}
                        product={product}
                        isSelected={selectedItems.has(product.id)}
                        onToggleSelect={toggleProductSelection}
                        formatPrice={formatPrice}
                        getNumericPrice={getNumericPrice}
                      />
                    ))}
                  </div>
                )}
              </div>


            </div>

            {/* Bottom Bar - Móvil */}
            <div className="md:hidden border-t border-gray-200 bg-white p-4">
              {selectedItems.size > 0 ? (
                <div className="space-y-3">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-800">
                        {selectedItems.size} producto{selectedItems.size !== 1 ? 's' : ''} seleccionado{selectedItems.size !== 1 ? 's' : ''}
                      </span>
                      <span className="text-lg font-bold text-green-600">
                        ${formatPrice(saleTotal)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleNextStep}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg"
                  >
                    <span>Continuar</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="text-center py-2">
                  <p className="text-gray-500 text-sm">
                    Selecciona productos para continuar
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Bar - Desktop */}
            <div className="hidden md:block border-t border-gray-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold text-gray-800">
                  {selectedItems.size > 0 ? (
                    <span>{selectedItems.size} producto{selectedItems.size !== 1 ? 's' : ''} seleccionado{selectedItems.size !== 1 ? 's' : ''}</span>
                  ) : (
                    <span className="text-gray-500">Sin productos seleccionados</span>
                  )}
                </div>
                <button
                  onClick={handleNextStep}
                  disabled={selectedItems.size === 0}
                  className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 ${
                    selectedItems.size > 0
                      ? 'bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white shadow-lg hover:scale-105'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <span>Continuar</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: CONFIRMACIÓN Y CANTIDADES */}
        {currentStep === 'confirm' && (
          <div className="flex flex-col h-[calc(95vh-8rem)]">
            {/* Selected Items List */}
            <div className="flex-1 overflow-y-auto p-4 md:p-4 lg:p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Edit3 className="w-5 h-5" />
                  Ajustar Cantidades
                </h3>
                <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full font-medium">
                  {selectedItems.size} productos
                </span>
              </div>

                            {/* Mobile: Stack layout */}
              <div className="md:hidden space-y-3">
                {Array.from(selectedItems.values()).map((item) => (
                  <SaleItemCard
                    key={item.id}
                    item={item}
                    tempQuantityInputs={tempQuantityInputs}
                    isProcessing={isProcessing}
                    onQuantityUpdate={updateQuantity}
                    onTempQuantityChange={handleQuantityInputChange}
                    onQuantityInputBlur={handleQuantityInputBlur}
                    onClearTemp={clearTempQuantity}
                    onRemoveItem={removeFromSale}
                    formatPrice={formatPrice}
                    getNumericPrice={getNumericPrice}
                    validateQuantityInput={validateQuantityInput}
                    isCompact={false}
                  />
                ))}
              </div>

              {/* Desktop: 5-column grid layout without images */}
              <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-5 gap-3">
                {Array.from(selectedItems.values()).map((item) => (
                  <SaleItemCard
                    key={item.id}
                    item={item}
                    tempQuantityInputs={tempQuantityInputs}
                    isProcessing={isProcessing}
                    onQuantityUpdate={updateQuantity}
                    onTempQuantityChange={handleQuantityInputChange}
                    onQuantityInputBlur={handleQuantityInputBlur}
                    onClearTemp={clearTempQuantity}
                    onRemoveItem={removeFromSale}
                    formatPrice={formatPrice}
                    getNumericPrice={getNumericPrice}
                    validateQuantityInput={validateQuantityInput}
                    isCompact={true}
                  />
                ))}
              </div>
            </div>

            {/* Footer with Total and Actions */}
            <div className="border-t border-gray-200 bg-white">
              {/* Total Summary - Simplified for mobile */}
              <div className="p-3  bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
                <div className="grid grid-cols-3 gap-2 md:gap-4 mb-3 md:mb-4">
                  <div className="text-center">
                    <span className="text-xs text-gray-600 block">Productos</span>
                    <span className="text-sm md:text-lg lg:text-xl font-bold text-gray-800">{selectedItems.size}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-xs text-gray-600 block">Unidades</span>
                    <span className="text-sm md:text-lg lg:text-xl font-bold text-gray-800">
                      {Array.from(selectedItems.values()).reduce((sum, item) => sum + item.saleQuantity, 0)}
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="text-xs text-gray-600 block">Total</span>
                    <span className="text-sm md:text-lg lg:text-xl font-bold text-green-600">
                      ${formatPrice(saleTotal)}
                    </span>
                  </div>
                </div>
                <div className="text-center p-3  bg-white rounded-xl border-2 border-green-200 shadow-sm">
                  <span className="text-xs md:text-sm text-gray-600 block mb-1 md:mb-2">Total de la Venta</span>
                  <span className="text-xl md:text-3xl lg:text-4xl font-bold text-green-600">
                    ${formatPrice(saleTotal)}
                  </span>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="p-3 md:p-6 space-y-2 md:space-y-0 md:flex md:gap-4">
                {/* Mobile - Compact button layout */}
                <div className="flex gap-2 md:hidden">
                <button
                  onClick={handleBackStep}
                  disabled={isProcessing}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm">Volver</span>
                  </button>
                  <button
                    onClick={processSale}
                    disabled={isProcessing}
                    className={`flex-[2] py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                      isProcessing
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white shadow-lg'
                    }`}
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
                        <span className="text-sm">Procesando...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm">Confirmar</span>
                      </>
                    )}
                </button>
                </div>

                {/* Desktop buttons */}
                <div className="hidden md:flex md:w-full md:gap-4">
                  <button
                    onClick={handleBackStep}
                    disabled={isProcessing}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Modificar Selección
                  </button>
                  <button
                    onClick={processSale}
                    disabled={isProcessing}
                    className={`flex-1 py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-3 ${
                      isProcessing
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white hover:scale-105 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
                        Procesando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-6 h-6" />
                        Confirmar Venta
                      </>
                    )}
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default SalesModal;