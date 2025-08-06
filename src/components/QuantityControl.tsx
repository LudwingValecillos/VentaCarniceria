import React from 'react';
import { Plus, Minus } from 'lucide-react';

interface QuantityControlProps {
  quantity: number;
  maxStock: number;
  onQuantityChange: (quantity: number) => void;
  tempValue?: string;
  onTempValueChange?: (value: string) => void;
  onInputBlur?: (value: string) => void;
  onClearTemp?: () => void;
  isProcessing?: boolean;
  isCompact?: boolean;
  validateInput?: (value: string) => boolean;
}

export const QuantityControl: React.FC<QuantityControlProps> = ({
  quantity,
  maxStock,
  onQuantityChange,
  tempValue,
  onTempValueChange,
  onInputBlur,
  onClearTemp,
  isProcessing = false,
  isCompact = false,
  validateInput
}) => {
  const handleDecrease = () => {
    const newQuantity = Math.max(0.5, quantity - 0.5);
    onQuantityChange(newQuantity);
    // Limpiar el valor temporal para que se muestre el nuevo valor
    onClearTemp?.();
  };

  const handleIncrease = () => {
    const newQuantity = quantity + 0.5;
    onQuantityChange(newQuantity);
    // Limpiar el valor temporal para que se muestre el nuevo valor
    onClearTemp?.();
  };

  const inputValue = tempValue !== undefined ? tempValue : quantity.toString();

  if (isCompact) {
    // Desktop compact version
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={handleDecrease}
          className="bg-red-100 hover:bg-red-200 text-red-600 p-1 rounded transition-colors flex-shrink-0"
          disabled={isProcessing || quantity <= 0.5}
        >
          <Minus className="w-3 h-3" />
        </button>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            const value = e.target.value;
            if (!validateInput || validateInput(value)) {
              onTempValueChange?.(value);
            }
          }}
          onBlur={(e) => onInputBlur?.(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.currentTarget.blur();
            }
          }}
          className="font-bold text-sm w-full text-center bg-gray-50 border border-gray-300 px-1 py-1 rounded focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors"
          disabled={isProcessing}
          placeholder="1.0"
        />
        <button
          onClick={handleIncrease}
          className="bg-green-100 hover:bg-green-200 text-green-600 p-1 rounded transition-colors flex-shrink-0"
          disabled={isProcessing || quantity >= maxStock}
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
    );
  }

  // Mobile/regular version
  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={handleDecrease}
        className="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-lg transition-colors flex-shrink-0 shadow-sm hover:shadow-md"
        disabled={isProcessing || quantity <= 0.5}
      >
        <Minus className="w-4 h-4" />
      </button>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => {
          const value = e.target.value;
          if (!validateInput || validateInput(value)) {
            onTempValueChange?.(value);
          }
        }}
        onBlur={(e) => onInputBlur?.(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.currentTarget.blur();
          }
        }}
        className="font-bold text-lg w-20 text-center bg-gray-50 border-2 border-gray-300 px-2 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors hover:border-green-400 shadow-sm"
        disabled={isProcessing}
        placeholder="1.0"
      />
      <button
        onClick={handleIncrease}
        className="bg-green-100 hover:bg-green-200 text-green-600 p-2 rounded-lg transition-colors flex-shrink-0 shadow-sm hover:shadow-md"
        disabled={isProcessing || quantity >= maxStock}
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
};

export default QuantityControl;