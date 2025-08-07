import React from 'react';
import { CheckCircle, Plus } from 'lucide-react';
import { Product } from '../types';

interface ProductSelectionCardProps {
  product: Product;
  isSelected: boolean;
  onToggleSelect: (product: Product) => void;
  formatPrice: (price: number) => string;
  getNumericPrice: (price: number | string) => number;
}

export const ProductSelectionCard: React.FC<ProductSelectionCardProps> = ({
  product,
  isSelected,
  onToggleSelect,
  formatPrice,
  getNumericPrice
}) => {
  const stock = product.stock || 0;

  return (
    <div
      className={`border-2 rounded-lg p-3 lg:p-2 transition-all duration-200 cursor-pointer hover:shadow-md ${
        isSelected 
          ? 'border-green-500 bg-green-50 shadow-sm' 
          : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
      }`}
      onClick={() => onToggleSelect(product)}
    >
      {/* Desktop 5-column layout vs Mobile horizontal layout */}
      <div className="flex md:flex-col items-center md:items-start gap-3 md:gap-2 ">
        <div className="relative flex-shrink-0 w-full h-full">
        <div className="flex items-center gap-2">
          <img
            src={product.image}
            alt={product.name}
            className="h-12 md:h-24 lg:h-20 w-20 object-cover rounded-lg shadow-soft flex-shrink-0"
          />
          <div className="flex flex-col min-w-0 flex-1">
          <h4 className="text-wrap font-bold text-gray-800 text-xs md:text-xs lg:text-sm mb-1 leading-tight break-words overflow-hidden text-ellipsis">
            {product.name}
          </h4>
          <p className="text-sm lg:text-sm text-green-600 font-semibold mb-2">
            ${formatPrice(getNumericPrice(product.price))}
          </p>
          </div>
        </div>
          <div className="mt-1 flex items-center justify-between md:justify-center lg:justify-between gap-2 ">
            <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${
              stock > 10 ? 'bg-green-100 text-green-800' :
              stock > 5 ? 'bg-yellow-100 text-yellow-800' :
              stock > 0 ? 'bg-orange-100 text-orange-800' :
              'bg-red-100 text-red-800'
            }`}>
              {stock}
            </span>
            <div className={`p-1.5 rounded-full transition-colors flex-shrink-0 ${
              isSelected 
                ? 'bg-green-500 text-white' 
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

export default ProductSelectionCard;