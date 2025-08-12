import { useState, useEffect, useMemo } from 'react';
import StatCard from './StatCard';
import { formatPrice, formatDate, formatTime } from '../utils/format';
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  Package2, 
  ChevronDown, 
  ChevronUp,
  RefreshCw,
  CheckCircle,
  Clock3,
  XCircle,
  Search,
  TrendingUp,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Sale, SaleWithItems } from '../types';
import { fetchSalesHistory, fetchSaleDetails, updateSaleStatusAPI } from '../data/api';
import { useProductContext } from '../context/ProductContext';
import { toast } from 'react-toastify';

export const SalesHistory: React.FC = () => {
  const { state, updateProductStockAction, fetchProductsAction } = useProductContext();
  const [sales, setSales] = useState<Sale[]>([]);
  const [expandedSales, setExpandedSales] = useState<Map<string, SaleWithItems>>(new Map());
  const [loading, setLoading] = useState(true);
  const [loadingSaleDetails, setLoadingSaleDetails] = useState<Set<string>>(new Set());
  const [updatingStatus, setUpdatingStatus] = useState<Set<string>>(new Set());
  
  // Filters - Cambiar por defecto a 'today'
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('today'); // Cambiado de 'all' a 'today'
  const [searchTerm, setSearchTerm] = useState('');

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // ...formato ahora importado de utils/format...

  // Obtener rango de fechas basado en el filtro
  const getDateRange = (filter: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
   
    
    switch (filter) {
      case 'today': {
        const endDate = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1); // End of today
       
        return { startDate: today, endDate };
      }
      case 'week': {
        const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
       
        return { startDate: weekStart, endDate: now };
      }
      case 'month': {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
       
        return { startDate: monthStart, endDate: now };
      }
      default:
       
        return { startDate: undefined, endDate: undefined };
    }
  };

  // Cargar historial de ventas
  const loadSalesHistory = async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange(dateFilter);
      // Solo filtrar por fecha en la consulta, nunca por status

      const salesData = await fetchSalesHistory(100, startDate, endDate, undefined);
     
      setSales(salesData);
      setCurrentPage(1); // Resetear a la primera página cuando cambien los filtros
    } catch (error) {
      console.error('Error loading sales history:', error);
    } finally {
      setLoading(false);
    }
  };

  // Alternar detalles de venta
  const toggleSaleDetails = async (saleId: string) => {
    if (expandedSales.has(saleId)) {
      // Colapsar
      setExpandedSales(prev => {
        const newMap = new Map(prev);
        newMap.delete(saleId);
        return newMap;
      });
    } else {
      // Expandir - cargar detalles
      setLoadingSaleDetails(prev => new Set(prev.add(saleId)));
      
      try {
        const saleWithItems = await fetchSaleDetails(saleId);
        setExpandedSales(prev => new Map(prev.set(saleId, saleWithItems)));
      } catch (error) {
        console.error('Error loading sale details:', error);
      } finally {
        setLoadingSaleDetails(prev => {
          const newSet = new Set(prev);
          newSet.delete(saleId);
          return newSet;
        });
      }
    }
  };

  // Actualizar estado de venta con manejo de stock
  const updateSaleStatus = async (saleId: string, newStatus: 'completed' | 'pending' | 'cancelled') => {
    const currentSale = sales.find(sale => sale.id === saleId);
    if (!currentSale) return;
    
    const currentStatus = currentSale.status;
    
    // Los cambios de estado se procesan directamente sin confirmaciones
    
    setUpdatingStatus(prev => new Set(prev.add(saleId)));
    
    try {
      const result = await updateSaleStatusAPI(saleId, newStatus, currentStatus);
      
      // Si necesita actualización de stock, procesarla
      if (result.needsStockUpdate && result.saleItems) {
        const stockPromises = result.saleItems.map(async (item) => {
          try {
            // Obtener el producto actual para conocer su stock
            const currentStock = await getCurrentProductStock(item.productId);
            let newStock: number;
            
            if (result.shouldDeductStock) {
              // Descontar del stock (pendiente/cancelado -> completado)
              newStock = Math.max(0, currentStock - item.quantity);
             
            } else {
              // Restaurar al stock (completado -> pendiente/cancelado)
              newStock = currentStock + item.quantity;
             
            }
            
            await updateProductStockAction(item.productId, newStock);
          } catch (error) {
            console.error(`Error updating stock for product ${item.productId}:`, error);
            throw error;
          }
        });
        
        await Promise.all(stockPromises);
        
        // Refrescar productos para mostrar stock actualizado
        await fetchProductsAction();
        
        // Toast único informando el cambio completo
        const actionText = result.shouldDeductStock ? 'descontado' : 'restaurado';
        toast.success(`Estado actualizado - Stock ${actionText}`, {
          position: "top-right",
          autoClose: 2000,
        });
      } else {
        // Solo cambio de estado sin afectar stock
        toast.success('Estado actualizado', {
          position: "top-right",
          autoClose: 2000,
        });
      }
      
      // Actualizar en el estado local
      setSales(prev => prev.map(sale => 
        sale.id === saleId ? { ...sale, status: newStatus } : sale
      ));
      
      // Actualizar en expandedSales también
      setExpandedSales(prev => {
        const newMap = new Map(prev);
        const expandedSale = newMap.get(saleId);
        if (expandedSale) {
          newMap.set(saleId, { ...expandedSale, status: newStatus });
        }
        return newMap;
      });
      
    } catch (error) {
      console.error('Error updating sale status:', error);
      toast.error('Error al actualizar estado', {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setUpdatingStatus(prev => {
        const newSet = new Set(prev);
        newSet.delete(saleId);
        return newSet;
      });
    }
  };

  // Función auxiliar para obtener el stock actual de un producto
  const getCurrentProductStock = async (productId: string): Promise<number> => {
    try {
      // Buscar el producto en el estado actual
      const product = state.products.find(p => p.id === productId);
      
      if (product) {
        return product.stock || 0;
      }
      
      // Si no se encuentra, refrescar productos y buscar de nuevo
      await fetchProductsAction();
      const refreshedProduct = state.products.find(p => p.id === productId);
      
      if (refreshedProduct) {
        return refreshedProduct.stock || 0;
      }
      
      console.warn(`Product with ID ${productId} not found`);
      return 0;
    } catch (error) {
      console.error('Error getting current product stock:', error);
      return 0;
    }
  };

  // Filtrar ventas por status y búsqueda (el filtro de fecha ya se aplica en la petición)
  const filteredSales = useMemo(() => {
    let filtered = sales;
    if (statusFilter !== 'all') {
      filtered = filtered.filter(sale => sale.status === statusFilter);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(sale => 
        sale.id.toLowerCase().includes(term) ||
        sale.totalAmount.toString().includes(term) ||
        formatDate(sale.date).includes(term)
      );
    }
    return filtered;
  }, [sales, statusFilter, searchTerm]);

  // Estadísticas: solo dependen del filtro de fecha (no del status ni búsqueda)
  const stats = useMemo(() => {
    const totalSales = sales.length;
    const completedSalesData = sales.filter(sale => sale.status === 'completed');
    const completedSales = completedSalesData.length;
    const totalAmount = completedSalesData.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const avgSale = completedSales > 0 ? totalAmount / completedSales : 0;
    const pendingSales = sales.filter(sale => sale.status === 'pending').length;
    const cancelledSales = sales.filter(sale => sale.status === 'cancelled').length;
    return {
      totalSales,
      totalAmount,
      completedSales,
      pendingSales,
      cancelledSales,
      avgSale
    };
  }, [sales]);

  // Paginación de ventas filtradas
  const paginatedSales = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredSales.slice(startIndex, endIndex);
  }, [filteredSales, currentPage]);

  // Calcular información de paginación
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const hasPagination = filteredSales.length > itemsPerPage;

  // Obtener color de estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };


  // Cargar datos al montar y cuando cambien los filtros
  useEffect(() => {
    loadSalesHistory();
  }, [statusFilter, dateFilter]);

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <StatCard
          icon={<TrendingUp className="w-5 h-5 text-blue-600" />}
          label="Total Ventas"
          value={stats.totalSales}
          subLabel="Todas las ventas"
        />
        <StatCard
          icon={<DollarSign className="w-5 h-5 text-green-600" />}
          label="Ingresos Reales"
          value={`$${formatPrice(stats.totalAmount)}`}
          subLabel="✓ Solo completadas"
          colorClass="text-green-600"
        />
        <StatCard
          icon={<CheckCircle className="w-5 h-5 text-green-600" />}
          label="Completadas"
          value={stats.completedSales}
          subLabel="Con stock descontado"
          colorClass="text-green-600"
        />
        <StatCard
          icon={<Clock3 className="w-5 h-5 text-yellow-600" />}
          label="Pendientes"
          value={stats.pendingSales}
          subLabel="Sin afectar stock"
          colorClass="text-yellow-600"
        />
        <StatCard
          icon={<XCircle className="w-5 h-5 text-red-600" />}
          label="Canceladas"
          value={stats.cancelledSales}
          subLabel="Stock restaurado"
          colorClass="text-red-600"
        />
        <StatCard
          icon={<Package2 className="w-5 h-5 text-purple-600" />}
          label="Promedio"
          value={`$${formatPrice(stats.avgSale)}`}
          subLabel="Por venta completada"
          colorClass="text-purple-600"
        />
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white p-4 md:p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full md:w-auto">
            {/* Búsqueda */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar ventas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filtro de estado */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos los estados</option>
              <option value="completed" className="bg-green-100 text-green-800">Completadas</option>
              <option value="pending" className="bg-yellow-100 text-yellow-800">Pendientes</option>
              <option value="cancelled" className="bg-red-100 text-red-800">Canceladas</option>
            </select>

            {/* Filtro de fecha - Mantener todas las opciones */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="today">Hoy</option>
              <option value="week">Última semana</option>
              <option value="month">Este mes</option>
              <option value="all">Todas las fechas</option>
            </select>
          </div>

          {/* Botón de actualizar */}
          <button
            onClick={loadSalesHistory}
            disabled={loading}
            className="flex gap-2 w-full md:w-auto  bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''} `} />
            Actualizar
          </button>

        </div>
      </div>

      {/* Lista de ventas */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
            <p className="text-gray-500">Cargando historial de ventas...</p>
          </div>
        ) : filteredSales.length === 0 ? (
          <div className="text-center py-12">
            <Package2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay ventas</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' || dateFilter !== 'today' 
                ? 'No se encontraron ventas con los filtros seleccionados'
                : 'Aún no se han registrado ventas hoy'
              }
            </p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-200">
              {paginatedSales.map((sale) => {
                const isExpanded = expandedSales.has(sale.id);
                const isLoadingDetails = loadingSaleDetails.has(sale.id);
                const isUpdating = updatingStatus.has(sale.id);
                const saleDetails = expandedSales.get(sale.id);

                return (
                  <div key={sale.id} className="p-4 md:p-6 hover:bg-gray-50 transition-colors">
                    {/* Header de la venta */}
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-sm font-semibold text-gray-900 ">
                            {sale.id}
                          </h3>
                          
                          <div className="flex items-center gap-2">
                            <select
                              value={sale.status}
                              onChange={(e) => updateSaleStatus(sale.id, e.target.value as 'completed' | 'pending' | 'cancelled')}
                              disabled={isUpdating}
                              className={`px-2 py-1 border rounded text-xs font-medium transition-colors ${getStatusColor(sale.status)} ${
                                isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'
                              }`}
                            >
                              <option value="completed">Completada</option>
                              <option value="pending">Pendiente</option>
                              <option value="cancelled">Cancelada</option>
                            </select>
                            {isUpdating && (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(sale.date)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatTime(sale.date)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Package2 className="w-4 h-4" />
                            {sale.totalItems} producto{sale.totalItems !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">
                            ${formatPrice(sale.totalAmount)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {sale.totalQuantity} unidad{sale.totalQuantity !== 1 ? 'es' : ''}
                          </p>
                        </div>
                        
                        <button
                          onClick={() => toggleSaleDetails(sale.id)}
                          disabled={isLoadingDetails}
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {isLoadingDetails ? (
                            <RefreshCw className="w-5 h-5 animate-spin" />
                          ) : isExpanded ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Detalles expandidos */}
                    {isExpanded && saleDetails && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-3">Productos vendidos:</h4>
                        <div className="space-y-2">
                          {saleDetails.items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex-1">
                                <h5 className="font-medium text-gray-900">{item.productName}</h5>
                                <p className="text-sm text-gray-600">
                                  {item.quantity} × ${formatPrice(item.unitPrice)} = ${formatPrice(item.subtotal)}
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
                    )}
                  </div>
                );
              })}
            </div>

            {/* Paginación */}
            {hasPagination && (
              <div className="flex items-center justify-between px-4 py-4 border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredSales.length)} de {filteredSales.length} ventas
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Anterior
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-1 text-sm rounded-md ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SalesHistory;