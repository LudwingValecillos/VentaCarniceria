import React, { useMemo, useState } from 'react';
import { Phone, Plus, MessageCircle, User, Briefcase, Copy, Search } from 'lucide-react';
import WhatsAppNumbersModal from './WhatsAppNumbersModal';
import { useWhatsAppNumbers } from '../hooks/useWhatsAppNumbers';
import { WhatsAppNumber } from '../types';

const WhatsAppNumbersManager: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { numbers, isLoading, error, save, load } = useWhatsAppNumbers();

  const ensure549 = (raw: string) => {
    const digits = (raw || '').replace(/\D/g, '');
    if (!digits) return '';
    if (digits.startsWith('549')) return digits;
    if (digits.startsWith('54')) return `549${digits.slice(2)}`;
    return `549${digits}`;
  };

  const handleWhatsAppClick = (num: WhatsAppNumber) => {
    const normalized = ensure549(num.number);
    window.open(`https://wa.me/${normalized}`, '_blank');
  };

  const handleOpenModal = async () => {
    // Recargar datos antes de abrir el modal
    await load();
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
    // Recargar datos después de cerrar el modal
    load();
  };

  const filtered = useMemo(() => {
    if (!query.trim()) return numbers;
    const q = query.toLowerCase();
    return numbers.filter(n =>
      n.name.toLowerCase().includes(q) ||
      n.role.toLowerCase().includes(q) ||
      ensure549(n.number).includes(q.replace(/\D/g, ''))
    );
  }, [numbers, query]);

  const copyNumber = async (n: WhatsAppNumber) => {
    const text = ensure549(n.number);
    try {
      await navigator.clipboard.writeText(text);
      // Naive toast
      alert(`Número copiado: ${text}`);
    } catch {
      alert('No se pudo copiar el número');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-500 p-3 md:p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Phone className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold">Números WhatsApp</h2>
              <p className="text-white/90 text-xs md:text-sm">Gestiona los números de contacto de tu carnicería</p>
            </div>
          </div>
          <button 
            onClick={handleOpenModal} 
            className="flex items-center text-xs md:text-sm gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-black/30 hover:bg-white/20 text-white rounded-lg transition-all duration-200 text-sm"
          >
            <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" /> Gestionar
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 md:p-6">
        <div className="mb-3 md:mb-4 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre, rol o número"
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
        

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-8 md:py-12">
            <div className="w-6 h-6 md:w-8 md:h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
            <span className="ml-2 md:ml-3 text-gray-600 text-sm md:text-base">Cargando números...</span>
          </div>
        ) : numbers.length === 0 ? (
          <div className="text-center py-8 md:py-12">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 md:w-10 md:h-10 text-gray-400" />
            </div>
            <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-2">No hay números registrados</h3>
            <p className="text-gray-600 mb-4 md:mb-6 max-w-md mx-auto text-sm">
              Agrega números de WhatsApp para que los clientes puedan contactarte fácilmente
            </p>
            <button 
              onClick={handleOpenModal} 
              className="flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 mx-auto text-sm"
            >
              <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" /> Agregar Primer Número
            </button>
          </div>
        ) : (
          <div className="space-y-3 md:space-y-4">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h3 className="text-base md:text-lg font-semibold text-gray-800">
                Números de Contacto ({filtered.length})
              </h3>
              <span className="text-xs md:text-sm text-gray-500">
                Haz clic en "Contactar" para abrir WhatsApp
              </span>
            </div>
            
            <div className="grid gap-3 md:gap-4">
              {filtered.map((num, i) => (
                <div key={i} className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-all duration-200">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm md:text-base">{num.name}</h4>
                      <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-gray-600">
                        <Briefcase className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        <span className="capitalize">{num.role}</span>
                      </div>
                      <p className="text-xs md:text-sm text-green-600 font-medium">{ensure549(num.number)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => copyNumber(num)} 
                      className="flex items-center gap-1 px-2 py-1.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 text-xs"
                      title="Copiar número"
                    >
                      <Copy className="w-3.5 h-3.5" /> Copiar
                    </button>
                    <button 
                      onClick={() => handleWhatsAppClick(num)} 
                      className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all duration-200 text-xs"
                    >
                      <MessageCircle className="w-3.5 h-3.5 md:w-4 md:h-4" /> Contactar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <WhatsAppNumbersModal 
        isOpen={open} 
        onClose={handleCloseModal} 
        numbers={numbers} 
        onSave={save} 
        isLoading={isLoading} 
      />
    </div>
  );
};

export default WhatsAppNumbersManager;
