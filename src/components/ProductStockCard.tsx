import React from 'react';
import { CheckCircle, Plus } from 'lucide-react';
import { Product } from '../types';

interface ProductStockCardProps {
  product: Product;
  isSelected: boolean;
  onToggleSelect: (product: Product) => void;
  formatPrice: (price: number | string) => string;
  getNumericPrice: (price: number | string) => number;
}

export const ProductStockCard: React.FC<ProductStockCardProps> = ({
  product,
  isSelected,
  onToggleSelect,
  formatPrice,
  getNumericPrice
}) => {
  const currentStock = product.stock || 0;

  return (
    <div
      className={`border-2 rounded-lg p-3 lg:p-2 transition-all duration-200 cursor-pointer hover:shadow-md ${
        isSelected 
          ? 'border-blue-500 bg-blue-50 shadow-sm' 
          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
      }`}
      onClick={() => onToggleSelect(product)}
    >
      {/* Desktop 5-column layout vs Mobile horizontal layout */}
      <div className="flex md:flex-col items-center md:items-start gap-3 md:gap-2">
        <div className="relative flex-shrink-0">
          <img
            src={product.image}
            alt={product.name}
            className="w-12 h-12 md:w-full md:h-24 lg:h-20 object-cover rounded-lg shadow-soft"
          />
          {isSelected && (
            <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-0.5">
              <CheckCircle className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
        <div className="flex-1 md:w-full min-w-0">
          <h4 className="font-bold text-gray-800 text-sm md:text-xs lg:text-sm mb-1 leading-tight line-clamp-2">
            {product.name}
          </h4>
          <p className="text-sm md:text-xs lg:text-sm text-blue-600 font-semibold mb-2">
            ${formatPrice(getNumericPrice(product.price))}
          </p>
          <div className="flex items-center justify-between md:justify-center lg:justify-between gap-2">
            <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${
              currentStock > 10 ? 'bg-green-100 text-green-800' :
              currentStock > 5 ? 'bg-yellow-100 text-yellow-800' :
              currentStock > 0 ? 'bg-orange-100 text-orange-800' :
              'bg-red-100 text-red-800'
            }`}>
              {currentStock}
            </span>
            <div className={`p-1.5 rounded-full transition-colors flex-shrink-0 ${
              isSelected 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-400'
            }`}>
              {isSelected ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductStockCard;