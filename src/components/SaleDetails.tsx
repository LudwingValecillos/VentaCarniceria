import React from 'react';
import { Calendar, Clock, Package2, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { SaleWithItems } from '../types';

interface SaleDetailsProps {
  saleDetails: SaleWithItems;
  loading: boolean;
}

const SaleDetails: React.FC<SaleDetailsProps> = ({ saleDetails, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <RefreshCw className="w-5 h-5 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500">Cargando detalles...</span>
      </div>
    );
  }
  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <h4 className="font-semibold text-gray-900 mb-3">Productos vendidos:</h4>
      <div className="space-y-2">
        {saleDetails.items.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <h5 className="font-medium text-gray-900">{item.productName}</h5>
              <p className="text-sm text-gray-600">
                {item.quantity} × ${item.unitPrice.toLocaleString('es-AR', { minimumFractionDigits: 2 })} = ${item.subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
              {item.category}
            </span>
          </div>
        ))}
      </div>
      {saleDetails.notes && (
        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Notas:</strong> {saleDetails.notes}
          </p>
        </div>
      )}
    </div>
  );
};

export default React.memo(SaleDetails);
