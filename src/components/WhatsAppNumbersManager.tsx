import React, { useState } from 'react';
import { Phone, Plus, MessageCircle, User, Briefcase } from 'lucide-react';
import WhatsAppNumbersModal from './WhatsAppNumbersModal';
import { useWhatsAppNumbers } from '../hooks/useWhatsAppNumbers';
import { WhatsAppNumber } from '../types';

const WhatsAppNumbersManager: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { numbers, isLoading, error, save, load } = useWhatsAppNumbers();

  const handleWhatsAppClick = (num: WhatsAppNumber) => {
  window.open(`https://api.whatsapp.com/send/?phone=549${num.number}`, '_blank');
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

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-500 p-4 md:p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Números WhatsApp</h2>
              <p className="text-white/90 text-sm">Gestiona los números de contacto de tu carnicería</p>
            </div>
          </div>
          <button 
            onClick={handleOpenModal} 
            className="flex items-center gap-2 px-4 py-2 bg-black/30 hover:bg-white/20 text-white rounded-lg transition-all duration-200"
          >
            <Plus className="w-4 h-4" /> Gestionar
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-6">
        

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
            <span className="ml-3 text-gray-600">Cargando números...</span>
          </div>
        ) : numbers.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No hay números registrados</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Agrega números de WhatsApp para que los clientes puedan contactarte fácilmente
            </p>
            <button 
              onClick={handleOpenModal} 
              className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 mx-auto"
            >
              <Plus className="w-4 h-4" /> Agregar Primer Número
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Números de Contacto ({numbers.length})
              </h3>
              <span className="text-sm text-gray-500">
                Haz clic en "Contactar" para abrir WhatsApp
              </span>
            </div>
            
            <div className="grid gap-4">
              {numbers.map((num, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-all duration-200">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{num.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Briefcase className="w-4 h-4" />
                        <span className="capitalize">{num.role}</span>
                      </div>
                      <p className="text-sm text-green-600 font-medium">{num.number}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleWhatsAppClick(num)} 
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all duration-200"
                  >
                    <MessageCircle className="w-4 h-4" /> Contactar
                  </button>
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
