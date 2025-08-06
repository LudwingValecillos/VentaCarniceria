import React from 'react';
import { X, Package } from 'lucide-react';
import { QuantityControl } from './QuantityControl';

interface StockItem {
  id: string;
  name: string;
  image: string;
  price: number | string;
  stock?: number;
  stockToAdd: number;
}

interface StockItemCardProps {
  item: StockItem;
  tempQuantityInputs: Map<string, string>;
  isProcessing: boolean;
  onQuantityUpdate: (productId: string, quantity: number) => void;
  onTempQuantityChange: (productId: string, value: string) => void;
  onQuantityInputBlur: (productId: string, value: string) => void;
  onClearTemp: (productId: string) => void;
  onRemoveItem: (productId: string) => void;
  formatPrice: (price: number | string) => string;
  getNumericPrice: (price: number | string) => number;
  validateQuantityInput: (value: string) => boolean;
  isCompact?: boolean;
}

export const StockItemCard: React.FC<StockItemCardProps> = ({
  item,
  tempQuantityInputs,
  isProcessing,
  onQuantityUpdate,
  onTempQuantityChange,
  onQuantityInputBlur,
  onClearTemp,
  onRemoveItem,
  formatPrice,
  getNumericPrice,
  validateQuantityInput,
  isCompact = false
}) => {
  const currentStock = item.stock || 0;
  const newStock = currentStock + item.stockToAdd;
  const tempValue = tempQuantityInputs.get(item.id);

  if (isCompact) {
    // Desktop compact version
    return (
      <div className="bg-white rounded-lg border-2 border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
        {/* Product Info - Compact */}
        <div className="p-3 border-b border-gray-100">
          <div className="flex items-start justify-between gap-1 mb-2">
            <h4 className="font-bold text-gray-800 text-xs lg:text-sm leading-tight line-clamp-2 flex-1">
              {item.name}
            </h4>
            <button
              onClick={() => onRemoveItem(item.id)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors flex-shrink-0"
              disabled={isProcessing}
              title="Eliminar"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <p className="text-blue-600 font-semibold text-xs mb-1">
            ${formatPrice(getNumericPrice(item.price))}
          </p>
          <span className="text-xs text-gray-500">
            Stock: {currentStock}
          </span>
        </div>

        {/* Quantity Controls - Compact */}
        <div className="p-3 space-y-2">
          <label className="block text-xs font-medium text-gray-700">
            Agregar:
          </label>
          <QuantityControl
            quantity={item.stockToAdd}
            maxStock={999} // Sin límite máximo para agregar stock
            onQuantityChange={(quantity) => onQuantityUpdate(item.id, quantity)}
            tempValue={tempValue}
            onTempValueChange={(value) => onTempQuantityChange(item.id, value)}
            onInputBlur={(value) => onQuantityInputBlur(item.id, value)}
            onClearTemp={() => onClearTemp(item.id)}
            isProcessing={isProcessing}
            isCompact={true}
            validateInput={validateQuantityInput}
          />
          
          {/* New Stock Display - Compact */}
          <div className="bg-blue-50 border border-blue-200 rounded p-2">
            <div className="text-center">
              <span className="text-xs font-medium text-blue-700 block">Nuevo Stock</span>
              <span className="text-sm font-bold text-blue-600">
                {currentStock} + {item.stockToAdd} = {newStock}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mobile version
  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
      {/* Mobile Product Header */}
      <div className="p-3 border-b border-gray-100">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Image only on mobile */}
            <img
              src={item.image}
              alt={item.name}
              className="w-12 h-12 object-cover rounded-lg shadow-sm flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-gray-800 text-base mb-1 leading-tight line-clamp-2">
                {item.name}
              </h4>
              <p className="text-blue-600 font-semibold text-sm mb-1">
                ${formatPrice(getNumericPrice(item.price))}
              </p>
              <span className="text-xs text-gray-500">
                Stock actual: <span className="font-medium text-gray-700">{currentStock}</span>
              </span>
            </div>
          </div>
          <button
            onClick={() => onRemoveItem(item.id)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors flex-shrink-0"
            disabled={isProcessing}
            title="Eliminar producto"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Quantity Controls */}
      <div className="p-3 space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Cantidad a agregar:
          </label>
          <QuantityControl
            quantity={item.stockToAdd}
            maxStock={999} // Sin límite máximo para agregar stock
            onQuantityChange={(quantity) => onQuantityUpdate(item.id, quantity)}
            tempValue={tempValue}
            onTempValueChange={(value) => onTempQuantityChange(item.id, value)}
            onInputBlur={(value) => onQuantityInputBlur(item.id, value)}
            onClearTemp={() => onClearTemp(item.id)}
            isProcessing={isProcessing}
            isCompact={false}
            validateInput={validateQuantityInput}
          />
        </div>
        
        {/* Mobile New Stock Display */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-blue-700 block">Stock resultante:</span>
              <span className="text-xs text-blue-600">
                {currentStock} + {item.stockToAdd} unidades
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-600" />
              <span className="text-lg font-bold text-blue-600">
                {newStock}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockItemCard;