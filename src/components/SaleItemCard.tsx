import React from 'react';
import { X, AlertCircle } from 'lucide-react';
import { QuantityControl } from './QuantityControl';

interface SaleItem {
  id: string;
  name: string;
  price: number | string;
  stock?: number;
  saleQuantity: number;
  saleTotal: number;
}

interface SaleItemCardProps {
  item: SaleItem;
  tempQuantityInputs: Map<string, string>;
  isProcessing: boolean;
  onQuantityUpdate: (productId: string, quantity: number) => void;
  onTempQuantityChange: (productId: string, value: string) => void;
  onQuantityInputBlur: (productId: string, value: string) => void;
  onClearTemp: (productId: string) => void;
  onRemoveItem: (productId: string) => void;
  formatPrice: (price: number) => string;
  getNumericPrice: (price: number | string) => number;
  validateQuantityInput: (value: string) => boolean;
  isCompact?: boolean;
}

export const SaleItemCard: React.FC<SaleItemCardProps> = ({
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
  const maxStock = item.stock || 0;
  const isAtMaxStock = item.saleQuantity >= maxStock;
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
          <p className="text-green-600 font-semibold text-xs mb-1">
            ${formatPrice(getNumericPrice(item.price))}
          </p>
          <span className="text-xs text-gray-500">
            Stock: {maxStock}
          </span>
        </div>

        {/* Quantity Controls - Compact */}
        <div className="p-3 space-y-2">
          <label className="block text-xs font-medium text-gray-700">
            Cantidad:
          </label>
          <QuantityControl
            quantity={item.saleQuantity}
            maxStock={maxStock}
            onQuantityChange={(quantity) => onQuantityUpdate(item.id, quantity)}
            tempValue={tempValue}
            onTempValueChange={(value) => onTempQuantityChange(item.id, value)}
            onInputBlur={(value) => onQuantityInputBlur(item.id, value)}
            onClearTemp={() => onClearTemp(item.id)}
            isProcessing={isProcessing}
            isCompact={true}
            validateInput={validateQuantityInput}
          />

          {/* Stock Warning - Compact */}
          {isAtMaxStock && (
            <div className="flex items-center gap-1 p-1 bg-yellow-50 border border-yellow-200 rounded">
              <AlertCircle className="w-3 h-3 text-yellow-600 flex-shrink-0" />
              <span className="text-xs text-yellow-700 font-medium">
                Máximo
              </span>
            </div>
          )}
          
          {/* Subtotal - Compact */}
          <div className="bg-green-50 border border-green-200 rounded p-2">
            <div className="text-center">
              <span className="text-xs font-medium text-green-700 block">Subtotal</span>
              <span className="text-sm font-bold text-green-600">
                ${formatPrice(item.saleTotal)}
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
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-gray-800 text-base mb-1 leading-tight line-clamp-2">
              {item.name}
            </h4>
            <p className="text-green-600 font-semibold text-sm mb-1">
              ${formatPrice(getNumericPrice(item.price))}/unidad
            </p>
            <span className="text-xs text-gray-500">
              Stock: <span className="font-medium text-gray-700">{maxStock}</span>
            </span>
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
            Cantidad:
          </label>
          <QuantityControl
            quantity={item.saleQuantity}
            maxStock={maxStock}
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

        {/* Mobile Stock Warning */}
        {isAtMaxStock && (
          <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
            <span className="text-xs text-yellow-700 font-medium">
              Stock máximo alcanzado
            </span>
          </div>
        )}
        
        {/* Mobile Total Price */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-green-700 block">Subtotal:</span>
              <span className="text-xs text-green-600">
                {item.saleQuantity} × ${formatPrice(getNumericPrice(item.price))}
              </span>
            </div>
            <span className="text-lg font-bold text-green-600">
              ${formatPrice(item.saleTotal)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaleItemCard;